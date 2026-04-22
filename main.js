// ===========================
// CONFIG — EDIT THIS SECTION
// ===========================
const SPREADSHEET_ID = '1SjR_b-jqh2INRyrkWIvOjjAjRtp2_64LkAuc8exx3Jk';

// Nama repo GitHub kamu — contoh: 'title-card-archive'
// Ini dipakai untuk path gambar di GitHub Pages (username.github.io/REPO_NAME)
// Kalau kamu pakai custom domain atau user site, kosongkan: ''
const REPO_NAME = 'deadlicious';

// Decade sheets — must match exact sheet tab names in your Google Sheets
const DECADES = [
  '1921-1930',
  '1931-1940',
  '1941-1950',
  '1951-1960',
  '1961-1970',
  '1971-1980',
  '1981-1990',
  '1991-2000',
  '2001-2010',
  '2011-2020',
  '2021-2026',
];

// Column indices (0-based) — adjust if your sheet columns differ
// Expected columns: title | year | director | mega_link | filename
const COL = {
  title:    0,
  year:     1,
  director: 2,
  filename: 3, // the new column you'll add — just the filename, e.g. "mulholland-drive.jpg"
};

// Path to images folder — otomatis menyesuaikan GitHub Pages subdirectory
const IMAGES_PATH = (REPO_NAME ? '/' + REPO_NAME : '') + '/images';

// ===========================
// STATE
// ===========================
let allFilms = [];       // { title, year, director, filename, decade }
let currentDecade = 'all';
let searchQuery = '';

// ===========================
// FETCH DATA FROM SHEETS
// ===========================
async function fetchSheetData(sheetName) {
  // Uses the public CSV export endpoint — requires the sheet to be published
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch sheet: ${sheetName}`);
  const text = await res.text();
  return parseCSV(text);
}

// Simple CSV parser (handles quoted fields)
function parseCSV(text) {
  const rows = [];
  let current = '';
  let inQuote = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      inQuote = !inQuote;
      current += ch;
    } else if (ch === '\n' && !inQuote) {
      rows.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) rows.push(current);

  return rows.slice(1).map(line => {
    const cols = splitCSVLine(line);
    return cols;
  }).filter(row => row[COL.title]?.trim());
}

function splitCSVLine(line) {
  const result = [];
  let current = '';
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuote = !inQuote;
    } else if (ch === ',' && !inQuote) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

// ===========================
// LOAD ALL DATA
// ===========================
async function loadAllData() {
  const results = await Promise.allSettled(
    DECADES.map(decade => fetchSheetData(decade).then(rows => ({ decade, rows })))
  );

  allFilms = [];
  results.forEach(result => {
    if (result.status === 'fulfilled') {
      const { decade, rows } = result.value;
      rows.forEach(cols => {
        allFilms.push({
          title:    cols[COL.title]     || '',
          year:     cols[COL.year]      || '',
          director: cols[COL.director]  || '',
          filename: cols[COL.filename]  || '',
          decade,
        });
      });
    }
  });

  // Sort by year ascending
  allFilms.sort((a, b) => parseInt(a.year) - parseInt(b.year));
}

// ===========================
// RENDER
// ===========================
function getFilteredFilms() {
  let films = allFilms;

  if (currentDecade !== 'all') {
    films = films.filter(f => f.decade === currentDecade);
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    films = films.filter(f =>
      f.title.toLowerCase().includes(q) ||
      f.director.toLowerCase().includes(q) ||
      f.year.includes(q)
    );
  }

  return films;
}

function renderGrid() {
  const films = getFilteredFilms();
  const grid = document.getElementById('films-grid');
  const emptyState = document.getElementById('empty-state');
  const decadeTitle = document.getElementById('decade-title');
  const decadeCount = document.getElementById('decade-count');

  // Update decade header
  decadeTitle.textContent = currentDecade === 'all' ? 'All Films' : currentDecade;
  decadeCount.textContent = `${films.length} ${films.length === 1 ? 'film' : 'films'}`;

  if (films.length === 0) {
    grid.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';

  // Determine image subdirectory
  grid.innerHTML = films.map((film, i) => {
    const imgPath = film.filename
      ? `${IMAGES_PATH}/${film.decade}/${film.filename}`
      : null;

    const hasImage = !!film.filename;

    return `
      <div class="film-card ${!hasImage ? 'no-image' : ''}"
           data-index="${allFilms.indexOf(film)}"
           role="button"
           tabindex="0"
           aria-label="${film.title} (${film.year})">
        ${hasImage
          ? `<img class="film-card-img" src="${imgPath}" alt="${film.title}" loading="lazy" onerror="this.parentElement.classList.add('img-error'); this.style.display='none'; this.nextElementSibling.style.display='flex';" />
             <div class="film-card-placeholder" style="display:none; position:absolute; inset:0;">no image</div>`
          : `<div class="film-card-placeholder">no image</div>`
        }
        <div class="film-card-overlay">
          <div class="film-card-title">${film.title}</div>
          <div class="film-card-meta">${film.year}${film.director ? ' · ' + film.director : ''}</div>
        </div>
      </div>
    `;
  }).join('');

  // Attach click listeners
  grid.querySelectorAll('.film-card').forEach(card => {
    card.addEventListener('click', () => openLightbox(parseInt(card.dataset.index)));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') openLightbox(parseInt(card.dataset.index));
    });
  });
}

// ===========================
// DECADE NAV
// ===========================
function buildDecadeNav() {
  const nav = document.getElementById('decade-nav').querySelector('.decade-nav-inner');

  // Get decades that actually have films
  const populated = DECADES.filter(d => allFilms.some(f => f.decade === d));

  populated.forEach(decade => {
    const btn = document.createElement('button');
    btn.className = 'decade-btn';
    btn.dataset.decade = decade;
    btn.textContent = decade;
    btn.addEventListener('click', () => switchDecade(decade));
    nav.appendChild(btn);
  });
}

function switchDecade(decade) {
  currentDecade = decade;
  searchQuery = '';
  document.getElementById('search-input').value = '';

  document.querySelectorAll('.decade-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.decade === decade);
  });

  renderGrid();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===========================
// LIGHTBOX
// ===========================
function openLightbox(filmIndex) {
  const film = allFilms[filmIndex];
  if (!film) return;

  const imgPath = film.filename
    ? `${IMAGES_PATH}/${film.decade}/${film.filename}`
    : null;

  const lb = document.getElementById('lightbox');
  const overlay = document.getElementById('lightbox-overlay');
  const img = document.getElementById('lightbox-img');

  document.getElementById('lightbox-decade').textContent = film.decade;
  document.getElementById('lightbox-title').textContent = film.title;
  document.getElementById('lightbox-year').textContent = film.year;
  document.getElementById('lightbox-director').textContent = film.director;

  if (imgPath) {
    img.src = imgPath;
    img.alt = film.title;
    img.style.display = 'block';
  } else {
    img.style.display = 'none';
  }

  lb.classList.add('active');
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('active');
  document.getElementById('lightbox-overlay').classList.remove('active');
  document.body.style.overflow = '';
}

// ===========================
// INIT
// ===========================
async function init() {
  const loadingState = document.getElementById('loading-state');
  const searchWrap = document.getElementById('search-wrap');
  const decadeHeader = document.getElementById('decade-header');

  try {
    await loadAllData();

    // Update total count
    document.getElementById('total-count').textContent = `— ${allFilms.length} films`;

    // Build nav & render
    buildDecadeNav();
    loadingState.style.display = 'none';
    searchWrap.style.display = 'block';
    decadeHeader.style.display = 'flex';
    renderGrid();

    // Search
    document.getElementById('search-input').addEventListener('input', e => {
      searchQuery = e.target.value;
      renderGrid();
    });

    // Lightbox close
    document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
    document.getElementById('lightbox-overlay').addEventListener('click', closeLightbox);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeLightbox();
    });

  } catch (err) {
    loadingState.innerHTML = `
      <p style="color: rgba(232,228,220,0.35); font-size: 0.7rem; letter-spacing: 0.12em; text-align:center; max-width: 400px; line-height:1.8;">
        Couldn't load data.<br>
        Make sure the Google Sheet is published to the web.<br><br>
        <span style="color: rgba(200,169,110,0.6); font-size:0.6rem;">File → Share → Publish to web → Publish</span>
      </p>
    `;
    console.error(err);
  }
}

document.addEventListener('DOMContentLoaded', init);
