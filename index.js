const { z } = require("zod");
const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');
const webpush = require('web-push');

const app = express();
dotenv.config();

app.use(cors());
app.use(bodyParser.json());

webpush.setVapidDetails(
  process.env.WEB_PUSH_CONTACT,
  process.env.PUBLIC_VAPID_KEY,
  process.env.PRIVATE_VAPID_KEY
);

const publicKey = process.env.PUBLIC_VAPID_KEY;

app.get('/', (req, res) => {
  res.send('Hello world!');
});

app.post('/notifications/subscribe', handleSubscribe);

app.get("/push/public_key", (req, res) => {
  return res.json({ publicKey });
});

app.post("/push/send", handleSendNotification);

app.listen(9000, () => console.log('The server has been started on the port 9000'));

async function handleSubscribe(req, res) {
  try {
    const subscription = req.body;
    console.log(subscription);

    const payload = JSON.stringify({
      title: 'Hello!',
      body: 'It works.',
    });

    await webpush.sendNotification(subscription, payload);
    res.status(200).json({ 'success': true });
  } catch (error) {
    console.error('Error subscribing:', error);
    res.status(500).json({ 'success': false, 'error': 'Internal Server Error' });
  }
}

async function handleSendNotification(request, reply) {
  try {
    const sendPushBody = z.object({
      subscription: z.object({
        endpoint: z.string(),
        keys: z.object({
          p256dh: z.string(),
          auth: z.string()
        })
      })
    });

    console.log(request.body);

    const { subscription } = sendPushBody.parse(request.body);

    await webpush.sendNotification(subscription, "HELLO MUNDO Minhas ");
    reply.status(201).send();
  } catch (error) {
    console.error('Error sending notification:', error);
    reply.status(500).send();
  }
}
