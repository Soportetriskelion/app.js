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

// 🔹 RESPUESTAS DEL MENÚ
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

else if (text === "3") {
  respuesta = `📍 NO PUEDO VER MI UNIDAD

Verifica:
✅ que la unidad esté encendida
✅ que tenga cobertura
✅ actualiza la plataforma

Si continúa, lo revisamos mañana.`;
}

else if (text === "4") {
  respuesta = `🚨 EMERGENCIA O ROBO

Llama inmediatamente:
📞 911

Después notifícanos para apoyarte con el rastreo.`;
}

else if (text === "5") {
  respuesta = `👨‍💻 Un agente revisará tu caso.

Te responderemos en cuanto estemos disponibles.`;
}

// 🔹 SI NO ES UNA OPCIÓN, MOSTRAR MENÚ
else if (fueraDeHorario()) {
  respuesta = `👋 Gracias por comunicarte con soporte técnico.

Nuestro horario es de 8:00 am a 6:00 pm.

Mientras tanto puedes escribir:

1️⃣ No tengo señal GPS
2️⃣ La plataforma no abre
3️⃣ No puedo ver mi unidad
4️⃣ Reportar robo o emergencia
5️⃣ Hablar con soporte

Escribe el número de tu problema.`;
}

else {
  respuesta = `👋 Soporte técnico GPS

Escribe el número de tu problema:

1️⃣ No tengo señal GPS
2️⃣ La plataforma no abre
3️⃣ No puedo ver mi unidad
4️⃣ Reportar robo o emergencia
5️⃣ Hablar con soporte`;
}
 
  else {
    respuesta = "✅ Gracias por comunicarte con soporte técnico.\n¿En qué podemos ayudarte?";
  }
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
          text: { body: respuesta }
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
