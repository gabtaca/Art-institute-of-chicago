import { openModal, setupModal } from './modal.js';
  
  // Fonction pour afficher les détails de l'oeuvre dans le modal et mettre à jour le frame_painting
  function showArtworkInModal(artwork) {
    const imageUrlFrame = `https://www.artic.edu/iiif/2/${artwork.image_id}/full/400,/0/default.jpg`;

    // Mettre à jour l'élément frame_painting dans le modal
    framePainting.style.backgroundImage = `url(${imageUrlFrame})`;

    // Mettre à jour les infos sur l'oeuvre dans le modal
    artInfos.innerHTML = `
      <h2>${artwork.title || 'Titre non disponible'}</h2>
      <p>Artiste: ${artwork.artist_title || 'Artiste non disponible'}</p>
      <p>Date: ${artwork.date_start || 'Date non disponible'}</p>
      <p>Description: ${artwork.description || 'Description non disponible'}</p>
      <p>Termes: ${artwork.term_titles ? artwork.term_titles.join(', ') : 'Non disponible'}</p>
      <p>Matériel: ${artwork.material_titles ? artwork.material_titles.join(', ') : 'Non disponible'}</p>
    `;

    // Ouvrir le modal
    openModal(modal);
  }