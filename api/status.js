function sendJson(res, status, payload) {
  if (typeof res.status === "function" && typeof res.json === "function") {
    return res.status(status).json(payload);
  }

  res.statusCode = status;
  if (typeof res.setHeader === "function") {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
  }

  const body = JSON.stringify(payload);
  if (typeof res.end === "function") {
    res.end(body);
  } else {
    res.body = body;
  }

  return payload;
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    if (typeof res.setHeader === "function") {
      res.setHeader("Allow", "GET");
    }

    return sendJson(res, 405, {
      ok: false,
      code: "METHOD_NOT_ALLOWED",
      message: "Method Not Allowed"
    });
  }

  const apiKey = String(process.env.GEMINI_API_KEY || "").trim();
  return sendJson(res, 200, {
    provider: "Gemini",
    mode: apiKey ? "Live" : "Demo",
    apiStatus: apiKey ? "Ready" : "Missing Key"
  });
};
