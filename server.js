const express = require('express');
const ical = require('node-ical');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Variables d'environnement gmail
require('dotenv').config();

// 🔗 Lien iCal Airbnb
const icalURL = 'https://www.airbnb.com/calendar/ical/1129826603695867182.ics?s=31d707c5c00bde078b1b45a99a21d832&locale=fr-CA';

// 🔄 Route GET pour toutes les dates non disponibles (Airbnb + locales)
app.get('/unavailable-dates', async (req, res) => {
  try {
    const data = await ical.async.fromURL(icalURL);
    const unavailableDates = new Set();

    // Airbnb
    for (let k in data) {
      const event = data[k];
      if (event.type === 'VEVENT') {
        const start = new Date(event.start);
        const end = new Date(event.end);
        for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
          unavailableDates.add(d.toISOString().split('T')[0]);
        }
      }
    }

    // Réservations locales
    const localPath = path.join(__dirname, 'reservations.json');
    if (fs.existsSync(localPath)) {
      const localData = JSON.parse(fs.readFileSync(localPath, 'utf-8'));
      localData.forEach(reservation => {
        const start = new Date(reservation.startDate);
        const end = new Date(reservation.endDate);
        for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
          unavailableDates.add(d.toISOString().split('T')[0]);
        }
      });
    }

    res.json(Array.from(unavailableDates));
  } catch (error) {
    console.error('Erreur lors de la récupération iCal:', error);
    res.status(500).send('Erreur de récupération du calendrier');
  }
});

// 📩 Envoi d’un e-mail de confirmation
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  }
});

app.post('/send-confirmation-email', async (req, res) => {
  const { email, name, startDate, endDate, total } = req.body;

  try {
    await transporter.sendMail({
      from: '"Chalet NovelEra" <massamba2377@gmail.com>',
      to: email,
      subject: 'Confirmation de votre réservation - Chalet NovelEra',
      html: `
        <h2>Bonjour ${name},</h2>
        <p>Merci pour votre réservation !</p>
        <p><strong>Dates :</strong> du ${startDate} au ${endDate}</p>
        <p><strong>Montant total :</strong> ${total}$ CAD</p>
        <p>Nous avons bien reçu votre paiement.</p>
        <p>Au plaisir de vous accueillir !</p>
        <br/>
        <em>Chalet NovelEra</em>
      `
    });

    res.status(200).send({ success: true });
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'e-mail :", error);
    res.status(500).send({ success: false, error });
  }
});

// 📝 Enregistrement d’une réservation locale
app.post('/add-reservation', (req, res) => {
  const { name, email, startDate, endDate, total } = req.body;

  if (!startDate || !endDate || !email || !name || !total) {
    return res.status(400).send({ success: false, error: 'Champs requis manquants' });
  }

  const newReservation = { name, email, startDate, endDate, total };
  const reservationsPath = path.join(__dirname, 'reservations.json');

  let reservations = [];
  try {
    if (fs.existsSync(reservationsPath)) {
      const data = fs.readFileSync(reservationsPath, 'utf-8');
      reservations = JSON.parse(data);
    }

    reservations.push(newReservation);
    fs.writeFileSync(reservationsPath, JSON.stringify(reservations, null, 2));

    res.status(200).send({ success: true });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de la réservation :", error);
    res.status(500).send({ success: false, error });
  }
});

app.listen(PORT, () => {
  const isLocal = process.env.NODE_ENV !== 'production';
  const host = isLocal ? 'http://localhost' : 'https://chalet-novelera.onrender.com/';
  console.log(`✅ Serveur en ligne sur ${host}:${PORT}`);
});