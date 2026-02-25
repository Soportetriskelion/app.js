require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN.trim();
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID.trim();

console.log("✅ Servidor iniciado");

// 🔽 PEGAR AQUÍ
function fueraDeHorario() {
  const ahora = new Date();
  const hora = ahora.getHours();

  // horario laboral: 8 AM a 6 PM
  return hora < 8 || hora >= 10;
}
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
 const text = message.text?.body?.trim();
console.log("📩 Mensaje recibido de", from, ":", text);

let respuesta = "";

// 🔹 menú de soporte
if (text === "1") {
  respuesta = `📡 SIN SEÑAL GPS

Verifica:
✅ La unidad esté encendida
✅ El dispositivo tenga energía
✅ Esté en zona con cobertura celular

Si continúa, mañana revisamos tu unidad.`;
}
else if (text === "2") {
  respuesta = `🌐 PLATAFORMA NO ABRE

Intenta:
✅ revisar internet
✅ usar Google Chrome
✅ borrar caché del navegador

Si continúa, lo revisamos en horario laboral.`;
}
else {
  // mensaje normal automático
  if (fueraDeHorario()) {
    respuesta = `⏰ Estamos fuera de horario.

Nuestro horario es:
🕗 8:00 AM a 11:00 AM

Escribe:

1️⃣ Sin señal GPS
2️⃣ Plataforma no abre

Te responderemos en cuanto estemos disponibles.`;
  } else {
    respuesta = `👋 Soporte GPS activo

Escribe el número de tu problema:

1️⃣ Sin señal GPS
2️⃣ Plataforma no abre`;
  }
}
                 );

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
