import { openModal, setupModal, showArtworkInModal } from './modal.js';

document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.querySelector('.ctrl_form'); // Formulaire de recherche
  const inputField = document.getElementById('input_name'); 
  const artlistHtml = document.getElementsByClassName('art_list')[0]; // Résultats
  const pageDisplay = document.querySelector('.page'); // Affichage de la page
  const nextPageBtn = document.querySelector('.btn_next'); 
  const previousPageBtn = document.querySelector('.btn_previous'); 
  const loadingGif = document.getElementById('loadingGif'); 

  // Références pour le modal
  const modal = document.getElementById('artModal');
  const framePainting = document.getElementById('frame_painting');
  const artInfos = document.querySelector('.art_infos');
  const closeModalBtn = document.querySelector('.close');

  // Configurer le modal
  setupModal(modal, closeModalBtn);

  const artworksPerPage = 12; // Nombre d'oeuvres à afficher par page
  let iiifUrlBase = ''; // Stocker l'URL de base IIIF
  let artworksData = []; // Stocker les oeuvres récupérées
  let currentPage = 1; // Page actuelle
  let totalPages = 1; // Total des pages
  let currentSearch = "";

  // Afficher le GIF de chargement
  function showLoading() {
    loadingGif.style.display = 'block';
  }

  // Masquer le GIF de chargement
  function hideLoading() {
    loadingGif.style.display = 'none';
  }

  // Activer ou désactiver les boutons de pagination
  function togglePaginationButtons(enable) {
    nextPageBtn.disabled = !enable;
    previousPageBtn.disabled = !enable;
  }

  // Saisie dans le champ de recherche
  inputField.addEventListener('input', () => {
    const query = inputField.value.trim();
    if (!query) {
      resetSearch(); // Reboot la recherche si aucun caractère
    }
  });

  // Envoi de la recherche
  searchForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Empêcher le refresh de la page

    const query = inputField.value.trim();
    if (query) {
      currentSearch = query;

      // Enregistrer la recherche dans l'historique
      let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
      if (!searchHistory.includes(currentSearch)) {
        searchHistory.push(currentSearch);
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
      }

      resetSearch();
      showLoading();
      fetchAllArtworks(currentSearch); // Récupérer les oeuvres
    } else {
      resetSearch(); // Si le champ est vide, réinitialiser les résultats
    }
  });

  // Réinitialiser la recherche
  function resetSearch() {
    artworksData = [];
    currentPage = 1;
    artlistHtml.innerHTML = '';
    pageDisplay.textContent = '';
    togglePaginationButtons(false);
    hideLoading();
  }

  // Récupérer les oeuvres
  function fetchAllArtworks(query, page = 1) {
    const searchUrl = `https://api.artic.edu/api/v1/artworks/search?q=${encodeURIComponent(query)}&page=${page}&limit=100&fields=id,title,image_id,artist_title,date_start,description,term_titles,material_titles`
    fetch(searchUrl)
  .then(response => response.json())
  .then(data => {
    console.log('Data from API:', data); // Log pour voir les données de l'API
    if (data.config && data.config.iiif_url) {
      iiifUrlBase = data.config.iiif_url;
    }
    artworksData = artworksData.concat(data.data);
    totalPages = Math.ceil(artworksData.length / artworksPerPage);

    if (data.pagination && data.pagination.current_page < data.pagination.total_pages) {
      fetchAllArtworks(query, data.pagination.current_page + 1);
    } else {
      hideLoading();
      displayPage(1);
      togglePaginationButtons(true);
    }
  })
  .catch(error => {
    hideLoading();
    console.error('Erreur lors de la récupération des oeuvres:', error);
  });
  }

  // Afficher les oeuvres sur une page
  function displayPage(pageNumber) {
    artlistHtml.innerHTML = '';
    const startIndex = (pageNumber - 1) * artworksPerPage;
    const endIndex = startIndex + artworksPerPage;
    const artworksToDisplay = artworksData.slice(startIndex, endIndex);
  
    // Afficher chaque œuvre
    artworksToDisplay.forEach((artwork, index) => {
      const title = artwork.title || 'Titre non disponible';
      const imageId = artwork.image_id;
      const imageUrl = imageId
        ? `${iiifUrlBase}/${imageId}/full/843,/0/default.jpg`
        : 'https://villersvolley.fr/wp-content/uploads/2018/09/0F5D0F4A-07D7-4A1F-B5EB-7CECD2F3ED6F.png'; // Image placeholder si pas d'image
  
      // Créer un élément li pour chaque œuvre
      const listItem = document.createElement('li');
      listItem.innerHTML = `
        <h2>${title}</h2>
        <button id="btn_list-artwork-${pageNumber}-${index}" class="img_artwork" style="background-image: url('${imageUrl}'); background-size: cover; width: 200px; height: 200px;">
        </button>
        <button id="btn_add-favs"><p>♡</p></button>
      `;
      artlistHtml.appendChild(listItem);
  
      //  ouvrir le modal et afficher les infos
      const artworkButton = document.getElementById(`btn_list-artwork-${pageNumber}-${index}`);
      artworkButton.addEventListener('click', () => {
        // Transmettre toutes les informations nécessaires à showArtworkInModal
        showArtworkInModal(artwork, framePainting, artInfos, modal);
      });
    });
  
    pageDisplay.textContent = `Page: ${pageNumber} / ${totalPages}`;
  }

  // Fonction pour aller à la page suivante
  nextPageBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      displayPage(currentPage);
    }
  });

  // Fonction pour revenir à la page précédente
  previousPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      displayPage(currentPage);
    }
  });
});
