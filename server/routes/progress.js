function progressRoute(_req, res) {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ progress: [] }));
}

module.exports = { progressRoute };
