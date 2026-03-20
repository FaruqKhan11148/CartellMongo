'use strict';

// === MODAL ===
const modal = document.querySelector('[data-modal]');
const modalCloseBtn = document.querySelector('[data-modal-close]');
const modalCloseOverlay = document.querySelector('[data-modal-overlay]');

if (modal && modalCloseBtn && modalCloseOverlay) {
  const closeModal = () => modal.classList.add('closed');
  modalCloseOverlay.addEventListener('click', closeModal);
  modalCloseBtn.addEventListener('click', closeModal);
}

// === TOAST ===
const notificationToast = document.querySelector('[data-toast]');
const toastCloseBtn = document.querySelector('[data-toast-close]');

if (notificationToast && toastCloseBtn) {
  toastCloseBtn.addEventListener('click', () =>
    notificationToast.classList.add('closed'),
  );
}

// === MOBILE MENU ===
const mobileMenuOpenBtn = document.querySelectorAll(
  '[data-mobile-menu-open-btn]',
);
const mobileMenu = document.querySelectorAll('[data-mobile-menu]');
const mobileMenuCloseBtn = document.querySelectorAll(
  '[data-mobile-menu-close-btn]',
);
const overlay = document.querySelector('[data-overlay]');

for (let i = 0; i < mobileMenuOpenBtn.length; i++) {
  const closeMobileMenu = () => {
    mobileMenu[i].classList.remove('active');
    overlay.classList.remove('active');
  };

  mobileMenuOpenBtn[i].addEventListener('click', () => {
    mobileMenu[i].classList.add('active');
    overlay.classList.add('active');
  });
}

// === ACCORDION ===
const accordionBtn = document.querySelectorAll('[data-accordion-btn]');
const accordion = document.querySelectorAll('[data-accordion]');

for (let i = 0; i < accordionBtn.length; i++) {
  accordionBtn[i].addEventListener('click', function () {
    const isActive = this.nextElementSibling.classList.contains('active');

    for (let j = 0; j < accordion.length; j++) {
      if (isActive) break;

      if (accordion[j].classList.contains('active')) {
        accordion[j].classList.remove('active');
        accordionBtn[j].classList.remove('active');
      }
    }

    this.nextElementSibling.classList.toggle('active');
    this.classList.toggle('active');
  });
}

// side-bar-loader
document.addEventListener('DOMContentLoaded', () => {
  const desktopProfileBtn = document.getElementById('desktopProfileBtn'); // desktop button
  const mobileProfileBtn = document.getElementById('mobileProfileBtn'); // mobile button
  const profileSidebar = document.getElementById('profileSidebar'); // sidebar itself
  const closeBtn = document.getElementById('closeProfile'); // sidebar close button

  const toggleSidebar = () => profileSidebar.classList.toggle('active');
  const closeSidebar = () => profileSidebar.classList.remove('active');

  if (desktopProfileBtn) {
    desktopProfileBtn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleSidebar();
      console.log('Desktop sidebar clicked');
    });
  }

  if (mobileProfileBtn) {
    mobileProfileBtn.addEventListener('click', () => {
      toggleSidebar();
      console.log('Mobile sidebar clicked');
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeSidebar);
  }
});


// === USER PROFILE LOAD ===
async function loadUserProfile() {
  try {
    const res = await fetch('/api/users/me', { credentials: 'include' });
    if (!res.ok) return;

    const user = await res.json();
    document.getElementById('profileName').innerText = user.name;
    document.getElementById('profileEmail').innerText = user.email;
  } catch (err) {
    console.log('User not logged in');
  }
}

document.querySelectorAll('.sidebar-submenu-title').forEach((el) => {
  el.addEventListener('click', async (e) => {
    if (el.tagName === 'FORM') return;

    e.preventDefault();

    const subId = el.dataset.subcategoryId;
    const container = document.getElementById('right-side-products');
    if (!container || !subId) return;

    container.innerHTML = '';

    try {
      const res = await fetch(`/products/api/subcategory/${subId}`);
      const products = await res.json();

      if (!products.length) {
        container.innerHTML = '<p>No products in this category.</p>';
        return;
      }

      products.forEach((p) => {
        container.innerHTML += `
          <div class="product-card">
            <img src="${p.image_url}" alt="${p.name}" class="product-img"/>
            <h3>${p.name}</h3>
            <p>${p.description}</p>
            <p>Price: ₹${p.price}</p>
            <p>Stock: ${p.stock}</p>
          </div>
        `;
      });
    } catch (err) {
      console.error('Failed to load products', err);
    }
  });
});

loadUserProfile();
