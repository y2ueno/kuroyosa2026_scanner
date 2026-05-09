const https = require("https");
const http = require("http");

function fetchWithRedirect(url, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;
    protocol.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "text/plain,*/*"
      }
    }, (res) => {
      if ((res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307) && res.headers.location && maxRedirects > 0) {
        resolve(fetchWithRedirect(res.headers.location, maxRedirects - 1));
        return;
      }
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve({ status: res.statusCode, body: data }));
    }).on("error", reject);
  });
}

module.exports = async function handler(req, res) {
  const { uid, sid } = req.query;
  const GAS_URL = "https://script.google.com/macros/s/AKfycbypVr-A5DqRagZQpSAPuJnRf0u4L2syVG9RehaYJMHJrWhwVoR7PGonhfeHFOHzUK3qhw/exec";

  if (!uid || !sid) return res.status(400).json({ result: "error_id" });

  const targetUrl = `${GAS_URL}?uid=${encodeURIComponent(uid)}&sid=${encodeURIComponent(sid)}`;

  try {
    const response = await fetchWithRedirect(targetUrl);
    if (response.status !== 200) {
      return res.status(200).json({ result: `GAS_ERR_${response.status}` });
    }
    res.status(200).json({ result: response.body.trim() });
  } catch (e) {
    res.status(200).json({ result: "error_proxy: " + e.message });
  }
};
