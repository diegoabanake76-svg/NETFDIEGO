const loginScreen = document.getElementById('login-screen');
const appShell = document.getElementById('app-shell');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const authMessage = document.getElementById('auth-message');
const registerMessage = document.getElementById('register-message');
const profileName = document.getElementById('profile-name');
const showRegisterBtn = document.getElementById('show-register');
const showLoginBtn = document.getElementById('show-login');
let currentUser = null;

async function loadContent() {
  const res = await fetch('/api/content');
  const data = await res.json();

  const groups = {
    novedades: data.filter(item => item.category === 'Novedades'),
    paraTi: data.filter(item => item.category === 'Para ti'),
    top10: data.filter(item => item.category === 'Top 10')
  };

  renderSection('novedades', groups.novedades);
  renderSection('para-ti', groups.paraTi);
  renderSection('top10', groups.top10);
}

function renderSection(id, items) {
  const container = document.getElementById(id);
  container.innerHTML = items.map(item => `
    <article class="card">
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

showRegisterBtn.addEventListener('click', () => showAuthMode('register'));
showLoginBtn.addEventListener('click', () => showAuthMode('login'));

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
    profileName.textContent = currentUser.name?.charAt(0).toUpperCase() || 'U';
    document.querySelector('.profile').title = currentUser.name || 'Usuario';
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
    profileName.textContent = currentUser.name?.charAt(0).toUpperCase() || 'U';
    document.querySelector('.profile').title = currentUser.name || 'Usuario';
    loginScreen.classList.add('hidden');
    appShell.classList.remove('hidden');
    await loadContent();
  } catch (error) {
    registerMessage.textContent = error.message;
  }
});

loadContent();
