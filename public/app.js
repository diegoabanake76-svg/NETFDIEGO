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

loadContent();
