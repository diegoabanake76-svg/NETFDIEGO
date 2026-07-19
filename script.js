async function loadContent() {
  try {
    const res = await fetch('/api/content');
    const contentType = res.headers.get('content-type') || '';

    if (!res.ok || !contentType.includes('application/json')) {
      const text = await res.text();
      throw new Error(text || 'No se pudo cargar el contenido');
    }

    const data = await res.json();

    const groups = {
      novedades: data.filter(item => item.category === 'Novedades'),
      paraTi: data.filter(item => item.category === 'Para ti'),
      top10: data.filter(item => item.category === 'Top 10')
    };

    renderSection('novedades', groups.novedades);
    renderSection('para-ti', groups.paraTi);
    renderSection('top10', groups.top10);
  } catch (error) {
    console.error('No se pudo cargar el contenido', error);
  }
}

function renderSection(id, items) {
  const container = document.getElementById(id);
  if (!container) return;

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

loadContent();
