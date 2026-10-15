const { gunzipSync } = require("node:zlib");
const { createHash } = require("node:crypto");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
const EXPECTED_SHA256 = "703fafbc0d332d437b678d3c237af1c0fb7fa61e001a86c3209e7fd98a5c5cae";
const EXPECTED_FILES = [
  "4º ano A 1º bimestre.xlsx",
  "4ºano A 2º bimestre.xlsx",
  "4ºano A 3º bimestre.xlsx"
];

async function readPayload() {
  const chunks = [];
  for (let i = 1; i <= 15; i++) {
    const part = String(i).padStart(2, "0");
    const url = `https://raw.githubusercontent.com/CamposIvan/portal-marisa/main/data/grade4-import/part-${part}.b64`;
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`Payload part ${part} returned HTTP ${response.status}`);
    const value = (await response.text()).trim();
    if (!/^[A-Za-z0-9+/=]+$/.test(value)) throw new Error(`Invalid base64 characters in part ${part}`);
    chunks.push(value);
  }

  const base64 = chunks.join("");
  const actual = createHash("sha256").update(base64, "utf8").digest("hex");
  if (actual !== EXPECTED_SHA256) {
    throw new Error(`Payload integrity check failed: sha256=${actual}; expected=${EXPECTED_SHA256}; length=${base64.length}`);
  }

  const payload = JSON.parse(gunzipSync(Buffer.from(base64, "base64")).toString("utf8"));
  if (!Array.isArray(payload.records) || payload.records.length !== 180) {
    throw new Error("Payload must contain exactly 180 records");
  }
  if (!Array.isArray(payload.references) || payload.references.length !== 66) {
    throw new Error("Payload must contain exactly 66 correlation references");
  }
  const files = [...new Set(payload.records.map(row => row.source_file))].sort();
  if (JSON.stringify(files) !== JSON.stringify([...EXPECTED_FILES].sort())) {
    throw new Error("Payload source filenames do not match the three expected grade-4 workbooks");
  }
  return payload;
}

async function upsert(table, rows, conflict, label) {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/${table}?on_conflict=${encodeURIComponent(conflict)}`,
    {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=representation"
      },
      body: JSON.stringify(rows)
    }
  );
  const body = await response.text();
  if (!response.ok) throw new Error(`${label} failed: HTTP ${response.status}: ${body.slice(0, 600)}`);
  try { return JSON.parse(body); } catch { return []; }
}

module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Use POST to run the fixed, one-time import." });
  }
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: "Supabase environment is not configured" });
  }
  if (req.query?.confirm !== "grade4-2026-import") {
    return res.status(400).json({ error: "Confirmation value missing" });
  }

  try {
    const payload = await readPayload();
    const records = payload.records.map(row => ({
      ...row,
      import_batch_id: null,
      grade_label: "4° ANO",
      class_group: "A"
    }));

    // Idempotent batches of 30 rows; a rerun updates the same source rows instead of duplicating them.
    let recordCount = 0;
    for (let i = 0; i < records.length; i += 30) {
      const inserted = await upsert(
        "saresp_results",
        records.slice(i, i + 30),
        "source_file,source_row",
        `Result batch ${Math.floor(i / 30) + 1}`
      );
      recordCount += inserted.length;
    }

    let referenceCount = 0;
    for (let i = 0; i < payload.references.length; i += 30) {
      const inserted = await upsert(
        "saresp_map_focus_reference",
        payload.references.slice(i, i + 30),
        "academic_year,grade_label,subject,descriptor",
        `Reference batch ${Math.floor(i / 30) + 1}`
      );
      referenceCount += inserted.length;
    }

    return res.status(200).json({
      ok: true,
      imported_records: recordCount,
      expected_records: 180,
      imported_correlations: referenceCount,
      expected_correlations: 66,
      source_files: EXPECTED_FILES,
      correlation_note: "LP e Matemática do 4º ano correlacionadas pedagogicamente ao Mapa SARESP do 5º ano; não representam descritores/resultados oficiais SARESP do 4º ano."
    });
  } catch (error) {
    console.error("Grade-4 import failed:", error);
    return res.status(500).json({ error: error.message || "Import failed" });
  }
};
