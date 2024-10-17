// modal.js
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