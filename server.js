require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// ENV
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN?.trim();
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID?.trim();

console.log("🚀 Servidor iniciado correctamente");

// ==========================
//   HORARIO LABORAL
// ==========================
function fueraDeHorario() {
  const ahoraStr = new Date().toLocaleString("en-US", {
    timeZone: "America/Merida",
    hour12: false
  });

  const hora = Number(ahoraStr.split(", ")[1].split(":")[0]);
  return hora < 8 || hora >= 18; // fuera de 8 AM – 6 PM
}

// ==========================
//   VERIFICACIÓN WEBHOOK
// ==========================
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("📌 Webhook verificado por Meta.");
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

// ==========================
//   RECEPCIÓN DE MENSAJES
// ==========================
app.post("/webhook", async (req, res) => {
  // Respondemos rápido a Meta
  res.sendStatus(200);

  try {
    const entries = req.body.entry || [];

    for (const entry of entries) {
      const changes = entry.changes || [];

      for (const change of changes) {
        const value = change.value || {};
        const messages = value.messages || [];

        for (const message of messages) {
          const from = message.from; // número del cliente
          if (!from) continue;

          // Detección del texto recibido (texto, botón, lista)
          const texto =
            message.text?.body ||
            message.button?.text ||
            message.interactive?.list_reply?.title ||
            "";

          console.log(`📩 Mensaje recibido de ${from}: ${texto}`);

          // ==========================
          //   RESPUESTA AUTOMÁTICA
          // ==========================
          let respuesta = "";

          if (fueraDeHorario()) {
            respuesta = `👋 Gracias por comunicarte con soporte técnico.

Nuestro horario es de 8:00 am a 6:00 pm.

Mientras tanto puedes escribir:

1️⃣ No tengo señal GPS  
2️⃣ La plataforma no abre  
3️⃣ No puedo ver mi unidad  
4️⃣ Reportar robo o emergencia  
5️⃣ Hablar con soporte  

Escribe el número de tu problema.`;
          } else {
            respuesta = `✅ Gracias por comunicarte con soporte técnico.

¿En qué podemos ayudarte?`;
          }

          await enviarMensajeWhatsApp(from, respuesta);
          console.log("📤 Respuesta enviada a", from);
        }
      }
    }
  } catch (err) {
    console.error("❌ Error procesando webhook:", err.response?.data || err.message);
  }
});

// ==========================
//   FUNCIÓN: Enviar mensajes
// ==========================
async function enviarMensajeWhatsApp(to, body) {
  const url = `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`;

  await axios.post(
    url,
    {
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body }
    },
    {
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json"
      }
    }
  );
}

// ==========================
//   INICIO DEL SERVIDOR
// ==========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🔥 Server escuchando en puerto ${PORT}`));
