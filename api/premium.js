export default async function handler(req, res) {
  try {
    const mlsId = String(req.query.mlsId || "").trim();
    if (!mlsId) {
      return res.status(400).json({ ok: false, error: "Missing mlsId" });
    }

    const token = process.env.AIRTABLE_TOKEN;
    const baseId = process.env.AIRTABLE_BASE_ID;
    const tableName = process.env.AIRTABLE_TABLE_NAME || "Premium Listings Backend";

    if (!token || !baseId) {
      return res.status(500).json({
        ok: false,
        error: "Missing Airtable env vars",
      });
    }

    const safeMls = mlsId.replace(/'/g, "\\'");
    const formula = `OR({MLS ID}='${safeMls}', {mls_id}='${safeMls}')`;

    const url =
      `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}` +
      `?maxRecords=1&filterByFormula=${encodeURIComponent(formula)}`;

    const r = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!r.ok) {
      const text = await r.text();
      return res.status(500).json({ ok: false, error: text });
    }

    const json = await r.json();
    const record = json?.records?.[0];

    res.status(200).json({
      ok: true,
      found: !!record,
      fields: record?.fields || {},
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
}
