export default async function handler(req, res) {
  const { uid, sid } = req.query;

  // あなたが提示した、絶対に正しい個人版 URL (XSFl)
  const GAS_URL = "https://script.google.com/macros/s/AKfycbwXSFl6hzaM5vB7CMJS7BrT2GZ3e8EAmA_ufIiAciwrG5xlwmgkb1knLggYCtogxXx6LQ/exec".trim();

  if (!uid || !sid) {
    return res.status(400).json({ result: "error_id" });
  }

  const targetUrl = `${GAS_URL}?uid=${encodeURIComponent(uid)}&sid=${encodeURIComponent(sid)}`;

  try {
    const gasRes = await fetch(targetUrl, { 
      method: "GET",
      redirect: "follow" // Google の転送を最後まで追いかけます
    });

    const resultText = await gasRes.text();

    if (!gasRes.ok) {
      // 404や400エラーが起きた際、Googleが返した生のHTML（の一部）を返します
      return res.status(gasRes.status).json({ result: `GAS_ERR_${gasRes.status}: ${resultText.substring(0, 100)}` });
    }

    // 成功時："success" 等の文字のみを返す
    res.status(200).json({ result: resultText.trim() });
  } catch (e) {
    res.status(500).json({ result: "error_proxy: " + e.message });
  }
}
