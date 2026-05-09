module.exports = async function handler(req, res) {
  const { uid, sid } = req.query;
  const GAS_URL = "https://script.google.com/macros/s/AKfycbxRU1NhIXnwa00_602qo7tEZPLvMTe6YskIPJb8oEmKzYi0_DLT9-QAVXt1oAEkEWZ_oQ/exec";

  if (!uid || !sid) return res.status(200).json({ result: "error_id" });

  const targetUrl = `${GAS_URL}?uid=${encodeURIComponent(uid)}&sid=${encodeURIComponent(sid)}`;

  try {
    // undici は Node.js 18 内蔵、Vercel対応
    const { fetch } = await import("undici");
    
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; StampBot/1.0)",
        "Accept": "application/json"
      },
      redirect: "follow"  // リダイレクト自動追従
    });

    const text = await response.text();
    
    if (!response.ok) {
      return res.status(200).json({ 
        result: `GAS_ERR_${response.status}`, 
        body: text.substring(0, 200) 
      });
    }

    const parsed = JSON.parse(text.trim());
    res.status(200).json(parsed);
    
  } catch (e) {
    res.status(200).json({ result: "error_proxy: " + e.message });
  }
};
