// server.js
const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

// ========================
// Verificación de Webhook
// ========================
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("Webhook verificado ✅");
      return res.status(200).send(challenge);
    } else {
      console.log("Webhook no verificado ❌");
      return res.sendStatus(403);
    }
  }
  res.sendStatus(400);
});

// ========================
// Recepción de mensajes
// ========================
app.post("/webhook", async (req, res) => {
  const body = req.body;

  const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

  if (!message) {
    return res.sendStatus(200); // No hay mensaje, respondemos 200
  }

  const from = message.from; // Número del remitente
  const text = message.text?.body || "";

  console.log("Mensaje recibido de", from, ":", text);

  // Variables de entorno
  const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID?.trim();
  const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN?.trim();

  if (!PHONE_NUMBER_ID || !WHATSAPP_TOKEN) {
    console.error("❌ Falta PHONE_NUMBER_ID o WHATSAPP_TOKEN en .env");
    return res.sendStatus(500);
  }

  try {
    const response = await axios.post(
      `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: from,
        text: { body: "Hola 👋 recibimos tu mensaje, pronto te responderemos" }
      },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("Mensaje enviado correctamente:", response.data);
  } catch (error) {
    if (error.response) {
      console.error(
        "Error enviando mensaje:",
        error.response.status,
        JSON.stringify(error.response.data, null, 2)
      );
    } else {
      console.error("Error enviando mensaje:", error.message);
    }
  }

  res.sendStatus(200);
});

// ========================
// Iniciar servidor
// ========================
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
