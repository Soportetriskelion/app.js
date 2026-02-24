app.post("/webhook", async (req, res) => {
  try {
    const body = req.body;
    const value = body.entry?.[0]?.changes?.[0]?.value;

    // ✅ ignorar eventos que no son mensajes
    if (!value.messages) {
      return res.sendStatus(200);
    }

    const message = value.messages[0];
    const from = message.from;
    const text = message.text?.body;

    console.log("📩 Mensaje recibido:", text);

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
        text: { body: "✅ Mensaje recibido correctamente" }
      }
    });

    res.sendStatus(200);

  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
    res.sendStatus(500);
  }
});
