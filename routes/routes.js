const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.render("game"); // Renderiza o game com o roomId passado
});

module.exports = app;
