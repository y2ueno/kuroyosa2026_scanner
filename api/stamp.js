export default async function handler(req, res) {
  const { uid, sid } = req.query;

  // あなたが提示した、絶対に正しい個人版 URL (XSFl)
  const GAS_URL = "https://script.google.com/macros/s/AKfycbwXSFl6hzaM5vB7CMJS7BrT2GZ3e8EAmA_ufIiAciwrG5xlwmgkb1knLggYCtogxXx6LQ/exec";

  if (!uid || !sid) {
    return res.status(400).json({ result: "error_id" });
  }

  const targetUrl = `${GAS_URL}?uid=${encodeURIComponent(uid)}&sid=${encodeURIComponent(sid)}`;

  try {
    const gasRes = await fetch(targetUrl, { 
      method: "GET",
      headers: {
        // Google のブロックを回避するためにブラウザのふりをする
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      },
      redirect: "follow" 
    });

    const resultText = await gasRes.text();

    if (!gasRes.ok) {
      // 400エラーが起きた際、Googleが返した生のHTMLをデバッグ用に返す
      return res.status(gasRes.status).json({ result: `GAS_ERR_${gasRes.status}: ${resultText.substring(0, 100)}` });
    }

    res.status(200).json({ result: resultText.trim() });
  } catch (e) {
    res.status(500).json({ result: "error_proxy: " + e.message });
  }
}
