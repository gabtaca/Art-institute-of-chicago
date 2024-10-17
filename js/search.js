document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.querySelector('.ctrl_form'); // Form de recherche
  const inputField = document.getElementById('input_name'); 
  const artlistHtml = document.getElementsByClassName('art_list')[0]; // résultats
  const pageDisplay = document.querySelector('.page'); // numéro de page
  const nextPageBtn = document.querySelector('.btn_next'); 
  const previousPageBtn = document.querySelector('.btn_previous'); 
  const loadingGif = document.getElementById('loadingGif'); 
  

  let iiifUrlBase = ''; // Stocker l'URL de base de IIIF
  let artworksData = []; // Stocker les oeuvres récupérées
  let currentPage = 1; // Page actuelle
  const artworksPerPage = 12; // Nombre d'oeuvres à afficher par page
  let totalPages = 1; // Total des pages

  // Afficher le GIF de chargement
  function showLoading() {
    loadingGif.style.display = 'block';
  }

  // Masquer le GIF de chargement
  function hideLoading() {
    loadingGif.style.display = 'none';
  }

  // Activer ou désactiver les boutons de pagination (probleme avec les resets de la recherche)
  function togglePaginationButtons(enable) {
    nextPageBtn.disabled = !enable;
    previousPageBtn.disabled = !enable;
  }

  // Saisie dans le champ de recherche pour surveiller les changements en temps réel
  inputField.addEventListener('input', () => {
    const query = inputField.value.trim();
    if (!query) {
      resetSearch(); // Reboot la recherche si il ny a pas de character
    }
  });

  // Envoie de  la recherche
  searchForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Empêcher la page de reffresh
    let searcHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
    
    

    const query = inputField.value.trim(); // Saisie de la valeur de l'input pour voir si les characters sont effacés
    if (query) {
      resetSearch(); // reset la recherche
      showLoading(); // load la gif de chargement
      fetchAllArtworks(query); // Récupérer toutes les oeuvres
    } else {
      resetSearch(); // Si le champ est vide, réinitialiser les résultats
    }
  });

  // reset la recherche et la pagination
  function resetSearch() {
    artworksData = []; // Vider les d'oeuvres de la recherche précédentes
    currentPage = 1; // REboot la pagination à la première page
    artlistHtml.innerHTML = ''; // Vider la liste affichée
    pageDisplay.textContent = ''; // Réinitialiser l'affichage de la page
    togglePaginationButtons(false); // Désactiver les boutons de pagination
    hideLoading(); // Masquer l'image de chargement si présente
  }

  // Fonction pour récupérer toutes les pages d'oeuvres dispos
  function fetchAllArtworks(query, page = 1) {
    const searchUrl = `https://api.artic.edu/api/v1/artworks/search?q=${encodeURIComponent(query)}&page=${page}&limit=100&fields=id,title,image_id`;
    fetch(searchUrl)
      .then(response => response.json())
      .then(data => {
        if (data.config && data.config.iiif_url) {
          iiifUrlBase = data.config.iiif_url; // Récupérer l'URL de base IIIF
        }
        artworksData = artworksData.concat(data.data); // Ajouter les résultats à artworksData
        totalPages = Math.ceil(artworksData.length / artworksPerPage); // Calculer le nombre total de pages

        if (data.pagination && data.pagination.current_page < data.pagination.total_pages) {
          // Si d'autres pages sont disponibles, continuer la récupération
          fetchAllArtworks(query, data.pagination.current_page + 1);
        } else {
          // masquer le GIF et afficher la première page
          hideLoading();
          displayPage(1);
          togglePaginationButtons(true); // Activer les boutons de pagination
        }
      })
      .catch(error => {
        hideLoading();
        console.error('Erreur lors de la récupération des oeuvres:', error);
      });
  }




// Afficher les oeuvres sur une page
function displayPage(pageNumber) {
  artlistHtml.innerHTML = ''; // Vider les résultats actuels
  const startIndex = (pageNumber - 1) * artworksPerPage;
  const endIndex = startIndex + artworksPerPage;
  const artworksToDisplay = artworksData.slice(startIndex, endIndex);

  // Afficher chaque oeuvre
  artworksToDisplay.forEach((artwork, index) => {
    const title = artwork.title || 'Titre non disponible';
    const imageId = artwork.image_id;
    const imageUrl = imageId
      ? `${iiifUrlBase}/${imageId}/full/843,/0/default.jpg`
      : 'https://villersvolley.fr/wp-content/uploads/2018/09/0F5D0F4A-07D7-4A1F-B5EB-7CECD2F3ED6F.png'; // Image placeholder si pas d'image

    // Créer un élément li pour chaque oeuvre
    const listItem = document.createElement('li');
    listItem.innerHTML = `
      <h2>${title}</h2>
      <button id="btn_list-artwork-${pageNumber}-${index}" class="img_artwork" style="background-image: url('${imageUrl}'); background-size: cover; width: 200px; height: 200px;">
      </button>
      <button id="btn_add-favs"><p>♡</p></button>
    `;
    artlistHtml.appendChild(listItem);

    // Ajouter d'autres événements ou logiques ici si nécessaire
  });

  // Mettre à jour la pagination
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