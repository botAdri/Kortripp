// Gestionnaire global d'erreurs JS
window.addEventListener('error', function (e) {
  var el = document.getElementById('jsErrorBanner');
  if (!el) return;
  el.style.display = 'block';
  el.textContent = '⚠️ Erreur JS : ' + e.message + ' (' + (e.filename || '').split('/').pop() + ':' + e.lineno + ')';
});

// DONNÉES DE VOYAGE
const stopsAutomne = [
  {
    id: 1, name: "Séoul", korean: "서울", color: "#1E3A5F",
    dates: "3 nuits", lat: 37.5665, lng: 126.9780,
    desc: "Capitale vibrante où tradition et modernité s'entremêlent. En novembre, le feuillage doré des parcs Bukhansan et Namsan offre un spectacle inoubliable.",
    budget: { heberg: "~135 €", repas: "~75 €", activites: "~55 €", total: "~265 €" },
    activites: [
      { icon:"🏯", name:"Palais Gyeongbokgung", kr:"경복궁", desc:"Principale résidence royale de la Corée de Joseon.", tag:"paid", price:"~3 €" },
      { icon:"🌿", name:"Parc Namsan & Tour N Seoul", kr:"N서울타워", desc:"Le poumon vert de Séoul surplombe la ville à 262 m.", tag:"paid", price:"~12 €" },
      { icon:"🛍️", name:"Insadong & Bukchon Hanok Village", kr:"북촌한옥마을", desc:"Insadong est la rue des galeries d'art. Bukchon est un quartier de 900 maisons hanok.", tag:"free", price:"Gratuit" },
      { icon:"🌊", name:"Han River au coucher du soleil", kr:"여의도한강공원", desc:"Les parcs de la rivière Han sont le lieu de vie des Séoulites.", tag:"free", price:"~3 € (vélo)" }
    ],
    restaurants: [
      { icon:"🍜", name:"Myeongdong Kyoja", kr:"명동교자 본점", desc:"Institution réputée pour ses raviolis (mandu) et kalguksu.", price:"~9 €" },
      { icon:"🐔", name:"Tosokchon Samgyetang", kr:"토속촌삼계탕", desc:"Restaurant réputé pour le samgyetang.", price:"~15 €" }
    ]
  },
  {
    id: 2, name: "Daejeon", korean: "대전", color: "#2D6B3A",
    travel: { km: 169, duration: "2h33" }, dates: "1 nuit", lat: 36.3504, lng: 127.3845,
    desc: "Carrefour de la Corée et porte vers le Jeollanam-do.",
    budget: { heberg: "~50 €", repas: "~30 €", activites: "~15 €", total: "~95 €" },
    activites: [
      { icon:"🌿", name:"Parc national Gyeryongsan", kr:"계룡산국립공원", desc:"Massif montagneux réputé pour son feuillage automnal.", tag:"free", price:"Gratuit" }
    ],
    restaurants: [
      { icon:"🥐", name:"Sungsimdang", kr:"성심당 본점", desc:"Boulangerie-pâtisserie historique de Daejeon.", price:"~5 €" }
    ]
  }
];

const stopsPrintemps = [
  {
    id: 1, name: "Busan", korean: "부산", color: "#1F5C7A",
    dates: "3 nuits", lat: 35.1796, lng: 129.0756,
    desc: "Deuxième ville de Corée, point de départ au sud pour profiter des floraisons.",
    budget: { heberg: "~210 €", repas: "~80 €", activites: "~30 €", total: "~320 €" },
    activites: [
      { icon:"🌸", name:"Route des cerisiers de Dalmaji-gil", kr:"달맞이고개", desc:"Route sinueuse bordée de cerisiers centenaires.", tag:"free", price:"Gratuit" }
    ],
    restaurants: [
      { icon:"🐟", name:"Marché Jagalchi", kr:"자갈치시장", desc:"Le plus grand marché aux poissons de Corée.", price:"~20 €" }
    ]
  }
];

const SEASON_STOPS = { automne: stopsAutomne, printemps: stopsPrintemps };
const SEASON_META = {
  automne: { emoji: "🍂", label: "Automne", headerSub: "🍂 Dates à définir · Route de l'Ouest · 8 étapes", titleSuffix: "Automne" },
  printemps: { emoji: "🌸", label: "Printemps", headerSub: "🌸 Dates à définir · Route Sud-Est · 8 étapes", titleSuffix: "Printemps" }
};

const memoryFallback = {};
const safeStorage = {
  getItem(key) {
    try { return localStorage.getItem(key); } catch (e) { return key in memoryFallback ? memoryFallback[key] : null; }
  },
  setItem(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { memoryFallback[key] = value; }
  }
};

let currentSeason = safeStorage.getItem('kortripp-season') || 'automne';
let currentCurrency = safeStorage.getItem('kortripp-currency') || 'EUR';
const KAKAO_JS_KEY = '971e575e5286264f78dffb158c453262';
const KRW_RATE = 1450;

function formatPrice(str) {
  if (currentCurrency === 'EUR' || !/€/.test(str)) return str;
  return str.replace(/\d[\d\s.,]*\d|\d/g, (match) => {
    const clean = match.replace(/\s/g, '').replace(',', '.');
    const num = parseFloat(clean);
    if (isNaN(num)) return match;
    const krw = Math.round((num * KRW_RATE) / 50) * 50;
    return krw.toLocaleString('fr-FR');
  }).replace(/€/g, '₩');
}

function displayAmount(eur, suffix = '') {
  if (currentCurrency === 'EUR') return `${Math.round(eur)} €${suffix}`;
  const krw = Math.round((eur * KRW_RATE) / 50) * 50;
  return `${krw.toLocaleString('fr-FR')} ₩${suffix}`;
}

// CORRECTION PRINCIPALE : Vérifications d'existence avec 'if' pour éviter l'erreur TypeError: is null
function renderBudgetBand(season) {
  const b = SEASON_STOPS[season] ? SEASON_STOPS[season] : [];

  const nightsEl = document.getElementById('band-nights');
  if (nightsEl) nightsEl.textContent = "14";

  const flightsEl = document.getElementById('band-flights');
  if (flightsEl) flightsEl.textContent = formatPrice("750 €");

  const accomEl = document.getElementById('band-accom');
  if (accomEl) accomEl.textContent = displayAmount(600);

  const carEl = document.getElementById('band-car');
  if (carEl) carEl.textContent = displayAmount(350);

  const foodEl = document.getElementById('band-food');
  if (foodEl) foodEl.textContent = displayAmount(500);

  const totalEl = document.getElementById('band-total');
  if (totalEl) totalEl.textContent = "~2 200 €";
}

function applySeason(season) {
  if (!SEASON_META[season]) return;
  currentSeason = season;
  const meta = SEASON_META[season];

  document.documentElement.setAttribute('data-season', season);

  const toggleEl = document.getElementById('seasonToggle');
  if (toggleEl) toggleEl.setAttribute('data-season', season);

  const headerSubEl = document.getElementById('headerSub');
  if (headerSubEl) headerSubEl.textContent = meta.headerSub;

  document.title = `한국 · Guide de Voyage — ${meta.titleSuffix}`;

  buildItinerary(SEASON_STOPS[season]);
  renderBudgetBand(season);

  safeStorage.setItem('kortripp-season', season);
}

function buildItinerary(stopsData) {
  const tabsEl = document.getElementById('cityTabs');
  const panelEl = document.getElementById('activitiesPanel');
  if (!tabsEl || !panelEl) return;

  tabsEl.innerHTML = '';
  panelEl.innerHTML = '';

  stopsData.forEach((stop, i) => {
    const tab = document.createElement('button');
    tab.className = 'city-tab' + (i === 0 ? ' active' : '');
    tab.style.color = stop.color;
    tab.innerHTML = `<span class="tab-num" style="background:${stop.color}"><span>${stop.id}</span></span>${stop.name}`;
    tab.addEventListener('click', () => selectStop(i));
    tabsEl.appendChild(tab);

    const panel = document.createElement('div');
    panel.className = 'city-panel' + (i === 0 ? ' active' : '');
    panel.id = `panel-${i}`;
    panel.innerHTML = `
      <div class="city-header" style="background:${stop.color}" data-korean="${stop.korean}">
        <div class="city-badge">Étape ${stop.id}</div>
        <div class="city-name">${stop.name}</div>
        <div class="city-dates">📅 ${stop.dates}</div>
      </div>
      <div class="city-desc">${stop.desc}</div>`;
    panelEl.appendChild(panel);
  });
}

function selectStop(idx) {
  document.querySelectorAll('.city-tab').forEach((t, i) => t.classList.toggle('active', i === idx));
  document.querySelectorAll('.city-panel').forEach((p, i) => p.classList.toggle('active', i === idx));
}

// Événements
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('seasonToggle')?.querySelectorAll('.season-btn').forEach((btn) => {
    btn.addEventListener('click', () => applySeason(btn.dataset.value));
  });

  const budgetFab = document.getElementById('budgetFab');
  const budgetOverlay = document.getElementById('budgetOverlay');
  const budgetClose = document.getElementById('budgetClose');

  if (budgetFab && budgetOverlay && budgetClose) {
    budgetFab.addEventListener('click', () => budgetOverlay.classList.add('active'));
    budgetClose.addEventListener('click', () => budgetOverlay.classList.remove('active'));
    budgetOverlay.addEventListener('click', (e) => {
      if (e.target === budgetOverlay) budgetOverlay.classList.remove('active');
    });
  }
    
    // ═══════════════════════════════════════════════════════════
    // CARTE & ITINÉRAIRE (Kakao Maps)
    // ═══════════════════════════════════════════════════════════
    let map = null;
    let mapReady = false;
    let stopOverlays = [];   // pins numérotés des étapes
    let routeLines = [];     // tronçons du trajet
    let placeOverlays = [];  // pastilles des activités / restaurants de l'étape active
    let placePopup = null;
    let placesFor = null;
    const mapFilters = { A: true, R: true, H: true };

    function setMapMessage(text) {
      const el = document.getElementById('map');
      if (el) el.innerHTML = `<div class="map-msg">${text}</div>`;
    }

    async function initKakaoMap() {
      const mapEl = document.getElementById('map');
      if (!mapEl) return;
      if (!KAKAO_JS_KEY) { setMapMessage('Carte indisponible : clé Kakao absente.'); return; }
      setMapMessage('Chargement de la carte…');
      try { await loadKakaoMaps(); }
      catch (e) {
        console.error('[Carte Kakao]', e);
        setMapMessage('Carte Kakao indisponible. Vérifiez la connexion, la clé JavaScript et le domaine autorisé dans Kakao Developers. Les étapes restent consultables.');
        return;
      }
      mapEl.innerHTML = '';
      map = new kakao.maps.Map(mapEl, { center: new kakao.maps.LatLng(35.9, 127.8), level: 12 });
      // En bas à droite : le haut à droite est occupé par le bouton « Budget du voyage »
      map.addControl(new kakao.maps.ZoomControl(), kakao.maps.ControlPosition.BOTTOMRIGHT);
      kakao.maps.event.addListener(map, 'click', closePlacePopup);
      mapReady = true;
      drawMap();
      renderAllPlaceMarkers();
      window.addEventListener('resize', () => { map.relayout(); });
      setTimeout(() => { map.relayout(); if (placesFor === null) fitOverview(); }, 300);
    }
  // Initialisation au chargement de la page
  applySeason(currentSeason);
});
