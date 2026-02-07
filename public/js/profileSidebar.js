document.addEventListener("DOMContentLoaded", () => {

  const profileButtons = document.querySelectorAll(".profileBtn");
  const profileSidebar = document.getElementById("profileSidebar");
  const closeBtn = document.getElementById("closeProfile");

  profileButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      profileSidebar.classList.add("active");
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      profileSidebar.classList.remove("active");
    });
  }

});
