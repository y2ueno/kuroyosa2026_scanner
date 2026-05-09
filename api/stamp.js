export default async function handler(req, res) {
  const { uid, sid } = req.query;

  // 個人アカウント版 GAS URL (あなたが正解とした URL)
  const GAS_URL = "https://script.google.com/macros/s/AKfycbwXSFl6hzaM5vB7CMJS7BrT2GZ3e8EAmA_ufIiAciwrG5xlwmgkb1knLggYCtogxXx6LQ/exec";

  if (!uid || !sid) {
    return res.status(400).json({ result: "error_id" });
  }

  const targetUrl = `${GAS_URL}?uid=${encodeURIComponent(uid)}&sid=${encodeURIComponent(sid)}`;

  try {
    const gasRes = await fetch(targetUrl, { redirect: "follow" });
    const resultText = await gasRes.text();

    // GAS から返ってきた "success" や "already" をそのままブラウザに返す
    res.status(200).json({ result: resultText.trim() });
  } catch (e) {
    res.status(500).json({ result: "error_proxy: " + e.message });
  }
}
