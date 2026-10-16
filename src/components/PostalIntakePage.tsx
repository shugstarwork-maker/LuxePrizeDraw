import React, { useRef, useState } from "react";
import { ArrowLeft, Camera, Download, FileUp, ScanLine, Save, LockKeyhole } from "lucide-react";
import { parseEntrySlip } from "../../api/postal-entries/shared";

const navigate = (href: string) => {
  window.history.pushState({}, "", href);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo({ top: 0, behavior: "smooth" });
};

type FormState = { drawName: string; fullName: string; address: string; email: string; phone: string; batchRef: string; notes: string };
const emptyForm: FormState = { drawName: "Headline draw", fullName: "", address: "", email: "", phone: "", batchRef: "", notes: "" };

// Internal postal-entry intake: photograph or upload a received entry slip,
// OCR it in the browser, confirm the parsed fields, then save to the secured
// postal-entries register. Unlisted route — team only, never linked publicly.
export const PostalIntakePage: React.FC = () => {
  const [token, setToken] = useState(() => localStorage.getItem("lpd-intake-token") ?? "");
  const [imageName, setImageName] = useState("");
  const [ocrText, setOcrText] = useState("");
  const [ocrBusy, setOcrBusy] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [entries, setEntries] = useState<{ id: string; fullName: string; drawName: string; status: string; createdAt: string }[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const runOcr = async (file: File) => {
    setImageName(file.name);
    setOcrBusy(true);
    setMessage("");
    try {
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("eng");
      const result = await worker.recognize(file);
      await worker.terminate();
      const text = result.data.text ?? "";
      setOcrText(text);
      if (text.trim()) applyParse(text);
      else setMessage("No readable text found — please type the slip details manually.");
    } catch {
      setMessage("OCR unavailable in this browser — please type the slip details manually.");
    } finally {
      setOcrBusy(false);
    }
  };

  const applyParse = (text: string) => {
    const parsed = parseEntrySlip(text);
    setForm((f) => ({
      ...f,
      drawName: parsed.drawName || f.drawName,
      fullName: parsed.fullName,
      address: parsed.address,
      email: parsed.email ?? "",
      phone: parsed.phone ?? "",
      notes: [f.notes, parsed.notes].filter(Boolean).join("\n"),
    }));
    setMessage("Fields extracted from the slip — please check and correct before saving.");
  };

  const authHeaders = () => ({ authorization: `Bearer ${token}`, "content-type": "application/json" });

  const save = async () => {
    if (!token) { setMessage("Enter the intake API token first (stored only in this browser)."); return; }
    setSaving(true); setMessage("");
    try {
      const res = await fetch("/api/postal-entries", {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({ ...form, email: form.email || null, phone: form.phone || null, batchRef: form.batchRef || null, notes: form.notes || null }),
      });
      if (!res.ok) { setMessage(`Save failed (${res.status}): ${(await res.json().catch(() => ({})))?.error ?? "check the token"}`); return; }
      setMessage(`Saved entry for ${form.fullName || "entrant"}.`);
      setForm({ ...emptyForm, drawName: form.drawName, batchRef: form.batchRef });
      setOcrText("");
      loadEntries();
    } catch { setMessage("Save failed — network error."); }
    finally { setSaving(false); }
  };

  const loadEntries = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/postal-entries", { headers: { authorization: `Bearer ${token}` } });
      if (res.ok) setEntries((await res.json()).entries ?? []);
    } catch { /* list unavailable */ }
  };

  const exportCsv = async () => {
    if (!token) return;
    const res = await fetch("/api/postal-entries?format=csv", { headers: { authorization: `Bearer ${token}` } });
    if (!res.ok) { setMessage("Export failed."); return; }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `postal-entries-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const inputCls = "mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white outline-none focus:border-amber-200/50";

  return (
    <main className="min-h-screen bg-[#090a11] px-4 py-8 text-white sm:py-12">
      <div className="mx-auto max-w-4xl">
        <button onClick={() => navigate("/")} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-200">
          <ArrowLeft className="h-4 w-4" />Home
        </button>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-black sm:text-4xl">Postal entry intake — internal</h1>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-white/45">
            <LockKeyhole className="h-3 w-3" />Team only — unlisted
          </span>
        </div>
        <p className="mt-2 text-sm text-white/50">
          Photograph or upload a received entry slip, extract the details, confirm them, and save to the postal-entries register. Entries never count toward a draw until two-person verification.
        </p>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[.03] p-5">
          <label className="block text-[10px] font-black uppercase tracking-wider text-white/40">Intake API token
            <input type="password" value={token} onChange={(e) => { setToken(e.target.value); localStorage.setItem("lpd-intake-token", e.target.value); }} placeholder="Bearer token (POSTAL_ENTRIES_API_TOKEN)" className={inputCls} />
          </label>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <button type="button" onClick={() => fileRef.current?.click()} disabled={ocrBusy}
            className="flex min-h-40 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-amber-200/30 bg-amber-300/5 p-6 text-center transition hover:border-amber-200/60 disabled:opacity-50">
            {ocrBusy ? <ScanLine className="h-8 w-8 animate-pulse text-amber-200" /> : <Camera className="h-8 w-8 text-amber-200" />}
            <p className="mt-3 text-sm font-bold text-white/80">{ocrBusy ? "Reading slip…" : "Photograph or upload a slip"}</p>
            <p className="mt-1 text-xs text-white/40">JPG / PNG — processed in this browser, image is not uploaded</p>
            {imageName && <p className="mt-2 text-[10px] text-white/30">{imageName}</p>}
          </button>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) runOcr(f); e.target.value = ""; }} />
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-white/40">OCR text (editable — or paste typed slips here, then Extract)
              <textarea value={ocrText} onChange={(e) => setOcrText(e.target.value)} rows={6} className={inputCls + " font-mono text-xs"} />
            </label>
            <button type="button" onClick={() => ocrText.trim() && applyParse(ocrText)} className="mt-3 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white/70 hover:border-amber-200/40 hover:text-amber-200">
              <FileUp className="h-4 w-4" /> Extract fields
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block text-[10px] font-black uppercase tracking-wider text-white/40">Draw name<input value={form.drawName} onChange={set("drawName")} className={inputCls} /></label>
          <label className="block text-[10px] font-black uppercase tracking-wider text-white/40">Full name *<input value={form.fullName} onChange={set("fullName")} className={inputCls} /></label>
          <label className="block text-[10px] font-black uppercase tracking-wider text-white/40 sm:col-span-2">Postal address *<textarea value={form.address} onChange={set("address")} rows={2} className={inputCls} /></label>
          <label className="block text-[10px] font-black uppercase tracking-wider text-white/40">Email<input value={form.email} onChange={set("email")} className={inputCls} /></label>
          <label className="block text-[10px] font-black uppercase tracking-wider text-white/40">Phone<input value={form.phone} onChange={set("phone")} className={inputCls} /></label>
          <label className="block text-[10px] font-black uppercase tracking-wider text-white/40">Batch ref<input value={form.batchRef} onChange={set("batchRef")} placeholder="e.g. POST-2026-10-16-A" className={inputCls} /></label>
          <label className="block text-[10px] font-black uppercase tracking-wider text-white/40">Notes<input value={form.notes} onChange={set("notes")} className={inputCls} /></label>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button type="button" onClick={save} disabled={saving || !form.fullName || !form.address}
            className="inline-flex items-center gap-2 rounded-xl border border-amber-200/45 bg-amber-300/10 px-5 py-3 text-xs font-bold uppercase tracking-wider text-amber-200 transition hover:bg-amber-300 hover:text-black disabled:opacity-40">
            <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save entry"}
          </button>
          <button type="button" onClick={loadEntries} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-xs font-bold uppercase tracking-wider text-white/70">Recent entries</button>
          <button type="button" onClick={exportCsv} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-xs font-bold uppercase tracking-wider text-white/70">
            <Download className="h-4 w-4" /> Export CSV
          </button>
          {message && <p className="text-sm text-amber-200/90">{message}</p>}
        </div>

        {entries.length > 0 && (
          <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full min-w-[36rem] text-left text-xs">
              <thead><tr className="border-b border-white/10 text-[9px] font-black uppercase tracking-wider text-white/40">
                <th className="px-4 py-2.5">Name</th><th className="px-4 py-2.5">Draw</th><th className="px-4 py-2.5">Status</th><th className="px-4 py-2.5">Received</th>
              </tr></thead>
              <tbody>{entries.slice(0, 20).map((e) => (
                <tr key={e.id} className="border-b border-white/5 text-white/60">
                  <td className="px-4 py-2.5 font-bold text-white/80">{e.fullName}</td>
                  <td className="px-4 py-2.5">{e.drawName}</td>
                  <td className="px-4 py-2.5"><span className={`rounded-full border px-2 py-0.5 text-[9px] font-black uppercase ${e.status === "VERIFIED" ? "border-emerald-300/40 text-emerald-300" : e.status === "REJECTED" ? "border-red-300/40 text-red-300" : "border-amber-200/40 text-amber-200"}`}>{e.status}</span></td>
                  <td className="px-4 py-2.5">{new Date(e.createdAt).toLocaleString("en-GB")}</td>
                </tr>))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
};
