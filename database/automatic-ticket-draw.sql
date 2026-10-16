-- Review migration only. Apply after prize-draw-schema.sql in an isolated test DB first.
-- No public endpoint or scheduler is enabled by this migration.
BEGIN;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS prize_auto_draws (
  draw_id TEXT PRIMARY KEY REFERENCES prize_draws(id),
  approved BOOLEAN NOT NULL DEFAULT FALSE,
  due_at TIMESTAMPTZ,
  pool_hash TEXT,
  winning_entry_id UUID REFERENCES prize_entries(id),
  drawn_at TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS prize_auto_draw_pool (
  draw_id TEXT NOT NULL REFERENCES prize_auto_draws(draw_id),
  entry_id UUID NOT NULL REFERENCES prize_entries(id),
  PRIMARY KEY(draw_id, entry_id)
);
CREATE TABLE IF NOT EXISTS prize_auto_draw_events (
  id BIGSERIAL PRIMARY KEY, draw_id TEXT NOT NULL REFERENCES prize_auto_draws(draw_id),
  event_type TEXT NOT NULL, detail JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  UNIQUE(draw_id, event_type)
);
-- All future ticket writers MUST acquire this same draw-row lock before inserting,
-- changing eligibility, refunding, or cancelling. Paid/free entries share one pool.
CREATE OR REPLACE FUNCTION advance_prize_auto_draw(p_draw_id TEXT)
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE d prize_draws%ROWTYPE; a prize_auto_draws%ROWTYPE;
  n BIGINT; h TEXT; pick BIGINT; cutoff NUMERIC; bytes BYTEA; winner UUID;
BEGIN
  SELECT * INTO d FROM prize_draws WHERE id = p_draw_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'NO_DRAW'; END IF;
  SELECT * INTO a FROM prize_auto_draws WHERE draw_id = p_draw_id FOR UPDATE;
  IF NOT FOUND OR NOT a.approved THEN RETURN 'APPROVAL_PENDING'; END IF;
  IF a.winning_entry_id IS NOT NULL THEN RETURN 'DRAWN'; END IF;
  IF d.status = 'OPEN' AND a.due_at IS NULL THEN
    IF d.closes_at <= clock_timestamp() THEN RETURN 'DEADLINE_REVIEW_REQUIRED'; END IF;
    INSERT INTO prize_auto_draw_pool(draw_id, entry_id)
      SELECT p_draw_id, e.id FROM prize_entries e
      LEFT JOIN prize_payments p ON p.id = e.payment_id
      WHERE e.draw_id = p_draw_id AND e.status = 'ELIGIBLE'
        AND (e.route = 'FREE' OR (p.payment_status = 'SUCCEEDED'
          AND p.draw_id = e.draw_id AND p.account_id = e.account_id));
    SELECT count(*), encode(digest(string_agg(entry_id::text, ':' ORDER BY entry_id), 'sha256'), 'hex')
      INTO n, h FROM prize_auto_draw_pool WHERE draw_id = p_draw_id;
    IF n < d.maximum_entries THEN
      DELETE FROM prize_auto_draw_pool WHERE draw_id = p_draw_id;
      RETURN 'SELLING';
    END IF;
    IF n <> d.maximum_entries THEN RAISE EXCEPTION 'OVER_CAPACITY_REQUIRES_REVIEW'; END IF;
    UPDATE prize_draws SET status = 'CLOSED', closed_at = clock_timestamp() WHERE id = p_draw_id;
    UPDATE prize_auto_draws SET due_at = clock_timestamp() + interval '10 seconds', pool_hash = h WHERE draw_id = p_draw_id;
    INSERT INTO prize_auto_draw_events(draw_id,event_type,detail)
      VALUES(p_draw_id,'COUNTDOWN_STARTED',jsonb_build_object('tickets',n,'poolHash',h));
    RETURN 'COUNTDOWN';
  END IF;
  IF d.status <> 'CLOSED' OR a.due_at IS NULL THEN RETURN 'NOT_READY'; END IF;
  IF clock_timestamp() < a.due_at THEN RETURN 'COUNTDOWN'; END IF;
  -- Revalidate the frozen pool; a refund/eligibility change halts rather than rerolls.
  IF EXISTS (SELECT 1 FROM prize_auto_draw_pool s JOIN prize_entries e ON e.id=s.entry_id
    LEFT JOIN prize_payments p ON p.id=e.payment_id WHERE s.draw_id=p_draw_id
    AND (e.status <> 'ELIGIBLE' OR (e.route='PAID' AND
      (p.id IS NULL OR p.payment_status <> 'SUCCEEDED' OR p.draw_id <> e.draw_id OR p.account_id <> e.account_id))))
    THEN RETURN 'POOL_REVIEW_REQUIRED'; END IF;
  SELECT count(*), encode(digest(string_agg(entry_id::text, ':' ORDER BY entry_id), 'sha256'), 'hex')
    INTO n, h FROM prize_auto_draw_pool WHERE draw_id=p_draw_id;
  IF h IS DISTINCT FROM a.pool_hash THEN RAISE EXCEPTION 'POOL_HASH_MISMATCH'; END IF;
  IF n <> d.maximum_entries OR n = 0 THEN RAISE EXCEPTION 'INVALID_POOL'; END IF;
  -- Uniform 48-bit rejection sampling; no modulo bias and no browser-supplied seed.
  cutoff := floor(281474976710656::numeric / n) * n;
  LOOP
    bytes := gen_random_bytes(6); pick := 0;
    FOR i IN 0..5 LOOP pick := pick * 256 + get_byte(bytes,i); END LOOP;
    EXIT WHEN pick < cutoff;
  END LOOP;
  SELECT entry_id INTO winner FROM prize_auto_draw_pool WHERE draw_id=p_draw_id ORDER BY entry_id OFFSET (pick % n) LIMIT 1;
  UPDATE prize_auto_draws SET winning_entry_id=winner, drawn_at=clock_timestamp() WHERE draw_id=p_draw_id;
  UPDATE prize_entries SET status='WINNER' WHERE id=winner;
  UPDATE prize_draws SET status='DRAWN',drawn_at=clock_timestamp() WHERE id=p_draw_id;
  INSERT INTO prize_auto_draw_events(draw_id,event_type,detail)
    VALUES(p_draw_id,'WINNER_SELECTED',jsonb_build_object('entryId',winner,'tickets',n,'poolHash',a.pool_hash,'method','pgcrypto-48bit-rejection-v1'));
  RETURN 'DRAWN';
END $$;
REVOKE ALL ON FUNCTION advance_prize_auto_draw(TEXT) FROM PUBLIC;
COMMIT;
