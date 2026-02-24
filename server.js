require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN.trim();
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID.trim();

console.log("✅ Servidor iniciado");

// 🔹 Verificación del webhook
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verificado");
    return res.status(200).send(challenge);
  } else {
    return res.sendStatus(403);
  }
});

// 🔹 Recepción de mensajes
app.post("/webhook", async (req, res) => {
  let from = null;

  try {
    const body = req.body;

    const message =
      body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (message) {
      from = message.from;
      const text = message.text?.body;

      console.log("📩 Mensaje recibido de", from, ":", text);

      await axios({
        method: "POST",
        url: `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json"
        },
        data: {
          messaging_product: "whatsapp",
          to: from,
          type: "text",
          text: { body: "✅ Bot activo en Render" }
        }
      });

      console.log("✅ Respuesta enviada");
    }

    res.sendStatus(200);

  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor en puerto ${PORT}`));
