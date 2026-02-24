// server-test.js
const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// =======================
// ✅ Endpoint para verificación de webhook
// =======================
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
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
    console.log('📩 WEBHOOK RECIBIDO:');
    console.log(JSON.stringify(req.body, null, 2));

    const entry = req.body.entry?.[0]?.changes?.[0]?.value;
    const message = entry?.messages?.[0];
    if (!message) return res.sendStatus(200);

    const from = message.from;
    const text = message.text?.body || '';

    console.log('📨 Mensaje recibido de', from, ':', text);

    // -----------------------
    // Respuesta de prueba (sin token real)
    console.log(`✅ Simulando envío de mensaje a ${from}: "Hola! Este es un mensaje de prueba."`);

    // No hacemos la llamada real a WhatsApp Cloud API
    // Esto evita cualquier error de token
    res.sendStatus(200);
  } catch (error) {
    console.error('❌ Error en el webhook:', error.message);
    res.sendStatus(500);
  }
});

// =======================
// 🔹 Iniciar servidor
// =======================
app.listen(PORT, () => {
  console.log(`Servidor de prueba escuchando en puerto ${PORT}`);
});
