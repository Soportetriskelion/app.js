// index.js
const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(express.json()); // Para parsear JSON

const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

// Endpoint para verificación de Meta
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("Webhook verificado ✅");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// Endpoint para recibir mensajes
app.post("/webhook", async (req, res) => {
  const body = req.body;

  // Verifica si hay mensajes entrantes
  const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

  if (message) {
    const from = message.from; // Número del remitente
    const text = message.text?.body; // Texto del mensaje

    console.log("Mensaje recibido de", from, ":", text);

    try {
      // Enviar respuesta
      const response = await axios.post(
        `https://graph.facebook.com/v19.0/${process.env.PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: "whatsapp",
          to: from,
          text: { body: "Hola 👋 recibimos tu mensaje, pronto te responderemos" }
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
            "Content-Type": "application/json"
          }
        }
      );

      console.log("Mensaje enviado correctamente:", response.data);
    } catch (error) {
      console.error(
        "Error enviando mensaje:",
        error.response?.data || error.message
      );
    }
  }

  res.sendStatus(200);
});

// Inicia servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
