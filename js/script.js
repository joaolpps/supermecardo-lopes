/* =========================
   Supermercado Lopes - script.js (completo)
   ========================= */

/* -------------------------
   CONFIG
------------------------- */
const IS_IN_CATEGORY = /\/categorias\//i.test(location.pathname);
const IS_IN_CART = /\/carrinho\//i.test(location.pathname);
const BASE = (IS_IN_CATEGORY || IS_IN_CART) ? ".." : ".";
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

// Carrinho & Cupom
const LS_CART_KEY = "lopes_cart_v1";
const LS_COUPON_KEY = "lopes_coupon_v1";
const DELIVERY_FEE_DEFAULT = 4.99;

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

function $(sel, root=document) { return root.querySelector(sel); }
function $all(sel, root=document) { return Array.from(root.querySelectorAll(sel)); }

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
   CARRINHO (LOCALSTORAGE)
------------------------- */
function readCart() {
  try { return JSON.parse(localStorage.getItem(LS_CART_KEY) || "[]"); }
  catch { return []; }
}

function writeCart(items) {
  localStorage.setItem(LS_CART_KEY, JSON.stringify(items));
  updateHeaderTotal();
  // Re-renderiza onde for necessário
  if (document.querySelector('.carrinho-container')) {
    renderCartPage();
  }
  renderDrawer(readCart());
}

function addToCart(produto) {
  const cart = readCart();
  const idx = cart.findIndex(i => i.id === produto.id);
  const precoBase = Number(produto.preco_por ?? produto.preco_de ?? produto.preco ?? 0);
  if (idx >= 0) {
    cart[idx].qtd += 1;
  } else {
    cart.push({ 
      id: produto.id, 
      nome: produto.nome, 
      preco: precoBase,
      imagem: produto.imagem ? resolveAsset(produto.imagem) : "",
      categoria: produto.categoria ?? "",
      unidade: produto.unidade ?? "",
      qtd: 1 
    });
  }
  writeCart(cart);
  toast(`${produto.nome} adicionado ao carrinho!`);
}

function cartTotal() {
  return readCart().reduce((acc, i) => acc + Number(i.preco) * Number(i.qtd), 0);
}

function cartCount() {
  return readCart().reduce((acc, i) => acc + Number(i.qtd || 1), 0);
}

function updateHeaderTotal() {
  const el = document.querySelector("#total-carrinho");
  if (el) el.textContent = formatBRL(cartTotal());
  const cc = document.querySelector('#cart-count');
  if (cc) cc.textContent = String(cartCount());
}

/* -------------------------
   CUPOM
------------------------- */
function getCoupon() {
  try { return JSON.parse(localStorage.getItem(LS_COUPON_KEY) || "null"); }
  catch { return null; }
}

function setCoupon(c) {
  if (!c) localStorage.removeItem(LS_COUPON_KEY);
  else localStorage.setItem(LS_COUPON_KEY, JSON.stringify(c));
}

// Regras simples de exemplo (ajuste como quiser)
function validateCoupon(code) {
  const c = (code || "").trim().toUpperCase();
  if (!c) return null;
  // Exemplos:
  if (c === "LOPES10") return { code: c, type: "percent", amount: 10 };
  if (c === "LOPES20") return { code: c, type: "percent", amount: 20 };
  if (c === "FRETEGRATIS") return { code: c, type: "frete", amount: 100 };
  if (c === "DESCONTO10") return { code: c, type: "value", amount: 10 };
  return null;
}

function calcDiscount(subtotal, coupon) {
  if (!coupon) return 0;
  if (coupon.type === 'percent') return (subtotal * (coupon.amount / 100));
  if (coupon.type === 'value') return coupon.amount;
  return 0;
}

function applyCoupon() {
  const input = document.querySelector('#cupom-input');
  const code = input ? input.value : '';
  const valid = validateCoupon(code);
  setCoupon(valid);
  toast(valid ? `Cupom ${valid.code} aplicado!` : 'Cupom inválido.');
  renderCartPage();
}

/* -------------------------
   TOAST
------------------------- */
function toast(msg) {
  const existent = document.getElementById('cart-toast');
  if (existent && existent.classList) {
    existent.textContent = msg;
    existent.classList.remove('hidden');
    existent.classList.remove('hide');
    setTimeout(() => existent.classList.add('hide'), 1600);
    setTimeout(() => existent.classList.add('hidden'), 2000);
    return;
  }
  const n = document.createElement("div");
  n.className = "cart-notification";
  n.textContent = msg;
  document.body.appendChild(n);
  setTimeout(() => n.classList.add("hide"), 1600);
  setTimeout(() => n.remove(), 2000);
}

/* -------------------------
   LOADERS (CATÁLOGO)
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
      grid.innerHTML = `<p class=\"cart-notification\">Erro ao carregar produtos.</p>`; 
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
    grid.innerHTML = `<p class=\"cart-notification\">Erro ao carregar produtos.</p>`; 
  }
}

/* -------------------------
   PROMOÇÕES E NOVIDADES
------------------------- */
async function loadPromosAndNews() {
  const categorias = [
    "alimentos", "bebidas", "higiene", "limpeza", 
    "petshop", "infantil", "eletronicos"
  ];

  let todosProdutos = [];
  const produtosComDesconto = [];
  const novidades = [];

  for (const categoria of categorias) {
    try {
      const data = await fetchJSON(`${DATA_DIR}/${categoria}.json`);
      if (!Array.isArray(data)) continue;
      todosProdutos = todosProdutos.concat(data);

      data.forEach(produto => {
        const temDesconto = (produto.desconto && produto.desconto > 0) ||
          (produto.preco_de && produto.preco_por && Number(produto.preco_por) < Number(produto.preco_de));
        if (temDesconto) produtosComDesconto.push(produto);
        if (produto.data_cadastro) novidades.push(produto);
      });
    } catch (err) {
      console.error(`Erro ao carregar ${categoria}.json`, err);
    }
  }

  produtosComDesconto.sort((a, b) => {
    const descontoA = a.desconto || 
      (a.preco_de && a.preco_por ? Math.round(100 - (Number(a.preco_por) * 100) / Number(a.preco_de)) : 0);
    const descontoB = b.desconto || 
      (b.preco_de && b.preco_por ? Math.round(100 - (Number(b.preco_por) * 100) / Number(b.preco_de)) : 0);
    return descontoB - descontoA;
  });

  novidades.sort((a, b) => new Date(b.data_cadastro) - new Date(a.data_cadastro));

  const descontosExibicao = produtosComDesconto.slice(0, 8);
  const novidadesExibicao = novidades.slice(0, 8);

  const gridsDescontos = document.querySelectorAll("#products-grid, .products-grid[data-type='desconto']");
  gridsDescontos.forEach(grid => {
    if (grid && descontosExibicao.length > 0) {
      grid.innerHTML = descontosExibicao.map(productCardHTML).join("");
      grid.querySelectorAll(".add-to-cart").forEach((btn, i) => {
        btn.addEventListener("click", () => addToCart(descontosExibicao[i]));
      });
    }
  });

  const gridsNovidades = document.querySelectorAll("#new-products-grid, .products-grid[data-type='novidades']");
  gridsNovidades.forEach(grid => {
    if (grid && novidadesExibicao.length > 0) {
      grid.innerHTML = novidadesExibicao.map(productCardHTML).join("");
      grid.querySelectorAll(".add-to-cart").forEach((btn, i) => {
        btn.addEventListener("click", () => addToCart(novidadesExibicao[i]));
      });
    }
  });

  // Caso exista #related-products-grid e não tenha data-json, tenta carregar "mais-vendidos.json"
  const relatedGrid = document.getElementById('related-products-grid');
  if (relatedGrid && !relatedGrid.getAttribute('data-json')) {
    try {
      await loadGridFromJSON(relatedGrid, `${DATA_DIR}/mais-vendidos.json`);
    } catch (_) { /* silencioso */ }
  }
}

/* -------------------------
   PÁGINA DO CARRINHO (RENDER)
------------------------- */
function cartItemHTML(i, index) {
  const img = i.imagem ? `<img src="${i.imagem}" alt="${i.nome}" />` : `<i class="fas fa-box" aria-hidden="true"></i>`;
  return `
    <div class="item-carrinho" data-index="${index}">
      <div class="item-imagem">${img}</div>
      <div class="item-info">
        <h3>${i.nome}</h3>
        ${i.unidade ? `<p>${i.unidade}</p>` : ''}
      </div>
      <div class="item-preco" aria-label="Preço unitário">${formatBRL(i.preco)}</div>
      <div class="quantidade-controls" aria-label="Quantidade">
        <button class="quantidade-btn" data-action="dec" aria-label="Diminuir">−</button>
        <input class="quantidade-input" type="number" min="1" value="${i.qtd}" aria-label="Quantidade do item" />
        <button class="quantidade-btn" data-action="inc" aria-label="Aumentar">+</button>
      </div>
      <button class="remover-btn" aria-label="Remover">Remover</button>
    </div>
  `;
}

function renderCartPage() {
  const list = document.getElementById('cart-items-container');
  const subtotalEl = document.getElementById('subtotal');
  const discountEl = document.getElementById('descontos');
  const deliveryFeeEl = document.getElementById('frete');
  const totalEl = document.getElementById('total');
  const sectionContent = document.querySelector('.carrinho-content');
  const sectionEmpty = document.getElementById('empty-cart');

  const items = readCart();
  const subtotal = items.reduce((acc, i) => acc + Number(i.preco) * Number(i.qtd), 0);
  const coupon = getCoupon();
  const desconto = Math.min(calcDiscount(subtotal, coupon), subtotal);
  // Frete
  let deliveryFee = DELIVERY_FEE_DEFAULT;
  if (coupon && coupon.type === 'frete') deliveryFee = 0;

  // Mostra/oculta seções
  if (items.length === 0) {
    if (list) list.innerHTML = '';
    if (sectionContent) sectionContent.style.display = 'none';
    if (sectionEmpty) { sectionEmpty.classList.remove('hidden'); sectionEmpty.style.display = ''; }
  } else {
    if (sectionContent) sectionContent.style.display = '';
    if (sectionEmpty) { sectionEmpty.classList.add('hidden'); sectionEmpty.style.display = 'none'; }
    if (list) list.innerHTML = items.map(cartItemHTML).join('');
  }

  // Totais
  subtotalEl && (subtotalEl.textContent = formatBRL(subtotal));
  discountEl && (discountEl.textContent = `- ${formatBRL(desconto)}`);
  deliveryFeeEl && (deliveryFeeEl.textContent = formatBRL(deliveryFee));
  const total = Math.max(0, subtotal - desconto + deliveryFee);
  totalEl && (totalEl.textContent = formatBRL(total));

  // Habilita/desabilita botão finalizar
  const finalizeBtn = document.getElementById('finalizar-btn');
  if (finalizeBtn) finalizeBtn.disabled = (items.length === 0 || total <= 0);

  // Renderiza também o drawer
  renderDrawer(items, total);
}

// Delegação de eventos na lista
function bindCartListEvents() {
  const list = document.getElementById('cart-items-container');
  if (!list) return;
  list.addEventListener('click', (e) => {
    const target = e.target;
    const itemEl = target.closest('.item-carrinho');
    if (!itemEl) return;
    const index = Number(itemEl.getAttribute('data-index'));
    const cart = readCart();
    const current = cart[index];
    if (!current) return;

    if (target.classList.contains('remover-btn')) {
      cart.splice(index, 1);
      writeCart(cart);
      return;
    }

    if (target.classList.contains('quantidade-btn')) {
      const action = target.getAttribute('data-action');
      if (action === 'inc') current.qtd += 1;
      if (action === 'dec') current.qtd = Math.max(1, Number(current.qtd) - 1);
      writeCart(cart);
      return;
    }
  });

  // Atualização direta pelo input
  list.addEventListener('change', (e) => {
    const input = e.target;
    if (!input.classList.contains('quantidade-input')) return;
    const itemEl = input.closest('.item-carrinho');
    const index = Number(itemEl?.getAttribute('data-index'));
    const cart = readCart();
    const current = cart[index];
    if (!current) return;
    const val = Math.max(1, parseInt(input.value || '1', 10));
    current.qtd = val;
    writeCart(cart);
  });
}

/* -------------------------
   DRAWER LATERAL
------------------------- */
function renderDrawer(items = readCart(), pageTotal = null) {
  const drawerItems = document.querySelector('#drawer-items');
  const drawerTotal = document.querySelector('#drawer-total');
  if (drawerItems) {
    drawerItems.innerHTML = items.map((i, idx) => `
      <div class="cart-item" data-index="${idx}">
        <div class="cart-item-info">
          <h4>${i.nome}</h4>
          ${i.unidade ? `<p class="muted">${i.unidade}</p>` : ''}
        </div>
        <div class="cart-item-controls">
          <button class="qty-btn" data-action="dec" type="button">−</button>
          <span class="quantity">${i.qtd}</span>
          <button class="qty-btn" data-action="inc" type="button">+</button>
          <button class="remove-btn" data-action="remove" type="button">×</button>
        </div>
      </div>
    `).join('');
  }
  const subtotal = items.reduce((acc, i) => acc + Number(i.preco) * Number(i.qtd), 0);
  const coupon = getCoupon();
  const desconto = Math.min(calcDiscount(subtotal, coupon), subtotal);
  const deliveryFee = (coupon && coupon.type === 'frete') ? 0 : DELIVERY_FEE_DEFAULT;
  const total = pageTotal != null ? pageTotal : Math.max(0, subtotal - desconto + deliveryFee);
  if (drawerTotal) drawerTotal.textContent = formatBRL(total);
}

function bindDrawerEvents() {
  const drawer = document.querySelector('#cart-drawer');
  const drawerItems = document.querySelector('#drawer-items');
  const openBtn = document.querySelector('#open-cart');
  const closeBtn = document.querySelector('#close-cart');
  const clearBtn = document.querySelector('#clear-cart');

  function open() { drawer?.classList.add('open'); drawer?.setAttribute('aria-hidden', 'false'); }
  function close() { drawer?.classList.remove('open'); drawer?.setAttribute('aria-hidden', 'true'); }

  openBtn && openBtn.addEventListener('click', open);
  closeBtn && closeBtn.addEventListener('click', close);

  clearBtn && clearBtn.addEventListener('click', () => {
    writeCart([]);
    toast('Carrinho limpo.');
  });

  if (drawerItems) {
    drawerItems.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      const item = e.target.closest('.cart-item');
      const index = Number(item?.getAttribute('data-index'));
      const cart = readCart();
      const current = cart[index];
      if (!current) return;
      const action = btn.getAttribute('data-action');
      if (action === 'remove') cart.splice(index, 1);
      if (action === 'inc') current.qtd += 1;
      if (action === 'dec') current.qtd = Math.max(1, current.qtd - 1);
      writeCart(cart);
    });
  }
}

/* -------------------------
   UI COMPONENTS
------------------------- */
function setupLoginPopup() {
  const popup = document.querySelector("#login-popup");
  const openBtn = document.querySelector("#openRegisterPopup");
  const closeBtn = document.querySelector("#closeLoginPopup");
  if (!popup) return;
  function open() { popup.style.display = 'block'; popup.setAttribute('aria-hidden', 'false'); }
  function close() { popup.style.display = 'none'; popup.setAttribute('aria-hidden', 'true'); }
  openBtn && openBtn.addEventListener("click", (e) => { e.preventDefault(); open(); });
  closeBtn && closeBtn.addEventListener("click", close);
  popup.addEventListener("click", (e) => { if (e.target === popup) close(); });
}

function setupMobileMenu() {
  const btn = document.querySelector(".mobile-menu");
  const nav = document.querySelector(".main-categories-nav");
  if (!btn || !nav) return;

  // Criar overlay simples
  let overlay = document.querySelector('.menu-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'menu-overlay';
    Object.assign(overlay.style, { position:'fixed', inset:'0', background:'rgba(0,0,0,.35)', display:'none', zIndex:999 });
    document.body.appendChild(overlay);
  }

  function toggleMenu() {
    const active = nav.classList.toggle("active");
    overlay.style.display = active ? 'block' : 'none';
    document.body.style.overflow = active ? 'hidden' : '';
  }
  function closeMenu() {
    nav.classList.remove('active');
    overlay.style.display = 'none';
    document.body.style.overflow = '';
  }

  btn.addEventListener("click", toggleMenu);
  overlay.addEventListener('click', closeMenu);
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
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
   AÇÕES DE CHECKOUT
------------------------- */
function clearCart() { writeCart([]); toast('Carrinho limpo.'); }
function proceedToCheckout() {
  const items = readCart();
  if (!items.length) { toast('Seu carrinho está vazio.'); return; }
  alert('Fluxo de checkout ainda não implementado.');
}

/* -------------------------
   BOOT SEQUENCE
------------------------- */
document.addEventListener("DOMContentLoaded", async () => {
  setupLoginPopup();
  setupMobileMenu();
  setupSwiperIfPresent();

  updateHeaderTotal();

  // Essas funções só fazem algo se os elementos existirem
  await loadSectionsByTitles();
  await loadCategoryPage();
  await loadPromosAndNews();

  setupProductFilters();

  // Página do carrinho
  if (document.querySelector('.carrinho-container')) {
    bindCartListEvents();
    bindDrawerEvents();
    renderCartPage();

    // Botões/cupom
    document.querySelector('#apply-coupon-btn')?.addEventListener('click', applyCoupon);
    document.querySelector('#finalizar-btn')?.addEventListener('click', () => {
      const items = readCart();
      if (!items.length) return toast('Seu carrinho está vazio.');
      alert('Fluxo de checkout ainda não implementado.');
    });
  } else {
    // Mesmo fora da página do carrinho, drawer funciona
    bindDrawerEvents();
    renderDrawer(readCart());
  }
});
