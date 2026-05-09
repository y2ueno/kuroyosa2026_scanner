module.exports = async function handler(req, res) {
  const { uid, sid } = req.query;

  const GAS_URL = "https://script.google.com/macros/s/AKfycbxPmD5dcEeYe_9fAp6Ui-x21a5oHjoI4xuMyu484VYfyndNbZ6lStTPgo_lcpq89QFaCA/exec";

  if (!uid || !sid) return res.status(400).json({ result: "error_id" });

  const targetUrl = `${GAS_URL}?uid=${encodeURIComponent(uid)}&sid=${encodeURIComponent(sid)}`;

  try {
    const gasRes = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko)"
      },
      redirect: "follow"
    });

    const resultText = await gasRes.text();

    if (!gasRes.ok) {
      return res.status(gasRes.status).json({ result: `GAS_ERR_${gasRes.status}` });
    }

    res.status(200).json({ result: resultText.trim() });

  } catch (e) {
    res.status(500).json({ result: "error_proxy: " + e.message });
  }
};
