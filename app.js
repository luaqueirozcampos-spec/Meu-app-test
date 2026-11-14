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
const tint = (hex) => hex + "22";
const starsText = (n) => (n ? "★".repeat(n) + "☆".repeat(5 - n) : "Não avaliado");

// ---------- Mapa ----------
const hasMap = typeof L !== "undefined";
const map = hasMap ? L.map("map", { zoomControl: false, attributionControl: true }).setView([-2.515, -44.29], 13) : null;
if (hasMap) {
L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
  attribution: '&copy; OpenStreetMap &copy; CARTO', maxZoom: 19,
}).addTo(map);

PLACES.forEach((p) => {
  const icon = L.divIcon({
    className: "", iconSize: [38, 38], iconAnchor: [19, 38],
    html: `<div class="pin" style="background:${p.color}"><span>${p.emoji}</span></div>`,
  });
  L.marker([p.lat, p.lng], { icon }).addTo(map).on("click", () => openSheet(p.id));
});
map.fitBounds(PLACES.map((p) => [p.lat, p.lng]), { padding: [40, 40] });
} else {
  document.getElementById("map").innerHTML = '<div class="empty">Mapa indisponível sem internet.<br>Use a aba Lugares.</div>';
}

$("#map-chips").innerHTML = PLACES.map(
  (p) => `<button class="chip" data-id="${p.id}">${p.emoji} ${p.name}</button>`
).join("");
$("#map-chips").addEventListener("click", (e) => {
  const b = e.target.closest(".chip"); if (!b) return;
  const p = byId[b.dataset.id];
  if (map) map.flyTo([p.lat, p.lng], 16, { duration: 0.6 });
  setTimeout(() => openSheet(p.id), 450);
});

// ---------- Lista ----------
function cardHTML(p, prefix = "") {
  const r = state.ratings[p.id];
  const fav = state.favorite === p.id ? `<span class="heart">♥ Favorito</span>` : "";
  return `<button class="card" data-id="${p.id}">
    ${prefix}
    <div class="thumb" style="background:${tint(p.color)}">${p.emoji}</div>
    <div class="card-main">
      <div class="card-title">${p.name}</div>
      <div class="card-meta"><span>${p.category}</span>
        <span style="color:${r ? "var(--star)" : "inherit"}">${starsText(r)}</span>${fav}</div>
    </div>
  </button>`;
}

function renderList() {
  $("#list").innerHTML = PLACES.map((p) => cardHTML(p)).join("");
}

// ---------- Ranking ----------
// Pontuação = estrelas + 2 pontos de bônus para o favorito
function score(p) {
  return (state.ratings[p.id] || 0) + (state.favorite === p.id ? 2 : 0);
}

function renderRank() {
  const rated = PLACES.filter((p) => score(p) > 0).sort((a, b) => score(b) - score(a));
  if (!rated.length) {
    $("#podium").innerHTML = "";
    $("#rank").innerHTML = `<div class="empty">🏆<br><br>Avalie os lugares com estrelas e escolha seu favorito para montar o ranking.</div>`;
    return;
  }
  const order = [[1, "second"], [0, "first"], [2, "third"]];
  $("#podium").innerHTML = order.map(([i, cls]) => {
    const p = rated[i];
    if (!p) return `<div></div>`;
    return `<div class="pod ${cls}" data-id="${p.id}">
      <div class="thumb" style="background:${tint(p.color)}">${p.emoji}</div>
      <div class="pod-name">${p.name}</div>
      <div class="pod-bar">${i + 1}º</div>
    </div>`;
  }).join("");
  const rest = rated.slice(3);
  const unrated = PLACES.filter((p) => score(p) === 0);
  $("#rank").innerHTML =
    rest.map((p, i) => cardHTML(p, `<span class="rank-n">${i + 4}</span>`)).join("") +
    (unrated.length ? `<p class="eyebrow" style="margin:10px 4px 0">Ainda não avaliados</p>` +
      unrated.map((p) => cardHTML(p, `<span class="rank-n">–</span>`)).join("") : "");
}

function renderAll() {
  renderList();
  renderRank();
  const n = Object.keys(state.ratings).length;
  $("#progress").textContent = `${n}/${PLACES.length} avaliados`;
}

// ---------- Detalhe (bottom sheet) ----------
let current = null;

function openSheet(id) {
  const p = byId[id]; current = id;
  $("#sheet-hero").style.background = `linear-gradient(160deg, ${tint(p.color)}, ${p.color}55)`;
  $("#sheet-hero").textContent = p.emoji;
  $("#sheet-cat").textContent = p.category;
  $("#sheet-name").textContent = p.name;
  $("#sheet-desc").textContent = p.desc;
  $("#directions").href = `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`;
  renderSheetControls();
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
    .map((n) => `<button class="star ${n <= r ? "on" : ""}" data-n="${n}" aria-label="${n} estrelas">★</button>`)
    .join("");
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

// Arrastar o sheet para baixo para fechar
let startY = null;
$("#sheet").addEventListener("touchstart", (e) => {
  if ($("#sheet").scrollTop === 0) startY = e.touches[0].clientY;
}, { passive: true });
$("#sheet").addEventListener("touchend", (e) => {
  if (startY !== null && e.changedTouches[0].clientY - startY > 80) closeSheet();
  startY = null;
});

// Clique em cards (lista, ranking, pódio)
document.addEventListener("click", (e) => {
  const el = e.target.closest(".card, .pod"); if (el) openSheet(el.dataset.id);
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

renderAll();
