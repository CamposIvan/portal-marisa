const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
const PAGE_SIZE = 1000;

async function fetchRows(table, select, order = "") {
  const all = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const params = new URLSearchParams({ select, limit: String(PAGE_SIZE), offset: String(offset) });
    if (order) params.set("order", order);
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params.toString()}`, {
      method: "GET",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Accept: "application/json"
      }
    });
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Supabase read failed for ${table}: ${response.status} ${body.slice(0, 250)}`);
    }
    const page = await response.json();
    if (!Array.isArray(page)) throw new Error(`Unexpected response from ${table}`);
    all.push(...page);
    if (page.length < PAGE_SIZE) break;
  }
  return all;
}

module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: "Supabase environment is not configured" });
  }

  try {
    const [records, targets, plan] = await Promise.all([
      fetchRows(
        "saresp_results",
        "class_group,bimester,grade_label,score_percent,descriptor,subject,lesson_url,question_url,source_file,source_row,is_mapa_foco_saresp,aprendizagens_essenciais",
        "bimester.asc,class_group.asc,source_row.asc"
      ),
      fetchRows(
        "saresp_planning_targets",
        "subject,focus_title,reference_percent,critical_threshold,reference_description,ae_codes,is_mapa_foco_saresp,active",
        "id.asc"
      ).then(rows => rows.filter(row => row.active !== false)),
      fetchRows(
        "saresp_intervention_plan",
        "week_number,title,subject,description,lesson_reference,order_in_cycle,active",
        "week_number.asc"
      ).then(rows => rows.filter(row => row.active !== false))
    ]);

    return res.status(200).json({
      records,
      targets,
      plan,
      refreshed_at: new Date().toISOString()
    });
  } catch (error) {
    console.error("SARESP Supabase read failed:", error);
    return res.status(502).json({ error: "Could not load SARESP data from Supabase" });
  }
};
