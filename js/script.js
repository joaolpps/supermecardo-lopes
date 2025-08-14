/* =========================
   Supermercado Lopes - script.js
   ========================= */

/* -------------------------
   CONFIG
------------------------- */
const IS_IN_CATEGORY = /\/categorias\//i.test(location.pathname);
const BASE = IS_IN_CATEGORY ? ".." : ".";
const DATA_DIR = `${BASE}/data`;

const TITLE_TO_FILE = {
  "produtos com desconto": "produtos-com-desconto",
  "mais vendidos": "mais-vendidos",
  "novidades": "novidades",
  "eletrônicos": "eletronicos",
  "eletronicos": "eletronicos",
  "limpeza": "limpeza",
  "higiene & beleza": "higiene",
  "higiene": "higiene",
  "bebidas": "bebidas",
  "alimentos": "alimentos",
  "pet shop": "petshop",
  "infantil": "infantil"
};

/* -------------------------
   HELPERS
------------------------- */
function slugify(str) {
  return (str || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " e ")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function formatBRL(n) {
  const v = Number(n || 0);
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function titleToJsonPath(titleText) {
  const key = (titleText || "").trim().toLowerCase();
  const file = TITLE_TO_FILE[key] || slugify(key);
  return `${DATA_DIR}/${file}.json`;
}

function resolveAsset(path) {
  if (!path) return "";
  if (/^https?:\/\//.test(path) || path.startsWith("/")) return path;
  const cleaned = path.replace(/^(\.\/)+/, "").replace(/^(\.\.\/)+/, "");
  return `${BASE}/${cleaned}`;
}

/* -------------------------
   RENDER DE PRODUTO (CARD)
------------------------- */
function productCardHTML(p) {
  const temPrecoDe = p.preco_de != null && p.preco_de !== "";
  const temPrecoPor = p.preco_por != null && p.preco_por !== "";
  const descontoCalc = (!p.desconto && temPrecoDe && temPrecoPor)
    ? Math.max(0, Math.round(100 - (Number(p.preco_por) * 100) / Number(p.preco_de)))
    : p.desconto;

  const badgeDesconto = descontoCalc ? `<span class="desconto">-${descontoCalc}%</span>` : "";
  const badgeEvento   = p.evento ? `<span class="evento">${p.evento}</span>` : "";
  const descricaoHTML = p.descricao ? `<p>${p.descricao}</p>` : "";
  const precoDeHTML   = temPrecoDe ? `<span class="product-old-price">${formatBRL(p.preco_de)}</span>` : "";
  const precoPorHTML  = temPrecoPor ? `<span class="product-price">${formatBRL(p.preco_por)}</span>` : "";
  const unidadeHTML   = p.unidade ? `<span class="product-unit">${p.unidade}</span>` : "";

  return `
    <article class="product-card" 
             data-id="${p.id ?? ""}" 
             data-categoria="${p.categoria ?? ""}">
      <div class="badges">
        ${badgeDesconto}
        ${badgeEvento}
      </div>
      <div class="product-image">
        <img src="${resolveAsset(p.imagem)}" alt="${p.nome}">
      </div>
      <div class="product-info">
        <h3>${p.nome}</h3>
        ${descricaoHTML}
        <div class="product-pricing">
          ${precoDeHTML}
          ${precoPorHTML}
          ${unidadeHTML}
        </div>
        <button class="add-to-cart" type="button">
          <i class="fa-solid fa-cart-plus"></i> Adicionar
        </button>
      </div>
    </article>
  `;
}

/* -------------------------
   CARRINHO
------------------------- */
const LS_CART_KEY = "lopes_cart_v1";

function readCart() {
  try { return JSON.parse(localStorage.getItem(LS_CART_KEY) || "[]"); }
  catch { return []; }
}

function writeCart(items) {
  localStorage.setItem(LS_CART_KEY, JSON.stringify(items));
  updateHeaderTotal();
}

function addToCart(produto) {
  const cart = readCart();
  const idx = cart.findIndex(i => i.id === produto.id);
  if (idx >= 0) {
    cart[idx].qtd += 1;
  } else {
    cart.push({ 
      id: produto.id, 
      nome: produto.nome, 
      preco: Number(produto.preco_por || produto.preco_de || 0), 
      qtd: 1 
    });
  }
  writeCart(cart);
  toast(`${produto.nome} adicionado ao carrinho!`);
}

function cartTotal() {
  return readCart().reduce((acc, i) => acc + Number(i.preco) * Number(i.qtd), 0);
}

function updateHeaderTotal() {
  const el = document.querySelector("#total-carrinho");
  if (el) el.textContent = formatBRL(cartTotal());
}

/* -------------------------
   TOAST
------------------------- */
function toast(msg) {
  const n = document.createElement("div");
  n.className = "cart-notification";
  n.textContent = msg;
  document.body.appendChild(n);
  setTimeout(() => n.classList.add("hide"), 1800);
  setTimeout(() => n.remove(), 2200);
}

/* -------------------------
   LOADERS
------------------------- */
async function fetchJSON(path) {
  const resp = await fetch(path, { cache: "no-store" });
  if (!resp.ok) throw new Error(`Falha ao carregar ${path}`);
  return resp.json();
}

async function loadGridFromJSON(gridEl, jsonPath) {
  const data = await fetchJSON(jsonPath);
  if (!Array.isArray(data) || data.length === 0) {
    gridEl.innerHTML = `<p class="cart-notification">Nenhum produto encontrado.</p>`;
    return;
  }
  gridEl.innerHTML = data.map(productCardHTML).join("");
  gridEl.querySelectorAll(".add-to-cart").forEach((btn, i) => {
    btn.addEventListener("click", () => addToCart(data[i]));
  });
}

function findNextGridAfter(titleEl) {
  let n = titleEl.nextElementSibling;
  while (n) {
    if (n.classList && n.classList.contains("products-grid")) return n;
    n = n.nextElementSibling;
  }
  const section = titleEl.closest(".section");
  if (!section) return null;
  const grids = Array.from(section.querySelectorAll(".products-grid"));
  for (const g of grids) {
    if (g.compareDocumentPosition(titleEl) & Node.DOCUMENT_POSITION_FOLLOWING) return g;
  }
  return null;
}

async function loadSectionsByTitles() {
  const titles = document.querySelectorAll(".section .section-title");
  for (const titleEl of titles) {
    const grid = findNextGridAfter(titleEl);
    if (!grid) continue;
    const explicit = grid.getAttribute("data-json");
    const jsonPath = explicit || titleToJsonPath(titleEl.textContent);
    grid.setAttribute("data-json", jsonPath);
    try { 
      await loadGridFromJSON(grid, jsonPath); 
    } catch (e) { 
      console.error(e); 
      grid.innerHTML = `<p class="cart-notification">Erro ao carregar produtos.</p>`; 
    }
  }
}

async function loadCategoryPage() {
  const titleEl = document.querySelector("main .section .section-title, main h2.section-title, main h2");
  const grid = document.querySelector("main .products-grid, .products-grid");
  if (!titleEl || !grid) return;
  const explicit = grid.getAttribute("data-json");
  const jsonPath = explicit || titleToJsonPath(titleEl.textContent);
  grid.setAttribute("data-json", jsonPath);
  try { 
    await loadGridFromJSON(grid, jsonPath); 
  } catch (e) { 
    console.error(e); 
    grid.innerHTML = `<p class="cart-notification">Erro ao carregar produtos.</p>`; 
  }
}

/* -------------------------
   PROMOÇÕES E NOVIDADES
------------------------- */
async function loadPromosAndNews() {
  // Carrega produtos com desconto e novidades usando tanto
  // a abordagem de grids específicos quanto a agregação de categorias
  
  const categorias = [
    "alimentos", "bebidas", "higiene", "limpeza", 
    "petshop", "infantil", "eletronicos"
  ];

  let todosProdutos = [];
  const produtosComDesconto = [];
  const novidades = [];

  // Carrega todos os produtos das categorias
  for (const categoria of categorias) {
    try {
      const data = await fetchJSON(`${DATA_DIR}/${categoria}.json`);
      if (!Array.isArray(data)) continue;
      
      todosProdutos = todosProdutos.concat(data);
      
      data.forEach(produto => {
        // Produtos com desconto
        const temDesconto = (produto.desconto && produto.desconto > 0) ||
          (produto.preco_de && produto.preco_por && Number(produto.preco_por) < Number(produto.preco_de));
        
        if (temDesconto) {
          produtosComDesconto.push(produto);
        }
        
        // Novidades baseadas na data de cadastro
        if (produto.data_cadastro) {
          novidades.push(produto);
        }
      });
    } catch (err) {
      console.error(`Erro ao carregar ${categoria}.json`, err);
    }
  }

  // Ordena produtos com desconto por valor do desconto
  produtosComDesconto.sort((a, b) => {
    const descontoA = a.desconto || 
      (a.preco_de && a.preco_por ? Math.round(100 - (Number(a.preco_por) * 100) / Number(a.preco_de)) : 0);
    const descontoB = b.desconto || 
      (b.preco_de && b.preco_por ? Math.round(100 - (Number(b.preco_por) * 100) / Number(b.preco_de)) : 0);
    return descontoB - descontoA;
  });

  // Ordena novidades pela data mais recente
  novidades.sort((a, b) => new Date(b.data_cadastro) - new Date(a.data_cadastro));

  // Limita a 8 itens cada
  const descontosExibicao = produtosComDesconto.slice(0, 8);
  const novidadesExibicao = novidades.slice(0, 8);

  // Produtos com desconto - suporta múltiplos IDs
  const gridsDescontos = document.querySelectorAll("#products-grid, .products-grid[data-type='desconto']");
  gridsDescontos.forEach(grid => {
    if (grid && descontosExibicao.length > 0) {
      grid.innerHTML = descontosExibicao.map(productCardHTML).join("");
      grid.querySelectorAll(".add-to-cart").forEach((btn, i) => {
        btn.addEventListener("click", () => addToCart(descontosExibicao[i]));
      });
    }
  });

  // Novidades - suporta múltiplos IDs
  const gridsNovidades = document.querySelectorAll("#new-products-grid, .products-grid[data-type='novidades']");
  gridsNovidades.forEach(grid => {
    if (grid && novidadesExibicao.length > 0) {
      grid.innerHTML = novidadesExibicao.map(productCardHTML).join("");
      grid.querySelectorAll(".add-to-cart").forEach((btn, i) => {
        btn.addEventListener("click", () => addToCart(novidadesExibicao[i]));
      });
    }
  });
}

/* -------------------------
   UI COMPONENTS
------------------------- */
function setupLoginPopup() {
  const popup = document.querySelector("#login-popup");
  const openBtn = document.querySelector("#openRegisterPopup");
  const closeBtn = document.querySelector("#closeLoginPopup");
  if (!popup) return;
  
  function open() { popup.style.display = "flex"; }
  function close() { popup.style.display = "none"; }
  
  openBtn && openBtn.addEventListener("click", (e) => { e.preventDefault(); open(); });
  closeBtn && closeBtn.addEventListener("click", close);
  popup.addEventListener("click", (e) => { if (e.target === popup) close(); });
}

function setupMobileMenu() {
  const btn = document.querySelector(".mobile-menu");
  const nav = document.querySelector(".main-categories-nav");
  if (!btn || !nav) return;
  btn.addEventListener("click", () => nav.classList.toggle("active"));
}

function setupSwiperIfPresent() {
  if (typeof Swiper === "function") {
    new Swiper(".my-banner-swiper", {
      loop: true,
      autoplay: { delay: 3500, disableOnInteraction: false },
      pagination: { el: ".swiper-pagination", clickable: true },
      navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" }
    });
  }
}

function setupProductFilters() {
  const filterBtns = document.querySelectorAll(".filter-btn");
  const grid = document.querySelector("#grid-produtos, .products-grid[data-filterable]");
  if (!filterBtns.length || !grid) return;

  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.getAttribute("data-filter");
      const cards = grid.querySelectorAll(".product-card");
      cards.forEach(card => {
        const categoria = card.getAttribute("data-categoria");
        card.style.display = (filter === "all" || categoria === filter) ? "" : "none";
      });
    });
  });
}

/* -------------------------
   BOOT SEQUENCE
------------------------- */
document.addEventListener("DOMContentLoaded", async () => {
  // Setup inicial da UI
  setupLoginPopup();
  setupMobileMenu();
  setupSwiperIfPresent();
  
  // Atualiza total do carrinho
  updateHeaderTotal();
  
  // Carrega produtos (em ordem de prioridade)
  await loadSectionsByTitles();   // Carrega seções baseadas em títulos
  await loadCategoryPage();       // Carrega página de categoria específica
  await loadPromosAndNews();      // Carrega promoções e novidades primeiro
  
  // Setup final da UI
  setupProductFilters();
});