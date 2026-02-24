require("dotenv").config();
const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT;

// ====== VERIFICACIÓN DEL WEBHOOK ======
app.get("/webhook", (req, res) => {
  const verifyToken = process.env.VERIFY_TOKEN;

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token === verifyToken) {
    console.log("Webhook verificado correctamente");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// ====== RECIBIR MENSAJES ======
app.post("/webhook", async (req, res) => {
  try {
    const body = req.body;

    if (body.entry) {
      const message =
        body.entry[0].changes[0].value.messages?.[0];

      if (message) {
        const from = message.from;
        const text = message.text.body;

        console.log("Mensaje recibido:", text);

        const respuestaIA = await obtenerRespuestaIA(text);

        await enviarMensajeWhatsApp(from, respuestaIA);
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    res.sendStatus(500);
  }
});

// ====== CONSULTAR AZURE OPENAI ======
async function obtenerRespuestaIA(texto) {
  try {
    const response = await axios.post(
      process.env.AZURE_OPENAI_ENDPOINT,
      {
        messages: [
          { role: "system", content: "Eres un asistente útil y profesional." },
          { role: "user", content: texto },
        ],
        max_tokens: 200,
        temperature: 0.7,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": process.env.AZURE_OPENAI_KEY,
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Error IA:", error.response?.data || error.message);
    return "Lo siento, ocurrió un error procesando tu mensaje.";
  }
}

// ====== ENVIAR MENSAJE A WHATSAPP ======
async function enviarMensajeWhatsApp(numero, mensaje) {
  try {
    await axios.post(
      `https://graph.facebook.com/v19.0/${process.env.PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: numero,
        text: { body: mensaje },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Respuesta enviada:", mensaje);
  } catch (error) {
    console.error("Error enviando WhatsApp:", error.response?.data);
  }
}

// ====== INICIAR SERVIDOR ======
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
});
