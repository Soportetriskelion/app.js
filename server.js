// server.js
const express = require('express');
const axios = require('axios');
require('dotenv').config(); // Para cargar .env si estás usando localmente

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN; // Token de WhatsApp Cloud API
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID; // ID de tu número de WhatsApp
const VERIFY_TOKEN = process.env.VERIFY_TOKEN; // Token para verificar webhook

// =======================
// ✅ Endpoint para verificación de webhook
// =======================
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK VERIFICADO ✅');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// =======================
// ✅ Endpoint para recibir mensajes
// =======================
app.post('/webhook', async (req, res) => {
  try {
    // 🔹 Verificar si el token se está leyendo
    console.log('Token leído:', WHATSAPP_TOKEN ? 'OK' : 'NO LEÍDO');

    const entry = req.body.entry?.[0]?.changes?.[0]?.value;
    const message = entry?.messages?.[0];

    if (!message) return res.sendStatus(200); // No hay mensaje

    const from = message.from; // Número del remitente
    const text = message.text?.body || '';
    const contactName = entry.contacts?.[0]?.profile?.name || '';

    console.log('📨 Mensaje recibido de', from, ':', text);

    if (!WHATSAPP_TOKEN) {
      console.error('❌ Token no definido. Revisa tus variables de entorno.');
      return res.sendStatus(500);
    }

    // -----------------------
    // Preparar respuesta
    const responseText = `Hola ${contactName}! Recibí tu mensaje: "${text}"`;

    // -----------------------
    // Enviar respuesta usando WhatsApp Cloud API
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

// =======================
// 🔹 Iniciar servidor
// =======================
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
