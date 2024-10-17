export function openModal(modal) {
  modal.style.display = "block";
}

export function closeModal(modal) {
  modal.style.display = "none";
}

export function setupModal(modal, closeModalBtn) {
  closeModalBtn.addEventListener("click", () => closeModal(modal));

  window.addEventListener("click", function (event) {
    if (event.target === modal) {
      closeModal(modal);
    }
  });
}

export function showArtworkInModal(artwork, framePainting, artInfos, modal) {
  console.log('Modal is being opened with artwork:', artwork);

  const imageUrlFrame = `https://www.artic.edu/iiif/2/${artwork.image_id}/full/400,/0/default.jpg`;

  // Mett à jour frame_painting dans le modal
  framePainting.innerHTML = `<img src="${imageUrlFrame}" alt="${artwork.title}" style="max-width: 100%; height: auto;">`;

  // Mettre à jour les infos sur l'œuvre dans le modal
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