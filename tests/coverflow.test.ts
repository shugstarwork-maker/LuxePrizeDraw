import { test } from "node:test";
import assert from "node:assert/strict";
import { coverflowOffset } from "../src/components/coverflow";

test("coverflow keeps one centre and wraps adjacent cards across the boundary", () => {
  for (const count of [1, 2, 3, 7, 9]) {
    for (let active = 0; active < count; active++) {
      const offsets = Array.from({ length: count }, (_, i) => coverflowOffset(i, active, count));
      assert.equal(offsets.filter(value => value === 0).length, 1);
      assert.equal(offsets[active], 0);
      assert.equal(new Set(offsets).size, count);
    }
  }
  assert.equal(coverflowOffset(0, 6, 7), 1);
  assert.equal(coverflowOffset(6, 0, 7), -1);
});
