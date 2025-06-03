// Menu de navigation Début
function openNav() {
    document.querySelector(".links").style.width = "100%";
    document.querySelector("body").style.overflow = "hidden";
}
function closeNav() {
    document.querySelector(".links").style.width = "0%";
    document.querySelector("body").style.overflow = "unset";
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
// Menu de navigation Fin


// Boite de dialogue modalités Début
function openModal() {
    document.getElementById('modalOverlay').style.display = 'flex';
}

function closeModal() {
    document.getElementById('modalOverlay').style.display = 'none';
}

// Boite de dialogue modalité Fin


// Boite de dialogue description Début
// Ouvrir le modal
function ouvrirCommoditeModal() {
    document.getElementById('commodite-modal').style.display = 'block';
}

// Fermer le modal
function fermerCommoditeModal() {
    document.getElementById('commodite-modal').style.display = 'none';
}

// Fermer si on clique en dehors de la boîte
window.onclick = function (event) {
    const modal = document.getElementById('commodite-modal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
// Boite de dialogue descriptions Fin


// Boite de dialogue réglements Début
function ouvrirReglementModal() {
    document.getElementById('reglement-modal').style.display = 'block';
}

function fermerReglementModal() {
    document.getElementById('reglement-modal').style.display = 'none';
}

window.addEventListener('click', function (event) {
    const modal = document.getElementById('reglement-modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});
// Boite de dialogue réglements Fin


// Gallerie Début
document.addEventListener('DOMContentLoaded', function () {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const gallery = document.getElementById('gallery');
    const modal = document.getElementById('modal');
    const modalGallery = document.getElementById('modalGallery');
    const viewer = document.getElementById('viewer');
    const modalImg = document.getElementById('modalImage');
    const imageTitle = document.getElementById('imageTitle');
    const closeModalBtn = document.getElementById('closeModal');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');

    let currentImages = [];
    let currentIndex = 0;
    let currentRubrique = 'interieur';

    // imagesData avec des clés, prêt pour la traduction
    const imagesData = {
        interieur: {
            voir_les_salons: [
                { src: 'images/Salonns.avif', name: 'salon_1' },
                { src: 'images/Salon 4.jpeg', name: 'salon_2' },
                { src: 'images/Salons 3.avif', name: 'salon_3' },
                { src: 'images/Salon 4.avif', name: 'salon_4' },
                { src: 'images/Sous-sol 1.avif', name: 'salon_5' },
                { src: 'images/Salon 2.avif', name: 'salon_6' }
            ],
            voir_les_chambres: [
                { src: 'images/Chambres.avif', name: 'chambre_1_tres_grand_lit' },
                { src: 'images/Chambress.avif', name: 'chambre_1' },
                { src: 'images/Chambree.avif', name: 'chambre_2_tres_grand_lit' },
                { src: 'images/Chambre 3.avif', name: 'chambre_2' },
                { src: 'images/Chambre 2.avif', name: 'chambre_3_deux_grands_lits' },
                { src: 'images/Chambre.avif', name: 'chambre_3' },
                { src: 'images/Chambre 1.avif', name: 'chambre_4_deux_grands_lits' },
                { src: 'images/lit.avif', name: 'chambre_4' }
            ],
            voir_les_salles_de_bains: [
                { src: 'images/Toilette 1.avif', name: 'salle_de_bain_1' },
                { src: 'images/Toilettes.avif', name: 'salle_de_bain_2' },
                { src: 'images/Toilette 2.avif', name: 'salle_de_bain_3' },
                { src: 'images/Toilette.avif', name: 'salle_de_bain_4' },
                { src: 'images/Washroom.avif', name: 'salle_de_bain_5' }
            ],
            voir_la_cuisine: [
                { src: 'images/Salons.avif', name: 'cuisine_1' },
                { src: 'images/Cuisines.avif', name: 'cuisine_2' },
                { src: 'images/Cuisine.avif', name: 'cuisine_3' },
                { src: 'images/Cuisine 1.avif', name: 'cuisine_4' },
                { src: 'images/Saloncuisine.avif', name: 'cuisine_5' },
                { src: 'images/Salonss.avif', name: 'cuisine_6' }
            ],
            salle_a_manger: [
                { src: 'images/Salons 1.avif', name: 'salle_a_manger_1' },
                { src: 'images/Salon.avif', name: 'salle_a_manger_2' },
                { src: 'images/salle_a_manger.avif', name: 'salle_a_manger_3' },
                { src: 'images/table_a_manger2.avif', name: 'salle_a_manger_4' }
            ],
            sous_sol: [
                { src: 'images/Sous-sols 1.avif', name: 'sous_sol_1' },
                { src: 'images/Sous-sols.avif', name: 'sous_sol_2' },
                { src: 'images/Sous-sol.avif', name: 'sous_sol_3' },
                { src: 'images/Billard 2.avif', name: 'sous_sol_4' },
                { src: 'images/Salon 4.avif', name: 'sous_sol_5' }
            ]
        },
        exterieur: {
            le_balcon: [
                { src: 'images/balcon.avif', name: 'balcon_1' }
            ],
            la_terasse: [
                { src: 'images/Dehors.avif', name: 'terasse_1' },
                { src: 'images/terrasse.avif', name: 'terasse_2' }
            ],
            le_spa: [
                { src: 'images/spa.avif', name: 'spa_1' },
                { src: 'images/Exterior 1.avif', name: 'Spa' }
            ],
            cours_arriere_et_avant: [
                { src: 'images/Dehors.avif', name: 'cours_1' },
                { src: 'images/Devant 0.avif', name: 'cours_2' },
                { src: 'images/Devant.avif', name: 'cours_2' }
            ]
        },
        alentours: {
            le_lac: [
                { src: 'images/Lac.avif', name: 'lac_1' },
                { src: 'images/grandlac.avif', name: 'lac_2' },
                { src: 'images/Lac en hiver.avif', name: 'lac_3' }
            ],
            le_paysage: [
                { src: 'images/Exteriors.avif', name: 'paysage_1' },
                { src: 'images/Les montagne.avif', name: '' },
            ]
        }
    };

    // Fonction d'affichage de la galerie principale (catégories)
    function updateGallery(rubrique) {
        currentRubrique = rubrique;
        gallery.innerHTML = '';
        const rubData = imagesData[rubrique];
        if (!rubData) return;

        for (let cat in rubData) {
            const img = rubData[cat][0];
            if (!img) continue;

            const div = document.createElement('div');
            div.className = `pic ${rubrique}`;
            div.dataset.rubrique = rubrique;
            div.dataset.category = cat;
            div.innerHTML = `
                <img src="${img.src}" alt="${t(img.name)}">
                <div class="overlay">${t(cat)}</div>
            `;
            div.addEventListener('click', () => openCategoryPopup(rubrique, cat));
            gallery.appendChild(div);
        }
    }

    // Affiche un popup avec toutes les images d'une catégorie
    function openCategoryPopup(rubrique, cat) {
        const images = imagesData[rubrique][cat];
        showModalGallery(images);
    }

    // Affiche un popup avec toutes les images de la rubrique
    function openAllImagesPopup() {
        const rubData = imagesData[currentRubrique];
        if (!rubData) return;

        let allImages = [];
        for (let cat in rubData) {
            allImages = allImages.concat(rubData[cat]);
        }
        showModalGallery(allImages);
    }

    // Affiche les miniatures dans la modale
    function showModalGallery(images) {
        modalGallery.innerHTML = '';
        currentImages = images;
        viewer.style.display = 'none';

        images.forEach((img, i) => {
            const thumb = document.createElement('div');
            thumb.className = 'thumb';
            thumb.innerHTML = `<img src="${img.src}" alt="${t(img.name)}"><span>${t(img.name)}</span>`;
            thumb.addEventListener('click', () => openViewer(i));
            modalGallery.appendChild(thumb);
        });

        modal.style.display = 'flex';
      
    }

    // Affiche une image en grand dans la modale
    function openViewer(index) {
        currentIndex = index;
        const img = currentImages[index];
        modalImg.src = img.src;
        imageTitle.textContent = t(img.name);
        viewer.style.display = 'block';
         scrollToViewer();
    }
   function scrollToViewer() {
    const viewer = document.getElementById("viewer");
    viewer.scrollIntoView({ behavior: "smooth" });
  }

    nextBtn.addEventListener('click', () => {
        if (currentImages.length === 0) return;
        currentIndex = (currentIndex + 1) % currentImages.length;
        openViewer(currentIndex);
    });

    prevBtn.addEventListener('click', () => {
        if (currentImages.length === 0) return;
        currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
        openViewer(currentIndex);
    });

    closeModalBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        viewer.style.display = 'none';
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelector('.filter-btn.active')?.classList.remove('active');
            btn.classList.add('active');

            const filtre = btn.dataset.filter;

            if (filtre === 'tout') {
                openAllImagesPopup();
            } else {
                updateGallery(filtre);
            }
        });
    });

    document.getElementById('showMoreBtn').addEventListener('click', () => {
        openAllImagesPopup();
    });
modal.addEventListener('click', (event) => {
  if (event.target === modal) {
    modal.style.display = 'none';
    viewer.style.display = 'none';
  }
});

    // Chargement initial
    updateGallery('interieur');

    // Pour la traduction dynamique de la galerie
    window.translateGallery = function() {
        updateGallery(currentRubrique);
    };
});
// terminer galerie 

// Témoignages Début
const temoignageTrack = document.querySelector('.carousel-track');
const temoignageSlides = document.querySelectorAll('.comment');
const temoignagePrevBtn = document.querySelector('.carousel-btn.prev');
const temoignageNextBtn = document.querySelector('.carousel-btn.next');

let temoignageIndex = 0;
const visibleCount = 2; // nombre de commentaires visibles à la fois

function updateTemoignageCarousel() {
    const slideWidth = temoignageSlides[0].offsetWidth + 20; // largeur + margin horizontal
    temoignageTrack.style.transform = `translateX(-${temoignageIndex * slideWidth}px)`;
}

temoignageNextBtn.addEventListener('click', () => {
    if (temoignageIndex < temoignageSlides.length - visibleCount) {
        temoignageIndex++;
    } else {
        temoignageIndex = 0; // retour au début
    }
    updateTemoignageCarousel();
});

temoignagePrevBtn.addEventListener('click', () => {
    if (temoignageIndex > 0) {
        temoignageIndex--;
    } else {
        temoignageIndex = temoignageSlides.length - visibleCount; // aller à la fin
    }
    updateTemoignageCarousel();
});

// défilement automatique
setInterval(() => {
    if (temoignageIndex < temoignageSlides.length - visibleCount) {
        temoignageIndex++;
    } else {
        temoignageIndex = 0;
    }
    updateTemoignageCarousel();
}, 6000);
// Témoignage Fin