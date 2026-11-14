// Estado salvo no aparelho: { ratings: {id: 1-5}, favorite: id|null }
const KEY = "saoluis-votos-v1";
const state = load();

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || { ratings: {}, favorite: null }; }
  catch { return { ratings: {}, favorite: null }; }
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
}

const $ = (s) => document.querySelector(s);
const byId = Object.fromEntries(PLACES.map((p) => [p.id, p]));
const LABELS = ["", "Não curti", "Regular", "Bom", "Muito bom", "Imperdível"];

function scoreHTML(id) {
  const r = state.ratings[id];
  return r
    ? `<span class="score on"><span class="s">★</span> ${r},0</span>`
    : `<span class="score">Avaliar</span>`;
}

// ---------- Mapa ----------
const hasMap = typeof L !== "undefined";
const map = hasMap ? L.map("map", { zoomControl: false }).setView([-2.515, -44.29], 13) : null;
const markers = {};

if (hasMap) {
  L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
    attribution: "&copy; OpenStreetMap &copy; CARTO", maxZoom: 19,
  }).addTo(map);

  PLACES.forEach((p) => {
    const icon = L.divIcon({
      className: "", iconSize: [48, 55], iconAnchor: [24, 55],
      html: `<div class="pin" style="--ring:${p.color}"><img src="${p.photo}" alt=""></div>`,
    });
    markers[p.id] = L.marker([p.lat, p.lng], { icon, riseOnHover: true })
      .addTo(map)
      .on("click", () => { highlight(p.id, true); openSheet(p.id); });
  });
  map.fitBounds(PLACES.map((p) => [p.lat, p.lng]), { padding: [50, 50] });
} else {
  $("#map").innerHTML = '<p class="empty">Mapa indisponível sem internet.<br>Use a aba Lugares.</p>';
}

function highlight(id, scrollCard) {
  document.querySelectorAll(".pin.active").forEach((el) => el.classList.remove("active"));
  const m = markers[id];
  if (m && m.getElement()) {
    m.getElement().querySelector(".pin").classList.add("active");
    m.setZIndexOffset(1000);
    Object.entries(markers).forEach(([k, mk]) => k !== id && mk.setZIndexOffset(0));
  }
  if (scrollCard) {
    const card = document.querySelector(`.mini[data-id="${id}"]`);
    if (card) card.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }
}

function renderCarousel() {
  $("#carousel").innerHTML = PLACES.map((p) => `
    <button class="mini" data-id="${p.id}">
      <img src="${p.photo}" alt="${p.name}" loading="lazy">
      <div><div class="mini-title">${p.name}</div><div class="mini-meta">${p.category} · ${scoreHTML(p.id)}</div></div>
    </button>`).join("");
}

$("#carousel").addEventListener("click", (e) => {
  const b = e.target.closest(".mini"); if (!b) return;
  const p = byId[b.dataset.id];
  if (map) map.flyTo([p.lat, p.lng], 16, { duration: 0.6 });
  highlight(p.id);
  setTimeout(() => openSheet(p.id), 450);
});

// Ao rolar o carrossel, destaca o marcador do card central
let scrollTimer;
$("#carousel").addEventListener("scroll", () => {
  clearTimeout(scrollTimer);
  scrollTimer = setTimeout(() => {
    const box = $("#carousel").getBoundingClientRect();
    const mid = box.left + box.width / 2;
    let best = null, dist = Infinity;
    document.querySelectorAll(".mini").forEach((c) => {
      const r = c.getBoundingClientRect(); const d = Math.abs(r.left + r.width / 2 - mid);
      if (d < dist) { dist = d; best = c.dataset.id; }
    });
    if (best) highlight(best);
  }, 120);
}, { passive: true });

// ---------- Lugares ----------
const CATS = ["Todos", ...new Set(PLACES.map((p) => p.category))];
let filter = "Todos";

function renderFilters() {
  $("#filters").innerHTML = CATS.map(
    (c) => `<button class="filter ${c === filter ? "on" : ""}" data-cat="${c}">${c}</button>`
  ).join("");
}
$("#filters").addEventListener("click", (e) => {
  const b = e.target.closest(".filter"); if (!b) return;
  filter = b.dataset.cat; renderFilters(); renderList();
});

function renderList() {
  const items = PLACES.filter((p) => filter === "Todos" || p.category === filter);
  $("#list").innerHTML = items.map((p) => `
    <button class="photo-card" data-id="${p.id}">
      <div class="photo-wrap">
        <img src="${p.photo}" alt="${p.name}" loading="lazy">
        <span class="badge">${p.category}</span>
        ${state.favorite === p.id ? '<span class="fav" title="Seu favorito">♥</span>' : ""}
      </div>
      <div class="photo-info"><h3>${p.name}</h3>${scoreHTML(p.id)}</div>
    </button>`).join("");
}

// ---------- Ranking ----------
// Pontuação = estrelas + 2 pontos de bônus para o favorito
const score = (p) => (state.ratings[p.id] || 0) + (state.favorite === p.id ? 2 : 0);

function rowHTML(p, n) {
  const r = state.ratings[p.id];
  const meta = [r ? `★ ${r},0` : "Sem nota", state.favorite === p.id ? "♥ favorito" : ""].filter(Boolean).join(" · ");
  return `<button class="row" data-id="${p.id}"><span class="rank-n">${n}</span>
    <img src="${p.photo}" alt="" loading="lazy">
    <div class="row-main"><div class="row-title">${p.name}</div><div class="row-meta">${meta}</div></div></button>`;
}

function renderRank() {
  const rated = PLACES.filter((p) => score(p) > 0).sort((a, b) => score(b) - score(a));
  const unrated = PLACES.filter((p) => score(p) === 0);
  if (!rated.length) {
    $("#podium").innerHTML = "";
    $("#rank").innerHTML = `<p class="empty">Avalie os lugares com estrelas e vote no seu favorito para montar o ranking.</p>` +
      unrated.map((p) => rowHTML(p, "–")).join("");
    return;
  }
  $("#podium").innerHTML = [[1, "second"], [0, "first"], [2, "third"]].map(([i, cls]) => {
    const p = rated[i];
    if (!p) return "<div></div>";
    return `<div class="pod ${cls}" data-id="${p.id}"><img src="${p.photo}" alt="">
      <div class="pod-name">${p.name}</div><div class="pod-bar">${i + 1}º</div></div>`;
  }).join("");
  $("#rank").innerHTML =
    rated.slice(3).map((p, i) => rowHTML(p, i + 4)).join("") +
    (unrated.length ? `<p class="eyebrow section-label">Ainda não avaliados</p>` + unrated.map((p) => rowHTML(p, "–")).join("") : "");
}

function renderAll() {
  renderCarousel(); renderList(); renderRank();
  $("#progress").textContent = `${Object.keys(state.ratings).length}/${PLACES.length} avaliados`;
}

// ---------- Detalhe ----------
let current = null;

function openSheet(id) {
  const p = byId[id]; current = id;
  $("#sheet-hero").style.backgroundImage = `url("${p.photo}")`;
  $("#sheet-credit").textContent = `Foto: ${p.credit.author} · ${p.credit.license} · Wikimedia Commons`;
  $("#sheet-credit").href = p.credit.source;
  $("#sheet-cat").textContent = p.category;
  $("#sheet-name").textContent = p.name;
  $("#sheet-desc").textContent = p.desc;
  $("#directions").href = `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`;
  renderSheetControls();
  $("#sheet").scrollTop = 0;
  $("#sheet").classList.add("show");
  $("#backdrop").classList.add("show");
  $("#sheet").setAttribute("aria-hidden", "false");
}

function closeSheet() {
  $("#sheet").classList.remove("show");
  $("#backdrop").classList.remove("show");
  $("#sheet").setAttribute("aria-hidden", "true");
  current = null;
}

function renderSheetControls() {
  const r = state.ratings[current] || 0;
  $("#stars").innerHTML = [1, 2, 3, 4, 5]
    .map((n) => `<button class="star ${n <= r ? "on" : ""}" data-n="${n}" aria-label="${n} estrelas">★</button>`).join("");
  $("#stars-hint").textContent = r ? LABELS[r] : "Toque nas estrelas para avaliar";
  const isFav = state.favorite === current;
  $("#vote").classList.toggle("voted", isFav);
  $("#vote").textContent = isFav ? "♥ Seu voto de melhor lugar" : "Votar como o melhor lugar";
}

$("#stars").addEventListener("click", (e) => {
  const b = e.target.closest(".star"); if (!b) return;
  const n = +b.dataset.n;
  if (state.ratings[current] === n) delete state.ratings[current];
  else state.ratings[current] = n;
  save(); renderSheetControls(); renderAll();
});

$("#vote").addEventListener("click", () => {
  const was = state.favorite;
  state.favorite = was === current ? null : current;
  save(); renderSheetControls(); renderAll();
  if (state.favorite) toast(was && was !== current ? "Voto transferido para este lugar ♥" : "Voto registrado ♥");
  else toast("Voto removido");
});

$("#backdrop").addEventListener("click", closeSheet);
$("#close").addEventListener("click", closeSheet);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeSheet(); });

// Arrastar o detalhe para baixo para fechar
let startY = null;
$("#sheet").addEventListener("touchstart", (e) => {
  if ($("#sheet").scrollTop === 0) startY = e.touches[0].clientY;
}, { passive: true });
$("#sheet").addEventListener("touchend", (e) => {
  if (startY !== null && e.changedTouches[0].clientY - startY > 80) closeSheet();
  startY = null;
});

// Toque em cards da lista e do ranking
document.addEventListener("click", (e) => {
  const el = e.target.closest(".photo-card, .row, .pod"); if (el) openSheet(el.dataset.id);
});

// ---------- Navegação ----------
const titles = { map: "Explorar", list: "Lugares", rank: "Ranking" };
document.querySelectorAll(".tab").forEach((t) =>
  t.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((x) => x.classList.toggle("active", x === t));
    document.querySelectorAll(".view").forEach((v) => v.classList.toggle("active", v.id === `view-${t.dataset.view}`));
    $("#title").textContent = titles[t.dataset.view];
    if (t.dataset.view === "map" && map) setTimeout(() => map.invalidateSize(), 0);
  })
);

let toastTimer;
function toast(msg) {
  const t = $("#toast"); t.textContent = msg; t.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), 1800);
}

renderFilters();
renderAll();
