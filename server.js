// server.js
const express = require('express');
const axios = require('axios');
require('dotenv').config(); // Solo si usas .env local

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const WHATSAPP_TOKEN = process.env.1609500386861065; // Tu token de Meta
const PHONE_NUMBER_ID = process.env.941811762360051; // ID de tu número de WhatsApp

// ✅ Endpoint de verificación (GET) para Webhook
app.get('/webhook', (req, res) => {
  const verify_token = process.env.VERIFY_TOKEN;
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === verify_token) {
      console.log('WEBHOOK VERIFICADO ✅');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// ✅ Endpoint para recibir mensajes (POST)
app.post('/webhook', async (req, res) => {
  try {
    console.log('📩 WEBHOOK RECIBIDO:');
    console.log(JSON.stringify(req.body, null, 2));

    // Validar si hay mensaje
    const entry = req.body.entry?.[0]?.changes?.[0]?.value;
    const message = entry?.messages?.[0];
    if (!message) return res.sendStatus(200);

    const from = message.from;
    const text = message.text?.body;

    console.log('📨 Mensaje:', text);

    // Preparar la respuesta
    const responseText = `Hola! Recibí tu mensaje: "${text}"`;

    // Enviar mensaje usando WhatsApp Cloud API
    const url = `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`;

    const response = await axios.post(
      url,
      {
        messaging_product: 'whatsapp',
        to: from,
        text: { body: responseText }
      },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Mensaje enviado:', response.data);
    res.sendStatus(200);
  } catch (error) {
    console.error('❌ Error al enviar mensaje:', error.response?.data || error.message);
    res.sendStatus(500);
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
