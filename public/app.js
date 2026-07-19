const loginScreen = document.getElementById('login-screen');
const appShell = document.getElementById('app-shell');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const authMessage = document.getElementById('auth-message');
const registerMessage = document.getElementById('register-message');
const profileName = document.getElementById('profile-name');
const profileTrigger = document.getElementById('profile-trigger');
const profileMenu = document.getElementById('profile-menu');
const profileMenuName = document.getElementById('profile-menu-name');
const profileMenuEmail = document.getElementById('profile-menu-email');
const showRegisterBtn = document.getElementById('show-register');
const showLoginBtn = document.getElementById('show-login');
const movieModal = document.getElementById('movie-modal');
const modalTitle = document.getElementById('modal-title');
const modalDescription = document.getElementById('modal-description');
const modalCategory = document.getElementById('modal-category');
const modalYear = document.getElementById('modal-year');
const modalRating = document.getElementById('modal-rating');
const modalImage = document.getElementById('modal-image');
const closeModalBtn = document.getElementById('close-modal');
const watchBtn = document.getElementById('watch-btn');
const listBtn = document.getElementById('list-btn');
const navLinks = document.querySelectorAll('.nav-link');
const rowLinks = document.querySelectorAll('.row-link');
const viewSections = document.querySelectorAll('.view-section');
const searchInput = document.getElementById('search-input');
const playerScreen = document.getElementById('player-screen');
const closePlayerBtn = document.getElementById('close-player');
const resumeBtn = document.getElementById('resume-btn');
const backBtn = document.getElementById('back-btn');
const playerTitle = document.getElementById('player-title');
const playerDesc = document.getElementById('player-desc');
const playerMeta = document.getElementById('player-meta');
let currentUser = null;
let allContent = [];
let activeView = 'home';

async function loadContent() {
  try {
    const res = await fetch('/api/content');
    const contentType = res.headers.get('content-type') || '';

    if (!res.ok || !contentType.includes('application/json')) {
      const text = await res.text();
      throw new Error(text || 'No se pudo cargar el contenido');
    }

    const data = await res.json();
    allContent = data;
    renderContentSections(data);
  } catch (error) {
    console.error('No se pudo cargar el contenido', error);
    const container = document.getElementById('novedades');
    if (container) {
      container.innerHTML = '<p class="auth-message">No se pudo cargar el contenido. Reinicia el servidor.</p>';
    }
  }
}

function renderContentSections(items) {
  const groups = {
    novedades: items.filter(item => item.category === 'Novedades'),
    paraTi: items.filter(item => item.category === 'Para ti'),
    top10: items.filter(item => item.category === 'Top 10'),
    trending: items.filter(item => item.category === 'Tendencias')
  };

  renderSection('novedades', groups.novedades);
  renderSection('para-ti', groups.paraTi);
  renderSection('top10', groups.top10);
  renderSection('trending', groups.trending);
  renderSection('series-view', items.filter(item => /Mérida|Río|Luna|Sol|Vespera/i.test(item.title)));
  renderSection('movies-view', items.filter(item => /Ciudad|Horizonte|Sombras|Bahía|Cielo/i.test(item.title)));
  renderSection('wishlist-view', items.slice(0, 4));
}

function openMovieModal(movie) {
  if (!movie) return;
  modalTitle.textContent = movie.title || 'Sin título';
  modalDescription.textContent = movie.description || 'Próximamente disponible';
  modalCategory.textContent = movie.category || 'Película';
  modalYear.textContent = movie.year || '2026';
  modalRating.textContent = `★ ${movie.rating || '8.0'}`;
  modalImage.src = movie.image || '';
  modalImage.alt = movie.title || 'Portada';
  movieModal.classList.remove('hidden');
  document.body.classList.add('modal-open');
}

function closeMovieModal() {
  movieModal.classList.add('hidden');
  document.body.classList.remove('modal-open');
}

function renderSection(id, items) {
  const container = document.getElementById(id);
  if (!container) return;

  container.innerHTML = items.map(item => `
    <article class="card card-animate" role="button" tabindex="0">
      <img src="${item.image}" alt="${item.title}" />
      <div class="card-content">
        <h3>${item.title}</h3>
        <p>${item.description}</p>
        <div class="meta">
          <span>${item.year}</span>
          <span>★ ${item.rating}</span>
        </div>
      </div>
    </article>
  `).join('');

  container.querySelectorAll('.card').forEach((card, index) => {
    const item = items[index];
    card.addEventListener('click', () => openMovieModal(item));
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openMovieModal(item);
      }
    });
  });
}

function showAuthMode(mode) {
  if (mode === 'register') {
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
    authMessage.textContent = '';
    registerMessage.textContent = '';
  } else {
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    authMessage.textContent = '';
    registerMessage.textContent = '';
  }
}

function showView(viewName) {
  activeView = viewName;
  viewSections.forEach(section => {
    section.classList.add('hidden');
  });

  const target = document.getElementById(`view-${viewName}`);
  if (target) {
    target.classList.remove('hidden');
  }

  navLinks.forEach(link => {
    link.classList.toggle('active', link.dataset.view === viewName);
  });
}

function updateProfileUI() {
  const initials = currentUser?.name?.trim()?.charAt(0)?.toUpperCase() || 'U';
  profileName.textContent = initials;
  profileTrigger.textContent = initials;
  profileTrigger.title = currentUser?.name || 'Usuario';
  profileMenuName.textContent = currentUser?.name || 'Usuario';
  profileMenuEmail.textContent = currentUser?.email || '';
}

function toggleProfileMenu() {
  const shouldOpen = profileMenu.classList.contains('hidden');
  profileMenu.classList.toggle('hidden', !shouldOpen);
  profileTrigger.setAttribute('aria-expanded', String(shouldOpen));
}

function closeProfileMenu() {
  profileMenu.classList.add('hidden');
  profileTrigger.setAttribute('aria-expanded', 'false');
}

function logoutUser() {
  currentUser = null;
  updateProfileUI();
  closeProfileMenu();
  loginScreen.classList.remove('hidden');
  appShell.classList.add('hidden');
  document.getElementById('email').value = '';
  document.getElementById('password').value = '';
  document.getElementById('register-name').value = '';
  document.getElementById('register-email').value = '';
  document.getElementById('register-password').value = '';
  searchInput.value = '';
  authMessage.textContent = 'Sesión cerrada. Inicia sesión de nuevo.';
  registerMessage.textContent = '';
  showAuthMode('login');
  closeMovieModal();
  closePlayer();
  showView('home');
}

function openPlayer(item) {
  if (!item) return;
  playerTitle.textContent = item.title || 'Reproduciendo';
  playerDesc.textContent = item.description || 'Una experiencia visual premium';
  playerMeta.textContent = `${item.year || '2026'} • ${item.category || 'Película'} • ★ ${item.rating || '8.0'}`;
  playerScreen.classList.remove('hidden');
  document.body.classList.add('modal-open');
}

function closePlayer() {
  playerScreen.classList.add('hidden');
  document.body.classList.remove('modal-open');
}

showRegisterBtn.addEventListener('click', () => showAuthMode('register'));
showLoginBtn.addEventListener('click', () => showAuthMode('login'));
closeModalBtn.addEventListener('click', closeMovieModal);
closePlayerBtn.addEventListener('click', closePlayer);
resumeBtn.addEventListener('click', () => {
  closePlayer();
  openMovieModal(allContent[0]);
});
backBtn.addEventListener('click', closePlayer);
movieModal.addEventListener('click', (event) => {
  if (event.target === movieModal) {
    closeMovieModal();
  }
});
watchBtn.addEventListener('click', () => {
  watchBtn.textContent = '▶ Reproduciendo';
  setTimeout(() => {
    watchBtn.textContent = '▶ Ver ahora';
  }, 1200);
  openPlayer(allContent[0]);
});
listBtn.addEventListener('click', () => {
  listBtn.textContent = '✓ En tu lista';
  setTimeout(() => {
    listBtn.textContent = '+ Mi lista';
  }, 1200);
});
navLinks.forEach(link => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    showView(link.dataset.view);
  });
});

profileTrigger.addEventListener('click', (event) => {
  event.stopPropagation();
  toggleProfileMenu();
});

profileMenu.addEventListener('click', (event) => {
  const item = event.target.closest('.profile-menu-item');
  if (!item) return;

  event.stopPropagation();
  const action = item.dataset.action;

  if (action === 'logout') {
    logoutUser();
  } else {
    closeProfileMenu();
    if (action === 'profile') {
      const heroTitle = document.querySelector('.hero-content h1');
      const heroDescription = document.querySelector('.hero-description');
      if (heroTitle) heroTitle.textContent = `Hola, ${currentUser?.name || 'Usuario'}`;
      if (heroDescription) heroDescription.textContent = 'Tu cuenta está activa y lista para disfrutar contenido premium.';
    }
  }
});

document.addEventListener('click', (event) => {
  if (!profileTrigger.contains(event.target) && !profileMenu.contains(event.target)) {
    closeProfileMenu();
  }
});

rowLinks.forEach(link => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    showView(link.dataset.view);
  });
});

searchInput.addEventListener('input', (event) => {
  const query = event.target.value.trim().toLowerCase();
  const filtered = allContent.filter(item => `${item.title} ${item.description} ${item.category}`.toLowerCase().includes(query));

  renderContentSections(filtered);
  showView(activeView);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (!movieModal.classList.contains('hidden')) {
      closeMovieModal();
    } else if (!playerScreen.classList.contains('hidden')) {
      closePlayer();
    } else if (!profileMenu.classList.contains('hidden')) {
      closeProfileMenu();
    }
  }
});

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  authMessage.textContent = 'Validando...';

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'No se pudo iniciar sesión');
    }

    currentUser = data.user;
    updateProfileUI();
    loginScreen.classList.add('hidden');
    appShell.classList.remove('hidden');
    await loadContent();
  } catch (error) {
    authMessage.textContent = error.message;
  }
});

registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const name = document.getElementById('register-name').value.trim();
  const email = document.getElementById('register-email').value.trim();
  const password = document.getElementById('register-password').value;

  registerMessage.textContent = 'Creando cuenta...';

  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'No se pudo crear la cuenta');
    }

    currentUser = data.user;
    updateProfileUI();
    loginScreen.classList.add('hidden');
    appShell.classList.remove('hidden');
    await loadContent();
  } catch (error) {
    registerMessage.textContent = error.message;
  }
});

loadContent();
