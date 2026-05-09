export default async function handler(req, res) {
  const { uid, sid } = req.query;

  // あなたが「これだ」と指定した個人版 URL (XSFl)
  // 前後の空白で 404 になるのを防ぐため .trim() を入れています
  const GAS_URL = "https://script.google.com/macros/s/AKfycbwXSFl6hzaM5vB7CMJS7BrT2GZ3e8EAmA_ufIiAciwrG5xlwmgkb1knLggYCtogxXx6LQ/exec".trim();

  if (!uid || !sid) {
    return res.status(400).json({ result: "error_id" });
  }

  const targetUrl = `${GAS_URL}?uid=${encodeURIComponent(uid)}&sid=${encodeURIComponent(sid)}`;

  try {
    const gasRes = await fetch(targetUrl, { redirect: "follow" });
    const resultText = await gasRes.text();

    if (!gasRes.ok) {
      // 400エラー等の場合、Googleからの応答（HTML）をデバッグ用に返す
      return res.status(gasRes.status).json({ result: `GAS_ERR_${gasRes.status}: ${resultText.substring(0, 100)}` });
    }

    res.status(200).json({ result: resultText.trim() });
  } catch (e) {
    res.status(500).json({ result: "error_proxy: " + e.message });
  }
}
