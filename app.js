const express = require("express");
const app = express();

app.use(express.json());

// 👇 ESTA LÍNEA USA LA VARIABLE DE RENDER
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

// Verificación webhook
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  } else {
    return res.sendStatus(403);
  }
});

// recibir mensajes
app.post("/webhook", (req, res) => {
  console.log(req.body);
  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor activo"));
