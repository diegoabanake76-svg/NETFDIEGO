const properties = [
  {
    id: 1,
    name: 'Departamento con vista al Paseo de Montejo',
    price: 2450000,
    description: '2 habitaciones, 2 baños y balcón con vista a una de las avenidas más icónicas de Mérida.',
    location: 'Paseo de Montejo',
    type: 'Apartamento'
  },
  {
    id: 2,
    name: 'Casa contemporánea en Altabrisa',
    price: 3750000,
    description: 'Jardín privado, acabados modernos y áreas sociales amplias.',
    location: 'Altabrisa',
    type: 'Casa'
  },
  {
    id: 3,
    name: 'Oficina premium en City Center',
    price: 5200000,
    description: 'Espacio corporativo listo para operar cerca de centros comerciales y servicios.',
    location: 'City Center',
    type: 'Oficina'
  },
  {
    id: 4,
    name: 'Casa familiar cerca de La Isla',
    price: 1890000,
    description: '3 habitaciones, área de juegos y ubicación cercana a colegios y plazas comerciales.',
    location: 'Norte',
    type: 'Casa'
  },
  {
    id: 5,
    name: 'Casa con piscina en Temozón',
    price: 6200000,
    description: 'Amplios espacios, piscina privada y diseño ideal para familia numerosa.',
    location: 'Temozón',
    type: 'Casa'
  },
  {
    id: 6,
    name: 'Oficina ejecutiva en Plaza Galerías',
    price: 3100000,
    description: 'Planta abierta con excelente iluminación y ubicación estratégica.',
    location: 'Norte',
    type: 'Oficina'
  }
];

const propertyGrid = document.getElementById('propertyGrid');
const searchForm = document.getElementById('searchForm');
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

function formatPrice(value) {
  return `$ ${value.toLocaleString('es-MX')}`;
}

function renderProperties(list) {
  propertyGrid.innerHTML = list
    .map(
      property => `
      <article class="property-card">
        <div class="property-image"></div>
        <div class="property-details">
          <div class="property-meta">
            <span>${property.type}</span>
            <strong>${formatPrice(property.price)}</strong>
          </div>
          <h3>${property.name}</h3>
          <p>${property.description}</p>
          <div class="property-meta">
            <span>${property.location}</span>
            <button class="button button-outline" data-id="${property.id}">Ver detalles</button>
          </div>
        </div>
      </article>
    `
    )
    .join('');
}

function filterProperties(filters) {
  return properties.filter(property => {
    const matchesType = filters.type ? property.type === filters.type : true;
    const matchesLocation = filters.location ? property.location === filters.location : true;
    const matchesPrice = (() => {
      if (!filters.priceRange) return true;
      const [min, max] = filters.priceRange.split('-').map(Number);
      return property.price >= min && property.price <= max;
    })();
    return matchesType && matchesLocation && matchesPrice;
  });
}

searchForm.addEventListener('submit', event => {
  event.preventDefault();
  const formData = new FormData(searchForm);
  const filters = {
    type: formData.get('type'),
    location: formData.get('location'),
    priceRange: formData.get('priceRange')
  };
  renderProperties(filterProperties(filters));
});

contactForm.addEventListener('submit', event => {
  event.preventDefault();
  const formData = new FormData(contactForm);
  const name = formData.get('name').toString().trim();
  const email = formData.get('email').toString().trim();
  const phone = formData.get('phone').toString().trim();
  const message = formData.get('message').toString().trim();

  if (!name || !email || !phone || !message) {
    formStatus.textContent = 'Por favor completa todos los campos.';
    return;
  }

  formStatus.textContent = 'Mensaje enviado. Nuestro equipo te contactará pronto.';
  contactForm.reset();
});

renderProperties(properties);
