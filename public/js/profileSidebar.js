document.addEventListener('DOMContentLoaded', function () {
  const profileBtn = document.getElementById('profileBtn'); // mobile button
  const profileSidebar = document.getElementById('profileSidebar'); // sidebar itself
  const closeBtn = document.getElementById('closeProfile'); // close button inside sidebar

  if (profileBtn && profileSidebar) {
    profileBtn.addEventListener('click', () => {
      profileSidebar.classList.toggle('active');
    });
  }

  if (closeBtn && profileSidebar) {
    closeBtn.addEventListener('click', () => {
      profileSidebar.classList.remove('active');
    });
  }
});
