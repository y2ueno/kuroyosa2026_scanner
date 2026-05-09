/**
 * 【Vercel API プロキシ：組織アカウント GAS 専用】
 */
export default async function handler(req, res) {
  const { uid, sid } = req.query;

  // あなたが提示した「最新の組織版 GAS URL」
  const GAS_URL = "https://script.google.com/macros/s/AKfycbx0fAcXHpHTFkGkBflIKY7m6DOqFhkJjX2oZc5zzwsECZ7NM8EuTo3cwSiq5OcRRSK6Vg/exec";

  if (!uid || !sid) {
    return res.status(400).json({ result: "error_id" });
  }

  const targetUrl = `${GAS_URL}?uid=${encodeURIComponent(uid)}&sid=${encodeURIComponent(sid)}`;

  try {
    // サーバー間通信。redirect: "follow" で Google の転送を最後まで追います
    const gasRes = await fetch(targetUrl, {
      method: "GET",
      redirect: "follow",
    });

    const resultText = await gasRes.text();

    if (!gasRes.ok) {
      return res.status(gasRes.status).json({ result: `GAS_HTTP_ERR_${gasRes.status}: ${resultText.substring(0, 50)}` });
    }

    // GAS からの生テキストを返す
    res.status(200).json({ result: resultText.trim() });
  } catch (e) {
    console.error("Proxy Communication Error:", e.message);
    res.status(500).json({ result: "error_proxy: " + e.message });
  }
}
