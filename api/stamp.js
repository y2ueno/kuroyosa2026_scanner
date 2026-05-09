/**
 * 【Vercel プロキシサーバー】
 * ご指定いただいた個人版 GAS URL (XSFl) を使用しています。
 */
export default async function handler(req, res) {
  const { uid, sid } = req.query;

  // あなたが提示した、成功したはずの正しい URL
  const GAS_URL = "https://script.google.com/macros/s/AKfycbwXSFl6hzaM5vB7CMJS7BrT2GZ3e8EAmA_ufIiAciwrG5xlwmgkb1knLggYCtogxXx6LQ/exec";

  if (!uid || !sid) {
    return res.status(400).json({ result: "error_id" });
  }

  const targetUrl = `${GAS_URL}?uid=${encodeURIComponent(uid)}&sid=${encodeURIComponent(sid)}`;

  try {
    const gasRes = await fetch(targetUrl, { 
      method: "GET",
      redirect: "follow" 
    });

    const resultText = await gasRes.text();

    if (!gasRes.ok) {
      // 404等のエラーが出た場合、Google の応答をそのままデバッグ用に返す
      return res.status(gasRes.status).json({ result: `GAS_ERR_${gasRes.status}: ${resultText.substring(0, 100)}` });
    }

    res.status(200).json({ result: resultText.trim() });
  } catch (e) {
    res.status(500).json({ result: "error_proxy: " + e.message });
  }
}
