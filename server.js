const express = require('express');
const ical = require('node-ical');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

// Sert tous les fichiers statiques du dossier public

app.use(express.static(path.join(__dirname, 'public')));
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
      from: `"Chalet NovelEra" <${process.env.GMAIL_USER}>`,
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

// // Pour verifier que deux dates ne se chevauchent pas
// function datesSeChevauchent(debut1, fin1, debut2, fin2) {
//   return (new Date(debut1) < new Date(fin2)) && (new Date(debut2) < new Date(fin1));
// }



// 📝 Enregistrement d’une réservation locale
app.post('/add-reservation', async (req, res) => {
  const { name, email, startDate, endDate, total } = req.body;

  if (!startDate || !endDate || !email || !name || !total) {
    return res.status(400).send({ success: false, error: 'Champs requis manquants' });
  }

  const nouvelleReservation = {
    name,
    email,
    startDate: new Date(startDate).toISOString(),
    endDate: new Date(endDate).toISOString(),
    total
  };

  const cheminReservations = path.join(__dirname, 'reservations.json');

  try {
    const datesBloquées = new Set();

    // 🔹 Airbnb
    const dataICal = await ical.async.fromURL(icalURL);
    for (let key in dataICal) {
      const evt = dataICal[key];
      if (evt.type === 'VEVENT') {
        for (let d = new Date(evt.start); d < new Date(evt.end); d.setDate(d.getDate() + 1)) {
          datesBloquées.add(d.toISOString().split('T')[0]);
        }
      }
    }

    // 🔹 Locales
    if (fs.existsSync(cheminReservations)) {
      const reservationsLocales = JSON.parse(fs.readFileSync(cheminReservations, 'utf-8'));
      for (const r of reservationsLocales) {
        for (let d = new Date(r.startDate); d < new Date(r.endDate); d.setDate(d.getDate() + 1)) {
          datesBloquées.add(d.toISOString().split('T')[0]);
        }
      }
    }

    // 🔹 Vérification si une date de la nouvelle réservation est déjà bloquée
    const datesDemandées = [];
    for (let d = new Date(startDate); d < new Date(endDate); d.setDate(d.getDate() + 1)) {
      datesDemandées.push(d.toISOString().split('T')[0]);
    }

    const conflit = datesDemandées.some(date => datesBloquées.has(date));
    if (conflit) {
      console.log("⛔ Conflit détecté : certaines dates sont déjà prises.");
      return res.status(409).send({ success: false, error: 'Une ou plusieurs dates ne sont plus disponibles.' });
    }

    // 🔹 Enregistrement
    let reservationsLocales = [];
    if (fs.existsSync(cheminReservations)) {
      reservationsLocales = JSON.parse(fs.readFileSync(cheminReservations, 'utf-8'));
    }

    reservationsLocales.push(nouvelleReservation);
    fs.writeFileSync(cheminReservations, JSON.stringify(reservationsLocales, null, 2));

    console.log("✅ Réservation enregistrée :", nouvelleReservation);
    res.status(200).send({ success: true });

  } catch (error) {
    console.error("❌ Erreur lors du traitement de la réservation :", error);
    res.status(500).send({ success: false, error: "Erreur interne serveur" });
  }
});



app.listen(PORT, () => {
  const isLocal = process.env.NODE_ENV !== 'production';
  const host = isLocal ? 'http://localhost' : 'https://chalet-novelera.onrender.com';
  console.log(`✅ Serveur en ligne sur ${host}:${PORT}`);
});