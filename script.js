document.addEventListener("DOMContentLoaded", function () {
  const elemenPopup = document.getElementById("popupPengumuman");

  if (elemenPopup) {
    const popup = new bootstrap.Modal(elemenPopup, {
      backdrop: true,
      keyboard: true
    });

    popup.show();
  }
});