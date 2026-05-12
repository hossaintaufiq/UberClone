const https = require("https");

const UA = "Transitely/1.0 (ride booking; contact via app operator)";

function nominatimSearch(q, limit) {
  const params = new URLSearchParams({
    q,
    format: "json",
    limit: String(limit),
    addressdetails: "1",
  });
  const path = `/search?${params.toString()}`;
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "nominatim.openstreetmap.org",
        path,
        method: "GET",
        headers: {
          Accept: "application/json",
          "User-Agent": UA,
        },
      },
      (res) => {
        let body = "";
        res.on("data", (c) => {
          body += c;
        });
        res.on("end", () => {
          if (res.statusCode && res.statusCode >= 400) {
            reject(new Error(`Nominatim HTTP ${res.statusCode}`));
            return;
          }
          try {
            const j = JSON.parse(body);
            resolve(Array.isArray(j) ? j : []);
          } catch (e) {
            reject(e);
          }
        });
      }
    );
    req.on("error", reject);
    req.setTimeout(12000, () => {
      req.destroy();
      reject(new Error("Geocode timeout"));
    });
    req.end();
  });
}

exports.searchPlaces = async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();
    if (q.length < 2) {
      return res.json({ success: true, data: [] });
    }
    const limit = Math.min(10, Math.max(1, Number.parseInt(String(req.query.limit || "8"), 10) || 8));
    const raw = await nominatimSearch(q, limit);
    const data = raw
      .map((item) => ({
        lat: Number(item.lat),
        lng: Number(item.lon),
        label: typeof item.display_name === "string" ? item.display_name : "",
        place_id: item.place_id,
      }))
      .filter((x) => Number.isFinite(x.lat) && Number.isFinite(x.lng) && x.label.length > 0);
    return res.json({ success: true, data });
  } catch (e) {
    console.error("geocode search", e);
    return res.status(502).json({ success: false, message: "Place search temporarily unavailable." });
  }
};
