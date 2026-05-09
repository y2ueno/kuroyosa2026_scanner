const https = require("https");
const http = require("http");

function fetchWithRedirect(url, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;
    protocol.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json, text/plain, */*"
      }
    }, (res) => {
      // リダイレクト処理：クエリパラメータをそのまま維持
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location && maxRedirects > 0) {
        let nextUrl = res.headers.location;
        // 相対URLの場合は絶対URLに変換
        if (nextUrl.startsWith("/")) {
          const parsed = new URL(url);
          nextUrl = parsed.origin + nextUrl;
        }
        // リダイレクト先にクエリパラメータがない場合は元のを引き継ぐ
        const origUrl = new URL(url);
        const nextParsed = new URL(nextUrl);
        if (!nextParsed.search && origUrl.search) {
          nextUrl = nextUrl + origUrl.search;
        }
        resolve(fetchWithRedirect(nextUrl, maxRedirects - 1));
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
  const GAS_URL = "https://script.google.com/macros/s/AKfycbx91GCilncyaaaHV0ehga2csz2c8z8auvzUl4lRjddV3sQOKrdu8OWLqiv_0V2eWujs_g/exec";

  if (!uid || !sid) return res.status(200).json({ result: "error_id" });

  const targetUrl = `${GAS_URL}?uid=${encodeURIComponent(uid)}&sid=${encodeURIComponent(sid)}`;

  try {
    const response = await fetchWithRedirect(targetUrl);
    if (response.status !== 200) {
      return res.status(200).json({ result: `GAS_ERR_${response.status}`, body: response.body.substring(0, 200) });
    }
    const parsed = JSON.parse(response.body.trim());
    res.status(200).json(parsed);
  } catch (e) {
    res.status(200).json({ result: "error_proxy: " + e.message });
  }
};
