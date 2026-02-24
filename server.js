para ver mensajes:

app.post("/webhook", (req, res) => {
  console.log("📩 WEBHOOK RECIBIDO:");
  console.log(JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});

