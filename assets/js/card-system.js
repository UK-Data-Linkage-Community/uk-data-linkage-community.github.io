window.CardSystem = {

  openModal(id) {

    const modal =
      document.getElementById(id);

    if (!modal) return;

    modal.hidden = false;
  },

  closeModal(id) {

    const modal =
      document.getElementById(id);

    if (!modal) return;

    modal.hidden = true;
  }

};