// Menu de navigation Début
function openNav() {
    document.querySelector(".links").style.width = "100%";
    document.querySelector("body").style.overflow = "hidden";

    const paypal = document.getElementById("paypal-button-container");
    if (paypal) paypal.classList.add("hide-paypal");
}
function closeNav() {
    document.querySelector(".links").style.width = "0%";
    document.querySelector("body").style.overflow = "unset";

    const paypal = document.getElementById("paypal-button-container");
    if (paypal) paypal.classList.remove("hide-paypal");
}
// Fermer le menu quand on clique sur un lien
document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll('.links a').forEach(function (link) {
        link.addEventListener('click', function () {
            if (window.innerWidth <= 1140) {
                closeNav();
            }
        });
    });
});
//   Menu de navigation Fin

// Contenu de réservation
const pricePerNight = 239;
const cleaningFee = 250;

function calculateTotal(startStr, endStr) {
    const start = luxon.DateTime.fromISO(startStr);
    const end = luxon.DateTime.fromISO(endStr);

    if (start.isValid && end.isValid && end > start) {
        const nights = Math.floor(end.diff(start, 'days').days);
        const base = nights * pricePerNight;
        const subtotal = base + cleaningFee;

        const tps = +(subtotal * 0.05).toFixed(2);
        const tvq = +(subtotal * 0.09975).toFixed(2);
        const total = Math.round((subtotal + tps + tvq) * 100) / 100;

        // Affichage
        document.getElementById('nightsLine').textContent = `${pricePerNight}$ CAD x ${nights} nuit${nights > 1 ? 's' : ''} = ${base.toFixed(2)}$ CAD`;
        document.getElementById('cleaningFeeLine').textContent = `${cleaningFee.toFixed(2)}$ CAD`;
        document.getElementById('tpsLine').textContent = `${tps.toFixed(2)}$ CAD`;
        document.getElementById('tvqLine').textContent = `${tvq.toFixed(2)}$ CAD`;
        document.getElementById('totalPrice').textContent = total.toFixed(2);

        return total;
    } else {
        document.getElementById('nightsLine').textContent = '';
        document.getElementById('cleaningFeeLine').textContent = '0.00$ CAD';
        document.getElementById('tpsLine').textContent = '0.00$ CAD';
        document.getElementById('tvqLine').textContent = '0.00$ CAD';
        document.getElementById('totalPrice').textContent = '0.00';

        return 0;
    }
}

// Initialisation du bouton PayPal
paypal.Buttons({
    createOrder: function (data, actions) {
        // Récupère le total au moment du clic
        let total = parseFloat(document.getElementById('totalPrice').textContent);
        if (isNaN(total) || total <= 0) {
            alert("Veuillez choisir une période de réservation valide.");
            return;
        }

        return actions.order.create({
            purchase_units: [{
                amount: {
                    value: total.toFixed(2) // PayPal attend une string avec 2 décimales
                }
            }]
        });
    },
    onApprove: async function (data, actions) {
        try {
            const details = await actions.order.capture();
            const email = details.payer.email_address;
            const name = details.payer.name.given_name;
            const total = parseFloat(document.getElementById('totalPrice').textContent);
            const range = document.getElementById('dateRange').value;
            const [startDate, endDate] = range.split(' - ');

            // Envoi de l’e-mail de confirmation
            const emailRes = await fetch(`${backendUrl}/send-confirmation-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, name, startDate, endDate, total })
            });

            if (!emailRes.ok) throw new Error("Erreur lors de l'envoi de l'e-mail de confirmation.");
            console.log("E-mail envoyé avec succès.");

            // Enregistrement de la réservation
            const reservationRes = await fetch(`${backendUrl}/add-reservation`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, startDate, endDate, total })
            });

            if (!reservationRes.ok) {
                const errorText = await reservationRes.text(); // récupère le texte de l'erreur côté serveur
                console.error("Erreur enregistrement réservation:", errorText);
                throw new Error("Erreur lors de l'enregistrement de la réservation.");
            }

            // ✅ Redirection vers la page de succès
            const confirmation = document.getElementById("confirmationMessage");
            if (confirmation) {
                confirmation.textContent = "✅ Votre réservation a bien été confirmée. Merci !";
                confirmation.style.display = "block";
                confirmation.scrollIntoView({ behavior: 'smooth' });

                // On garde en mémoire que la réservation a été confirmée
                localStorage.setItem('reservationConfirmed', 'true');

            }


        } catch (err) {
            console.error(err);
            alert("Une erreur est survenue pendant le traitement de votre réservation. Merci de réessayer.");
        }
    }


}).render('#paypal-button-container');



// paypal Fin

function clearDate() {
    document.getElementById('dateRange').value = '';
    document.getElementById('nightsLine').textContent = '';
    document.getElementById('cleaningFeeLine').textContent = '0$ CAD';
    document.getElementById('taxesLine').textContent = '0$ CAD';
    document.getElementById('totalPrice').textContent = '0';
    if (picker) picker.clearSelection();
}
// Définir la base URL du backend selon l'environnement
const backendUrl = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3000'
    : 'https://chalet-novelera.onrender.com/'; // Remplace par ton URL Render ici

async function getBlockedDates() {
    try {
        const response = await fetch(`${backendUrl}/unavailable-dates`);
        return await response.json();
    } catch (e) {
        console.error("Erreur récupération dates bloquées:", e);
        return [];
    }
}

let picker;

async function initPicker() {
    const lockedDates = await getBlockedDates();

    picker = new Litepicker({
        element: document.getElementById('dateRange'),
        singleMode: false,
        format: 'YYYY-MM-DD',
        lockDays: lockedDates,
        minDate: luxon.DateTime.now().toFormat('yyyy-MM-dd'),
        tooltipText: {
            one: '1 nuit',
            other: '%d nuits',
        },
        // ✅ Calcule automatiquement quand les dates sont choisies
        setup: (picker) => {
            picker.on('selected', (startDate, endDate) => {
                if (startDate && endDate) {
                    calculateTotal(startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'));
                }
            });
        }
    });
}

window.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('reservationConfirmed') === 'true') {
        const confirmation = document.getElementById("confirmationMessage");
        if (confirmation) {
            confirmation.textContent = "✅ Votre réservation a bien été confirmée. Merci !";
            confirmation.style.display = "block";
            confirmation.scrollIntoView({ behavior: 'smooth' });

            // Supprimer le flag pour ne pas le montrer à chaque fois
            localStorage.removeItem('reservationConfirmed');
        }
    }
});


initPicker();