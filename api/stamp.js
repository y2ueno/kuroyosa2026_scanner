/**
 * 【Vercel プロキシサーバー：組織アカウントGAS専用】
 * ブラウザのCORS制限を回避し、サーバーサイドでGASを叩きます。
 */
export default async function handler(req, res) {
  const { uid, sid } = req.query;

  // 【修正済み】最新の組織アカウントGAS URL
  const GAS_URL = "https://script.google.com/macros/s/AKfycbx0fAcXHpHTFkGkBflIKY7m6DOqFhkJjX2oZc5zzwsECZ7NM8EuTo3cwSiq5OcRRSK6Vg/exec";

  if (!uid || !sid) {
    return res.status(400).json({ result: "error_id" });
  }

  const targetUrl = `${GAS_URL}?uid=${encodeURIComponent(uid)}&sid=${encodeURIComponent(sid)}`;

  try {
    // VercelサーバーからGASを叩く（リダイレクトを追跡）
    const gasRes = await fetch(targetUrl, {
      method: "GET",
      redirect: "follow", 
    });

    if (!gasRes.ok) {
      throw new Error(`GAS returned status ${gasRes.status}`);
    }

    const resultText = await gasRes.text();
    
    // 不要な空白を消してJSONで返す
    res.status(200).json({ result: resultText.trim() });
  } catch (e) {
    console.error("Proxy Error:", e.message);
    res.status(500).json({ result: "error_proxy: " + e.message });
  }
}
