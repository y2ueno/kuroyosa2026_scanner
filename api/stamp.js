/**
 * 【Vercel API プロキシ】
 * ブラウザの制限を回避し、サーバーサイドで GAS と通信します。
 */
export default async function handler(req, res) {
  const { uid, sid } = req.query;

  // 最新の GAS ウェブアプリ URL
  const GAS_URL = "https://script.google.com/macros/s/AKfycb0fAcXHpHTFkGkBflIKY7m6DOqFhkJjX2oZc5zzwsECZ7NM8EuTo3cwSiq5OcRRSK6Vg/exec";

  if (!uid || !sid) {
    return res.status(400).json({ result: "error_id" });
  }

  const targetUrl = `${GAS_URL}?uid=${encodeURIComponent(uid)}&sid=${encodeURIComponent(sid)}`;

  try {
    // サーバーサイド fetch により CORS を回避し、リダイレクトを自動追跡
    const gasRes = await fetch(targetUrl, {
      method: "GET",
      redirect: "follow", // 重要：Google のリダイレクトを追跡
    });

    if (!gasRes.ok) {
      throw new Error(`GAS returned status ${gasRes.status}`);
    }

    const resultText = await gasRes.text();
    
    // 不要な JSONP ラッパーがあれば削除して純粋な判定文字のみを返す
    const cleanResult = resultText.replace(/onResult_\d+\('(.+?)'\)/, '$1').trim();

    res.status(200).json({ result: cleanResult });
  } catch (e) {
    console.error("Proxy Error:", e.message);
    res.status(500).json({ result: "error_proxy: " + e.message });
  }
}
