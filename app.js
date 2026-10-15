const toast = document.querySelector('#toast');
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
}

const authModal = document.querySelector('#auth-modal');
const authTitle = document.querySelector('#auth-title');
const authSubtitle = document.querySelector('#auth-subtitle');
const authClose = document.querySelector('#auth-close');
const loginForm = document.querySelector('#login-form');
const registerForm = document.querySelector('#register-form');
const authCopy = {
  login: { title: 'Bienvenido de vuelta', subtitle: 'Entrá para guardar destinos, sumar puntos y continuar tu mapa.' },
  register: { title: 'Creá tu cuenta viajera', subtitle: 'Guardá tus lugares favoritos y empezá a desbloquear Paraguay.' },
};

function setAuthView(view) {
  const copy = authCopy[view];
  if (!copy) return;
  authTitle.textContent = copy.title;
  authSubtitle.textContent = copy.subtitle;
  document.querySelectorAll('[data-auth-tab]').forEach((tab) => {
    const isActive = tab.dataset.authTab === view;
    if (tab.classList.contains('auth-tab')) tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
  });
  loginForm?.classList.toggle('auth-hidden', view !== 'login');
  registerForm?.classList.toggle('auth-hidden', view !== 'register');
}

function toggleAuth(open, view = 'login') {
  if (!authModal) return;
  authModal.hidden = !open;
  document.body.classList.toggle('modal-open', open);
  if (open) {
    setAuthView(view);
    window.setTimeout(() => authModal.querySelector('input:not([type="checkbox"])')?.focus(), 50);
  }
}

// Los botones de acceso se configuran debajo para distinguir iniciar sesión de cerrar sesión.
document.querySelectorAll('[data-auth-tab]').forEach((button) => button.addEventListener('click', () => setAuthView(button.dataset.authTab)));
authClose?.addEventListener('click', () => toggleAuth(false));
authModal?.querySelectorAll('[data-close-auth]').forEach((element) => element.addEventListener('click', () => toggleAuth(false)));
const authUsersKey = 'viajapy-demo-users';
const authSessionKey = 'viajapy-demo-session';
const getAuthUsers = () => JSON.parse(localStorage.getItem(authUsersKey) || '[]');
const saveAuthUsers = (users) => localStorage.setItem(authUsersKey, JSON.stringify(users));
const setDeveloperMode = (enabled) => {
  document.body.classList.toggle('developer-mode', enabled);
  localStorage.setItem('viajapy-demo-developer', enabled ? 'true' : 'false');
};
setDeveloperMode(false);
function toggleDeveloperMode() {
  const enabled = !document.body.classList.contains('developer-mode');
  setDeveloperMode(enabled);
  showToast(enabled ? 'Modo desarrollador activado para la exposición.' : 'Modo desarrollador desactivado.');
}
document.addEventListener('click', (event) => {
  if (event.target.closest('#developer-trigger')) toggleDeveloperMode();
});
document.addEventListener('keydown', (event) => {
  if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'd') {
    event.preventDefault();
    toggleDeveloperMode();
  }
});
const updateAuthButton = () => {
  const session = JSON.parse(localStorage.getItem(authSessionKey) || 'null');
  document.querySelectorAll('[data-open-auth]').forEach((button) => {
    button.textContent = session ? `${session.name} · Salir` : 'Iniciar sesión ↗';
    button.onclick = session ? () => { localStorage.removeItem(authSessionKey); updateAuthButton(); showToast('Cerraste tu sesión.'); } : () => toggleAuth(true, 'login');
  });
};
updateAuthButton();
document.querySelectorAll('[data-social]').forEach((button) => button.addEventListener('click', () => showToast('El acceso con ' + button.dataset.social + ' se habilitará al conectar Laravel.')));
loginForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(loginForm);
  const email = String(data.get('email')).trim().toLowerCase();
  const password = String(data.get('password'));
  const user = getAuthUsers().find((item) => item.email === email && item.password === password);
  if (!user) {
    showToast('Correo o contraseña incorrectos. Primero creá una cuenta o revisá tus datos.');
    return;
  }
  localStorage.setItem(authSessionKey, JSON.stringify({ name: user.name, email: user.email, role: 'user' }));
  setDeveloperMode(false);
  updateAuthButton();
  toggleAuth(false);
  showToast('¡Bienvenido a viajaPY, ' + user.name + '!');
  loginForm.reset();
});
registerForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(registerForm);
  const password = data.get('password');
  const name = String(data.get('name')).trim();
  const email = String(data.get('email')).trim().toLowerCase();
  const users = getAuthUsers();
  if (users.some((user) => user.email === email)) {
    showToast('Ese correo ya está registrado. Iniciá sesión.');
    setAuthView('login');
    return;
  }
  users.push({ name, email, password });
  saveAuthUsers(users);
  localStorage.setItem(authSessionKey, JSON.stringify({ name, email, role: 'user' }));
  setDeveloperMode(false);
  updateAuthButton();
  toggleAuth(false);
  showToast('¡Listo, ' + name + '! Tu cuenta viajera fue creada.');
  registerForm.reset();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && authModal && !authModal.hidden) toggleAuth(false);
});

document.querySelectorAll('[data-toast]').forEach((element) => {
  element.addEventListener('click', (event) => {
    if (element.tagName === 'A') event.preventDefault();
    showToast(element.dataset.toast);
  });
});

document.querySelectorAll('[data-scroll]').forEach((element) => {
  element.addEventListener('click', () => {
    document.querySelector(`#${element.dataset.scroll}`)?.scrollIntoView({ behavior: 'smooth' });
  });
});

const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.desktop-nav');
menuToggle?.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  nav.classList.toggle('mobile-open', !isOpen);
});

nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  menuToggle?.setAttribute('aria-expanded', 'false');
  nav.classList.remove('mobile-open');
}));

const filterButtons = document.querySelectorAll('.filter-pill');
const destinationCards = document.querySelectorAll('.destination-card');
const emptyState = document.querySelector('#empty-state');
const foodStories = document.querySelector('.food-stories');

const paraguayCities = ['Asunción', 'Ciudad del Este', 'San Lorenzo', 'Luque', 'Capiatá', 'Lambaré', 'Fernando de la Mora', 'Mariano Roque Alonso', 'Limpio', 'Ñemby', 'Villa Elisa', 'Itauguá', 'Areguá', 'Caaguazú', 'Coronel Oviedo', 'Encarnación', 'Hohenau', 'Cambyretá', 'San Juan del Paraná', 'Pilar', 'San Ignacio', 'Santa Rosa', 'Ayolas', 'Villarrica', 'Caazapá', 'Paraguarí', 'Carapeguá', 'Yaguarón', 'Pirayú', 'Caacupé', 'Eusebio Ayala', 'Tobatí', 'San Bernardino', 'Altos', 'Arroyos y Esteros', 'Concepción', 'Horqueta', 'Belén', 'Loreto', 'Pedro Juan Caballero', 'Capitán Bado', 'Bella Vista Norte', 'Salto del Guairá', 'Curuguaty', 'Katueté', 'Filadelfia', 'Mariscal Estigarribia', 'Loma Plata', 'Fuerte Olimpo', 'Bahía Negra', 'Villa Hayes', 'Benjamín Aceval', 'Puerto Pinasco', 'General Bruguez'];
const cityPicker = document.querySelector('#city-picker');
const destinationPicker = document.querySelector('#destination-picker');
const destinationValue = document.querySelector('#destination-value');
const cityList = document.querySelector('#city-list');
const cityFilter = document.querySelector('#city-filter');
const destinationSearch = document.querySelector('#destination-search');

function renderCities(query = '') {
  const normalized = query.trim().toLowerCase();
  const matches = [...paraguayCities].sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' })).filter((city) => city.toLowerCase().includes(normalized));
  cityList.innerHTML = '';
  if (!matches.length) {
    cityList.innerHTML = '<span class="city-empty">No encontramos esa ciudad.</span>';
    return;
  }
  matches.forEach((city) => {
    const option = document.createElement('button');
    option.type = 'button';
    option.className = 'city-option';
    option.setAttribute('role', 'option');
    option.textContent = city;
    option.addEventListener('click', () => {
      destinationValue.textContent = city;
      destinationSearch.value = city;
      cityPicker.hidden = true;
      destinationPicker.setAttribute('aria-expanded', 'false');
    });
    cityList.appendChild(option);
  });
}

function toggleCityPicker(open) {
  cityPicker.hidden = !open;
  destinationPicker.setAttribute('aria-expanded', String(open));
  if (open) { renderCities(cityFilter.value); cityFilter.focus(); }
}

destinationPicker?.addEventListener('click', () => toggleCityPicker(cityPicker.hidden));
cityFilter?.addEventListener('input', () => renderCities(cityFilter.value));
document.addEventListener('click', (event) => {
  if (!event.target.closest('.destination-field')) toggleCityPicker(false);
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && cityPicker && !cityPicker.hidden) toggleCityPicker(false);
});
renderCities();

const travelDate = document.querySelector('#travel-date');
if (travelDate) {
  const today = new Date();
  travelDate.min = today.toISOString().split('T')[0];
  travelDate.addEventListener('change', () => {
    if (travelDate.value) showToast(`Fecha elegida: ${new Intl.DateTimeFormat('es-PY', { dateStyle: 'medium' }).format(new Date(`${travelDate.value}T12:00:00`))}.`);
  });
}

function applyFilter(filter) {
  let visibleCards = 0;
  destinationCards.forEach((card) => {
    const shouldShow = filter === 'Todos' || card.dataset.category === filter;
    card.classList.toggle('hidden', !shouldShow);
    if (shouldShow) visibleCards += 1;
  });
  emptyState.classList.toggle('visible', visibleCards === 0);
  foodStories?.classList.toggle('hidden', filter !== 'Todos' && filter !== 'Cultura');
}

filterButtons.forEach((button) => button.addEventListener('click', () => {
  filterButtons.forEach((item) => item.classList.remove('active'));
  button.classList.add('active');
  applyFilter(button.dataset.filter);
}));

document.querySelectorAll('.category-card').forEach((card) => card.addEventListener('click', () => {
  const filter = card.dataset.filter;
  const matchingFilter = [...filterButtons].find((button) => button.dataset.filter === filter);
  matchingFilter?.click();
  document.querySelector(filter === 'Cultura' ? '#historias' : '#destinos')?.scrollIntoView({ behavior: 'smooth' });
}));

document.querySelectorAll('.heart-btn').forEach((button) => button.addEventListener('click', (event) => {
  event.stopPropagation();
  const saved = button.classList.toggle('saved');
  button.textContent = saved ? '♥' : '♡';
  showToast(saved ? 'Guardado en tus favoritos.' : 'Eliminado de tus favoritos.');
}));

destinationCards.forEach((card) => {
  const imageClass = [...card.querySelector('.destination-image')?.classList || []].find((name) => name.startsWith('image-'));
  const imageAssets = {
    'image-misiones': 'misiones-jesuiticas.png',
    'image-ybycui': 'parque-ybycui.png',
    'image-aregua': 'ceramica-aregua.png',
    'image-nature-teyucuare': 'category-nature.png',
    'image-nature-monday': 'parque-ybycui.png',
    'image-nature-iguazu': 'parque-ybycui.png',
    'image-nature-cerro': 'viaja-paraguay-hero-new.png',
    'image-nature-sanrafael': 'viaja-paraguay-hero-new.png',
    'image-nature-defensores': 'viaja-paraguay-hero.jpg',
    'image-nature-lago': 'viaja-paraguay-hero.jpg',
    'image-adventure-treskandu': 'category-adventure.png',
    'image-adventure-mbaracayu': 'category-nature.png',
    'image-adventure-nyacunday': 'parque-ybycui.png',
    'image-adventure-salto': 'viaja-paraguay-hero-new.png',
  };
  const image = document.createElement('img');
  image.className = 'destination-photo';
  image.src = `./assets/${imageAssets[imageClass] || 'category-nature.png'}`;
  image.alt = card.querySelector('h3')?.textContent.replace(/\s+/g, ' ').trim() || 'Destino de Paraguay';
  card.querySelector('.destination-image')?.prepend(image);
  card.setAttribute('tabindex', '0');
  const openDestination = () => {
    const title = card.querySelector('h3')?.textContent.replace(/\s+/g, ' ').trim();
    const description = card.querySelector('.destination-description')?.textContent.trim();
    const location = card.querySelector('.location-tag')?.textContent.trim();
    destinationModal.hidden = false;
    document.body.classList.add('modal-open');
    destinationModalImage.src = image.src;
    destinationModalImage.alt = image.alt;
    destinationModalTitle.textContent = title;
    destinationModalLocation.textContent = location;
    destinationModalDescription.textContent = description;
    destinationModalClose.focus();
  };
  card.addEventListener('click', (event) => {
    if (!event.target.closest('.heart-btn')) openDestination();
  });
  card.addEventListener('keydown', (event) => {
    if ((event.key === 'Enter' || event.key === ' ') && !event.target.closest('.heart-btn')) {
      event.preventDefault();
      openDestination();
    }
  });
});

const destinationModal = document.querySelector('#destination-modal');
const destinationModalClose = document.querySelector('#destination-modal-close');
const destinationModalImage = document.querySelector('#destination-modal-image');
const destinationModalTitle = document.querySelector('#destination-modal-title');
const destinationModalLocation = document.querySelector('#destination-modal-location');
const destinationModalDescription = document.querySelector('#destination-modal-description');
function closeDestinationModal() {
  destinationModal.hidden = true;
  document.body.classList.remove('modal-open');
}
destinationModalClose?.addEventListener('click', closeDestinationModal);
destinationModal?.querySelectorAll('[data-close-destination]').forEach((element) => element.addEventListener('click', closeDestinationModal));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && destinationModal && !destinationModal.hidden) closeDestinationModal();
});

document.querySelector('#search-button')?.addEventListener('click', () => {
  const query = document.querySelector('#destination-search').value.trim().toLowerCase();
  if (!query) {
    document.querySelector('#destinos')?.scrollIntoView({ behavior: 'smooth' });
    return;
  }
  const matches = [...destinationCards].filter((card) => card.textContent.toLowerCase().includes(query));
  destinationCards.forEach((card) => card.classList.toggle('hidden', !matches.includes(card)));
  emptyState.classList.toggle('visible', matches.length === 0);
  document.querySelectorAll('.filter-pill').forEach((pill) => pill.classList.remove('active'));
  document.querySelector('#destinos')?.scrollIntoView({ behavior: 'smooth' });
});

document.querySelector('#newsletter-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const input = event.currentTarget.querySelector('input');
  showToast(`Listo, ${input.value}: ya sos parte de viajaPY.`);
  input.value = '';
});

const mapModal = document.querySelector('#my-map-modal');
const mapButton = document.querySelector('#my-map-button');
const mapClose = document.querySelector('#map-close');

function toggleMap(open) {
  if (!mapModal) return;
  mapModal.hidden = !open;
  document.body.classList.toggle('modal-open', open);
  if (open) mapClose?.focus();
}

mapButton?.addEventListener('click', () => toggleMap(true));
mapClose?.addEventListener('click', () => toggleMap(false));
mapModal?.querySelectorAll('[data-close-map]').forEach((element) => element.addEventListener('click', () => toggleMap(false)));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && mapModal && !mapModal.hidden) toggleMap(false);
});

const paraguayMap = document.querySelector('.paraguay-map');
const mapRegionStatus = document.querySelector('#map-region-status');
const mapUnlockedCount = document.querySelector('#map-unlocked-count');
let mapScale = 1;
const mapRegionCopy = {
  Norte: 'El Norte te espera con cerros, saltos y caminos de naturaleza.',
  Centro: 'El Centro conecta cultura, pueblos con encanto y escapadas de un día.',
  Este: 'La región Este reúne selva, ríos y algunos de los saltos más increíbles.',
  Chaco: 'El Chaco ofrece horizontes abiertos, fauna silvestre y aventura auténtica.',
};
document.querySelectorAll('[data-map-action]').forEach((button) => button.addEventListener('click', () => {
  const action = button.dataset.mapAction;
  if (action === 'zoom-in') mapScale = Math.min(mapScale + .15, 1.6);
  if (action === 'zoom-out') mapScale = Math.max(mapScale - .15, .75);
  if (action === 'reset') mapScale = 1;
  paraguayMap.style.transform = `scale(${mapScale})`;
}));
document.querySelectorAll('[data-map-region]').forEach((button) => button.addEventListener('click', () => {
  const region = button.dataset.mapRegion;
  mapRegionStatus.textContent = mapRegionCopy[region];
  document.querySelectorAll('[data-map-region]').forEach((item) => item.classList.toggle('active', item === button));
}));
document.querySelectorAll('.paraguay-map .region').forEach((region, index) => region.addEventListener('click', () => {
  const names = ['Norte', 'Centro', 'Sur'];
  const name = names[index] || 'Paraguay';
  mapRegionStatus.textContent = `${name}: seleccionaste esta zona del mapa. Seguí explorando para desbloquear nuevas rutas.`;
  if (region.classList.contains('region-locked')) {
    region.classList.remove('region-locked');
    region.classList.add('region-unlocked');
    mapUnlockedCount.textContent = Number(mapUnlockedCount.textContent) + 1;
    showToast(`¡Desbloqueaste la región ${name}!`);
  }
}));
document.querySelectorAll('.paraguay-map .map-pin').forEach((pin) => pin.addEventListener('click', () => {
  const place = pin.nextElementSibling?.textContent || 'este lugar';
  mapRegionStatus.textContent = `${place}: punto de interés en tu ruta. ¡Hacé clic en el destino para conocer más!`;
}));

const routeModal = document.querySelector('#route-modal');
const createRouteButton = document.querySelector('#create-route-button');
const routeModalClose = document.querySelector('#route-modal-close');
const routeSelection = document.querySelector('#route-selection');
function toggleRouteModal(open) {
  if (!routeModal) return;
  routeModal.hidden = !open;
  document.body.classList.toggle('modal-open', open);
  if (open) routeModal.querySelector('.route-option')?.focus();
}
createRouteButton?.addEventListener('click', () => toggleRouteModal(true));
routeModalClose?.addEventListener('click', () => toggleRouteModal(false));
routeModal?.querySelectorAll('[data-close-route]').forEach((element) => element.addEventListener('click', () => toggleRouteModal(false)));
routeModal?.querySelectorAll('[data-route]').forEach((route) => route.addEventListener('click', () => {
  routeModal.querySelectorAll('[data-route]').forEach((item) => item.classList.remove('selected'));
  route.classList.add('selected');
  routeSelection.textContent = `¡Ruta elegida! ${route.dataset.route} se agregó a tu mapa. Sumás +10 puntos al completarla.`;
  showToast(`Seleccionaste ${route.dataset.route}.`);
}));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && routeModal && !routeModal.hidden) toggleRouteModal(false);
});

let pointsBalance = 40;
const pointsBalanceElement = document.querySelector('#points-balance');
const pointsNextElement = document.querySelector('#points-next');
const pointsProgressElement = document.querySelector('#points-progress');

function refreshPoints() {
  const nextReward = 50;
  const progress = Math.min((pointsBalance / nextReward) * 100, 100);
  pointsBalanceElement.textContent = pointsBalance;
  pointsNextElement.textContent = Math.max(nextReward - pointsBalance, 0);
  pointsProgressElement.style.width = `${progress}%`;
}

document.querySelector('#add-trip-button')?.addEventListener('click', () => {
  pointsBalance += 10;
  refreshPoints();
  showToast('¡Viaje registrado! Sumaste +10 puntos.');
});

document.querySelectorAll('[data-redeem]').forEach((button) => button.addEventListener('click', () => {
  const cost = Number(button.dataset.redeem);
  const reward = button.dataset.reward;
  if (pointsBalance < cost) {
    showToast(`Te faltan ${cost - pointsBalance} puntos para canjear esta promo.`);
    return;
  }
  pointsBalance -= cost;
  refreshPoints();
  showToast(`Canjeaste: ${reward}. ¡Disfrutá el beneficio!`);
}));

const chatbotPanel = document.querySelector('#chatbot-panel');
const chatbotLaunch = document.querySelector('#chatbot-launch');
const chatbotClose = document.querySelector('#chatbot-close');
const chatbotBody = document.querySelector('#chatbot-body');
const chatbotInput = document.querySelector('#chatbot-input');

function toggleChatbot(open) {
  chatbotPanel?.classList.toggle('open', open);
  chatbotPanel?.setAttribute('aria-hidden', String(!open));
  chatbotLaunch?.setAttribute('aria-expanded', String(open));
  if (open) chatbotInput?.focus();
}

chatbotLaunch?.addEventListener('click', () => {
  const isOpen = chatbotPanel.classList.contains('open');
  toggleChatbot(!isOpen);
});
chatbotClose?.addEventListener('click', () => toggleChatbot(false));

function addChatMessage(text, type = 'user-message') {
  const message = document.createElement('div');
  message.className = type;
  message.textContent = text;
  chatbotBody.appendChild(message);
  chatbotBody.scrollTop = chatbotBody.scrollHeight;
}

document.querySelectorAll('[data-chat]').forEach((button) => button.addEventListener('click', () => {
  addChatMessage(button.dataset.chat);
  showToast('La guía está preparando una recomendación para vos.');
}));

document.querySelector('#chatbot-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const value = chatbotInput.value.trim();
  if (!value) return;
  addChatMessage(value);
  chatbotInput.value = '';
  setTimeout(() => addChatMessage('¡Anotado! Pronto voy a poder recomendarte una ruta personalizada con esos datos.', 'bot-message'), 350);
});
