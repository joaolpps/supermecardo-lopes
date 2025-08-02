// =========================
// SUPERMERCADO LOPES - SCRIPT ÚNICO
// =========================

// =========================
// PREÇOS GLOBAIS DOS PRODUTOS (Consolidado de precos-globais.js)
// =========================
window.PRECOS_PRODUTOS = {
    'cafe_pilao': {
        antigo: 45.99,
        novo: 40.47
    },
    'cerveja_heineken': {
        antigo: 6.78,
        novo: 6.10
    },
    'sabonete_dove': {
        antigo: 5.75,
        novo: 5.29
    },
    'cerveja_amstel': {
        antigo: 3.79,
        novo: 3.40
    },
    'arroz_camil': {
        antigo: 12.90,
        novo: 9.90
    },
    'leite_longa_vida': {
        antigo: 4.79,
        novo: 4.49
    },
    'detergente_ype': {
        antigo: 3.50,
        novo: 2.85
    },
    'picanha_bovina': { // Adicionado para Açougue
        antigo: 89.90,
        novo: 80.91
    },
    'racao_premium': { // Adicionado para Pet Shop
        antigo: 159.90,
        novo: 140.71
    },
    'fralda_pampers': { // Adicionado para Infantil
        antigo: 89.90,
        novo: 71.92
    },
    'microondas': { // Adicionado para Eletro
        antigo: 599.90,
        novo: 509.90
    },
    'tomate': { // Adicionado para Feira
        antigo: 8.99,
        novo: 6.99
    }
    // Adicione outros produtos conforme necessário
};

// =========================
// SCRIPT PARA PREENCHER PREÇOS NOS CARDS (Consolidado de preenche-precos.js)
// =========================
document.addEventListener('DOMContentLoaded', function() {
    // Mapeamento entre nome do produto (alt da imagem) e chave do objeto global
    const mapaProdutos = {
        'Café Pilão': 'cafe_pilao',
        'Heineken Long Neck': 'cerveja_heineken',
        'Sabonete Dove': 'sabonete_dove',
        'Cerveja Amstel Lata 350ml': 'cerveja_amstel',
        'Arroz Camil Branco Tipo 1': 'arroz_camil',
        'Leite Integral': 'leite_longa_vida',
        'Detergente Ypê': 'detergente_ype',
        'Picanha Bovina': 'picanha_bovina',
        'Ração para Cães': 'racao_premium',
        'Fralda': 'fralda_pampers',
        'Microondas': 'microondas',
        'Tomate': 'tomate'
    };

    document.querySelectorAll('.card-produto').forEach(card => {
        const img = card.querySelector('.imagem-produto img');
        if (!img) return;
        // Tenta identificar o produto pelo alt da imagem
        let chave = null;
        for (const nome in mapaProdutos) {
            if (img.alt.includes(nome)) {
                chave = mapaProdutos[nome];
                break;
            }
        }
        if (!chave || !window.PRECOS_PRODUTOS[chave]) return;
        const precos = window.PRECOS_PRODUTOS[chave];
        // Atualiza os preços nos spans
        const precoAntigoEl = card.querySelector('.preco-antigo');
        const precoNovoEl = card.querySelector('.preco-novo');
        if (precoAntigoEl && precos.antigo) precoAntigoEl.textContent = `R$ ${precos.antigo.toFixed(2).replace('.', ',')}`;
        if (precoNovoEl) precoNovoEl.textContent = `R$ ${precos.novo.toFixed(2).replace('.', ',')}`;
    });
});

// =========================
// POPUP DE LOGIN (Consolidado de login-popup.js)
// =========================
function setupLoginPopup() {
    const loginPopup = document.getElementById('login-popup');
    const openLoginPopup = document.getElementById('openLoginPopup');
    const closeLoginPopup = document.getElementById('closeLoginPopup');

    if (openLoginPopup && loginPopup && closeLoginPopup) {
        openLoginPopup.addEventListener('click', function(e) {
            e.preventDefault();
            loginPopup.style.display = 'flex';
            document.body.style.overflow = 'hidden'; // Previne scroll da página
        });

        closeLoginPopup.addEventListener('click', function() {
            loginPopup.style.display = 'none';
            document.body.style.overflow = 'auto';
        });

        window.addEventListener('click', function(event) {
            if (event.target === loginPopup) {
                loginPopup.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }
}

// =========================
// VARIÁVEIS GLOBAIS DO SISTEMA
// =========================
// Agora, 'cart' será sempre carregado/salvo do localStorage,
// as variáveis 'cartCount' e 'cartTotal' serão calculadas dinamicamente.
let cart = [];

// =========================
// INICIALIZAÇÃO DO SISTEMA
// =========================
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Inicializar componentes
    setupMobileMenu();
    setupLoginPopup(); // Chama o setup do popup de login
    initSwiperCarousel(); // Chama o inicializador do Swiper
    setupCart(); // Configura eventos para o carrinho lateral/popup (se existir)
    setupSearch();
    setupProductButtons(); // Botões "Adicionar ao Carrinho" dos produtos
    setupCategoryFilters(); // Verifica a existência dos botões e do grid
    setupSmoothScroll(); // Adicionado para links internos

    // **Lógica centralizada para o carrinho:**
    loadCartFromStorage(); // Carrega o carrinho do localStorage ao iniciar
    updateCartHeaderDisplay(); // Atualiza o total no cabeçalho em todas as páginas

    // Se estiver na página do carrinho (carrinho.html), renderiza os itens
    if (window.location.pathname.includes('carrinho.html')) {
        renderizarCarrinhoPage(); // Renderiza o carrinho na página de detalhes
    }

    console.log('Supermercado Lopes - Sistema inicializado com sucesso!');
}

// =========================
// MENU MOBILE
// =========================
function setupMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu');
    const navLinks = document.querySelector('.main-categories-nav');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');

            // Animação do ícone do menu
            if (navLinks.classList.contains('active')) {
                mobileMenuBtn.innerHTML = '✕'; // X para fechar
            } else {
                mobileMenuBtn.innerHTML = '&#9776;'; // Hambúrguer
            }
        });

        // Fechar menu ao clicar em um link
        const categoryLinks = navLinks.querySelectorAll('a');
        categoryLinks.forEach(link => {
            link.addEventListener('click', function() {
                navLinks.classList.remove('active');
                mobileMenuBtn.innerHTML = '&#9776;';
            });
        });

        // Fechar menu ao redimensionar a tela
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                navLinks.classList.remove('active');
                mobileMenuBtn.innerHTML = '&#9776;';
            }
        });
    }
}

// =========================
// CARROSSEL DE BANNERS (Inicialização Swiper.js - Consolidado de banner-carossel.js)
// =========================
function initSwiperCarousel() {
    // Verifica se a classe 'swiper' existe na página para evitar erro
    const swiperElement = document.querySelector('.my-banner-swiper');
    if (swiperElement && typeof Swiper !== 'undefined') {
        new Swiper('.my-banner-swiper', {
            loop: true, // Para um carrossel infinito
            autoplay: {
                delay: 5000, // Muda slide a cada 5 segundos
                disableOnInteraction: false, // Continua autoplay mesmo após interação do usuário
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true, // Permite clicar nas bolinhas de paginação
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
        });
        console.log('Swiper.js carrossel inicializado.');
    } else {
        // console.warn('Swiper library not loaded or .my-banner-swiper not found. Carousel will not work.');
    }
}

// =========================
// SISTEMA DE CARRINHO (Lógica unificada)
// =========================

// Função para salvar carrinho no localStorage
function saveCartToStorage() {
    try {
        localStorage.setItem('supermercado_cart', JSON.stringify(cart));
        console.log('Carrinho salvo no localStorage.');
    } catch (e) {
        console.error('Erro ao salvar carrinho no localStorage:', e);
    }
}

// Função para carregar carrinho do localStorage
function loadCartFromStorage() {
    try {
        const savedCart = localStorage.getItem('supermercado_cart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
            console.log('Carrinho carregado do localStorage:', cart);
        } else {
            cart = [];
            console.log('Carrinho vazio ou não encontrado no localStorage.');
        }
    } catch (e) {
        console.error('Erro ao carregar carrinho do localStorage:', e);
        cart = []; // Garante que o carrinho seja um array vazio em caso de erro
    }
}

// Calcula o total do carrinho
function getCartTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Calcula a contagem de itens no carrinho
function getCartCount() {
    return cart.reduce((total, item) => total + item.quantity, 0);
}

// Atualiza o display do total do carrinho no cabeçalho (em todas as páginas)
function updateCartHeaderDisplay() {
    const totalCarrinhoElement = document.getElementById('total-carrinho');
    if (totalCarrinhoElement) {
        totalCarrinhoElement.textContent = `R$ ${getCartTotal().toFixed(2).replace('.', ',')}`;
    }
    // Opcional: atualizar contador de itens no ícone do carrinho se houver um
    const cartCountElement = document.querySelector('.cart-count'); // Se você tiver um span para contagem de itens
    if (cartCountElement) {
        cartCountElement.textContent = getCartCount();
    }
}

// Função para adicionar produto ao carrinho (chamada por botões "Adicionar ao Carrinho")
function addToCart(productData) {
    const existingProductIndex = cart.findIndex(item => item.id === productData.id);

    if (existingProductIndex > -1) {
        cart[existingProductIndex].quantity += 1;
    } else {
        cart.push({
            ...productData,
            quantity: 1
        });
    }

    saveCartToStorage();
    updateCartHeaderDisplay(); // Atualiza o total no cabeçalho
    showCartNotification(`${productData.name} adicionado!`, 'success');

    // Se estiver na página do carrinho, renderiza novamente
    if (window.location.pathname.includes('carrinho.html')) {
        renderizarCarrinhoPage();
    }
}

// Função para remover produto do carrinho (chamada por botões de remoção)
function removeFromCart(productId) {
    const originalLength = cart.length;
    cart = cart.filter(item => item.id !== productId);

    if (cart.length < originalLength) {
        saveCartToStorage();
        updateCartHeaderDisplay(); // Atualiza o total no cabeçalho
        showCartNotification('Item removido.', 'info');

        // Se estiver na página do carrinho, renderiza novamente
        if (window.location.pathname.includes('carrinho.html')) {
            renderizarCarrinhoPage();
        }
    }
}

// Função para atualizar quantidade de um produto (chamada pelos controles +/-)
function updateQuantity(productId, newQuantity) {
    if (newQuantity < 1) { // Garante que a quantidade não seja menor que 1
        removeFromCart(productId); // Remove se a quantidade for 0 ou negativa
        return;
    }

    const productIndex = cart.findIndex(item => item.id === productId);
    if (productIndex > -1) {
        cart[productIndex].quantity = newQuantity;
        saveCartToStorage();
        updateCartHeaderDisplay(); // Atualiza o total no cabeçalho

        // Se estiver na página do carrinho, renderiza novamente
        if (window.location.pathname.includes('carrinho.html')) {
            renderizarCarrinhoPage();
        }
    }
}

// ====================================================================
// FUNÇÕES ESPECÍFICAS PARA A PÁGINA CARRINHO.HTML (renderização e totais)
// ====================================================================

/**
 * Renderiza os itens do carrinho na página carrinho.html
 * Esta é a função principal chamada na inicialização da página do carrinho.
 */
function renderizarCarrinhoPage() {
    const carrinhoItemsDiv = document.getElementById('carrinho-items');
    const carrinhoVazioDiv = document.getElementById('carrinho-vazio');
    const carrinhoContentDiv = document.querySelector('.carrinho-content');

    // Limpa os itens existentes na interface antes de renderizar novamente
    if (carrinhoItemsDiv) {
        carrinhoItemsDiv.innerHTML = '';
    }

    if (cart.length === 0) {
        // Se o carrinho estiver vazio
        if (carrinhoContentDiv) carrinhoContentDiv.style.display = 'none';
        if (carrinhoVazioDiv) carrinhoVazioDiv.style.display = 'flex'; // Exibe a mensagem de carrinho vazio
        updateCartHeaderDisplay(); // Garante que o cabeçalho mostre R$ 0,00
        return;
    } else {
        // Se houver itens
        if (carrinhoContentDiv) carrinhoContentDiv.style.display = 'flex';
        if (carrinhoVazioDiv) carrinhoVazioDiv.style.display = 'none'; // Esconde a mensagem de carrinho vazio
    }

    // Cria e insere o HTML para cada item do carrinho
    cart.forEach(item => {
        const itemCarrinhoDiv = document.createElement('div');
        itemCarrinhoDiv.classList.add('item-carrinho');
        itemCarrinhoDiv.setAttribute('data-produto-id', item.id); // Usamos 'data-produto-id' para evitar conflito
        itemCarrinhoDiv.setAttribute('data-preco-unitario', item.price); // Preço unitário original

        itemCarrinhoDiv.innerHTML = `
            <div class="item-imagem">
                ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: contain;">` : '📦'}
            </div>
            <div class="item-info">
                <h3>${item.name}</h3>
                <p>${item.description || ''}</p>
            </div>
            <div class="item-preco">R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}</div>
            <div class="quantidade-controls">
                <button class="quantidade-btn" onclick="diminuirQuantidadePage('${item.id}', this)">-</button>
                <input type="number" class="quantidade-input" value="${item.quantity}" min="1" onchange="atualizarItemPage('${item.id}', this)">
                <button class="quantidade-btn" onclick="aumentarQuantidadePage('${item.id}', this)">+</button>
            </div>
            <button class="remover-btn" onclick="removerItemPage('${item.id}', this)">
                <i class="fas fa-trash"></i>
            </button>
        `;
        if (carrinhoItemsDiv) {
            carrinhoItemsDiv.appendChild(itemCarrinhoDiv);
        }
    });

    atualizarResumoPage(); // Atualiza os totais na página do carrinho
    // Adicionar efeitos visuais aos cards (após renderização)
    const items = document.querySelectorAll('.item-carrinho');
    items.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.1}s`;
    });
}

/**
 * Aumenta a quantidade de um item na página do carrinho
 * @param {string} productId - ID do produto
 * @param {HTMLElement} btn - Botão de aumentar quantidade
 */
function aumentarQuantidadePage(productId, btn) {
    const input = btn.parentElement.querySelector('.quantidade-input');
    let currentQuantity = parseInt(input.value);
    input.value = currentQuantity + 1;
    updateQuantity(productId, currentQuantity + 1); // Atualiza o carrinho global
    atualizarResumoPage(); // Atualiza o resumo
}

/**
 * Diminui a quantidade de um item na página do carrinho
 * @param {string} productId - ID do produto
 * @param {HTMLElement} btn - Botão de diminuir quantidade
 */
function diminuirQuantidadePage(productId, btn) {
    const input = btn.parentElement.querySelector('.quantidade-input');
    let currentQuantity = parseInt(input.value);
    if (currentQuantity > 1) {
        input.value = currentQuantity - 1;
        updateQuantity(productId, currentQuantity - 1); // Atualiza o carrinho global
        atualizarResumoPage(); // Atualiza o resumo
    } else {
        // Se a quantidade for 1 e tentar diminuir, remover o item
        removerItemPage(productId, btn);
    }
}

/**
 * Atualiza o preço de um item específico na página do carrinho baseado na quantidade
 * (Chamado pelo 'onchange' do input, agora o updateQuantity já gerencia a lógica global)
 * @param {string} productId - ID do produto
 * @param {HTMLElement} input - Input da quantidade
 */
function atualizarItemPage(productId, input) {
    let newQuantity = parseInt(input.value);
    if (newQuantity < 1) {
        newQuantity = 1; // Garante que não vá abaixo de 1
        input.value = 1;
    }
    updateQuantity(productId, newQuantity); // Atualiza o carrinho global

    // Atualiza apenas o preço exibido para este item no DOM
    const itemElement = input.closest('.item-carrinho');
    if (itemElement) {
        const precoUnitario = parseFloat(itemElement.dataset.precoUnitario);
        const precoElement = itemElement.querySelector('.item-preco');
        if (precoElement) {
            precoElement.textContent = `R$ ${(precoUnitario * newQuantity).toFixed(2).replace('.', ',')}`;
            precoElement.style.transform = 'scale(1.1)';
            setTimeout(() => {
                precoElement.style.transform = 'scale(1)';
            }, 200);
        }
    }
    atualizarResumoPage(); // Atualiza o resumo geral
}

/**
 * Remove um item da página do carrinho com animação
 * @param {string} productId - ID do produto
 * @param {HTMLElement} btn - Botão de remover item
 */
function removerItemPage(productId, btn) {
    const itemElement = btn.closest('.item-carrinho');
    const nomeItem = itemElement ? itemElement.querySelector('.item-info h3').textContent : 'um item';

    if (confirm(`Deseja remover "${nomeItem}" do carrinho?`)) {
        if (itemElement) {
            // Aplicar animação de saída
            itemElement.style.animation = 'fadeOut 0.3s ease';
            itemElement.style.pointerEvents = 'none';

            setTimeout(() => {
                itemElement.remove();
                removeFromCart(productId); // Remove do carrinho global (localStorage)
                atualizarResumoPage(); // Recalcula totais
                // A função renderizarCarrinhoPage já lida com o estado de vazio
            }, 300);
        } else {
            // Fallback caso o elemento não seja encontrado, mas o item ainda possa ser removido
            removeFromCart(productId);
            atualizarResumoPage();
        }
        mostrarNotificacao(`${nomeItem} removido do carrinho`, 'info');
    }
}

/**
 * Atualiza o resumo do pedido com cálculos automáticos na página do carrinho
 */
function atualizarResumoPage() {
    const subtotal = getCartTotal(); // Obtém o subtotal do array 'cart'

    // Valores fixos (podem ser dinâmicos no futuro)
    const taxaEntregaElement = document.getElementById('taxa-entrega');
    const taxaEntrega = cart.length > 0 ? 5.00 : 0; // Taxa só se houver itens
    if (taxaEntregaElement) {
        taxaEntregaElement.textContent = `R$ ${taxaEntrega.toFixed(2).replace('.', ',')}`;
    }

    const descontoElement = document.getElementById('desconto');
    const descontoText = descontoElement ? descontoElement.textContent : '-R$ 0,00';
    // Pega o valor do desconto que já está na tela (aplicado por aplicarCupom)
    const descontoAtual = parseFloat(
        descontoText.replace('R$', '').replace('-', '').replace(',', '.')
    ) || 0;

    const total = Math.max(0, subtotal + taxaEntrega - descontoAtual);

    // Atualizar elementos na tela
    const subtotalEl = document.getElementById('subtotal');
    if (subtotalEl) subtotalEl.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;

    const totalFinalEl = document.getElementById('total-final');
    if (totalFinalEl) totalFinalEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;

    updateCartHeaderDisplay(); // Atualiza o total no cabeçalho também
}

/**
 * Aplica cupom de desconto na página do carrinho
 */
function aplicarCupom() {
    const cupomInput = document.getElementById('cupom');
    const cupom = cupomInput.value.trim().toLowerCase();
    const descontoElement = document.getElementById('desconto');

    // Lista de cupons válidos
    const cuponsValidos = {
        'desconto10': { valor: 10.00, descricao: 'R$ 10,00 de desconto' },
        'bemvindo': { valor: 15.00, descricao: 'R$ 15,00 de desconto' },
        'primeira': { valor: 20.00, descricao: 'R$ 20,00 de desconto (primeira compra)' },
        'frete': { valor: 5.00, descricao: 'Frete grátis!' } // Este deve ser tratado de forma diferente se realmente zerar o frete
    };

    if (cuponsValidos[cupom]) {
        const descontoInfo = cuponsValidos[cupom];
        descontoElement.textContent = `-R$ ${descontoInfo.valor.toFixed(2).replace('.', ',')}`;
        descontoElement.style.color = '#4CAF50';

        mostrarNotificacao(`Cupom aplicado: ${descontoInfo.descricao}`, 'success');
        cupomInput.value = '';
        cupomInput.disabled = true;

        // Adicionar botão para remover cupom (se ainda não existir)
        let removerCupomBtn = cupomInput.parentElement.querySelector('button[onclick="removerCupom()"]');
        if (!removerCupomBtn) {
            removerCupomBtn = document.createElement('button');
            removerCupomBtn.textContent = 'Remover';
            removerCupomBtn.style.cssText = `
                background: #ff6b6b;
                color: white;
                border: none;
                padding: 8px 15px;
                border-radius: 10px;
                cursor: pointer;
                margin-left: 10px;
            `;
            removerCupomBtn.onclick = removerCupom;
            cupomInput.parentElement.appendChild(removerCupomBtn);
        }

        atualizarResumoPage(); // Recalcula com o novo desconto
    } else if (cupom) {
        mostrarNotificacao('Cupom inválido. Tente: desconto10, bemvindo, primeira, frete', 'error');
        cupomInput.focus();
    } else {
        mostrarNotificacao('Digite um cupom válido', 'warning');
    }
}

/**
 * Remove cupom aplicado na página do carrinho
 */
function removerCupom() {
    const descontoElement = document.getElementById('desconto');
    const cupomInput = document.getElementById('cupom');

    descontoElement.textContent = '-R$ 0,00'; // Reseta o desconto visualmente
    descontoElement.style.color = '#666'; // Volta à cor padrão

    if (cupomInput) {
        cupomInput.disabled = false;
        cupomInput.placeholder = 'Digite o cupom';
    }

    // Remover botão de remover cupom
    const removerBtn = document.querySelector('button[onclick="removerCupom()"]');
    if (removerBtn) {
        removerBtn.remove();
    }

    atualizarResumoPage(); // Recalcula os totais sem o desconto
    mostrarNotificacao('Cupom removido.', 'info');
}

/**
 * Finaliza a compra na página do carrinho
 */
function finalizarCompra() {
    if (cart.length === 0) {
        mostrarNotificacao('Seu carrinho está vazio!', 'error');
        return;
    }

    const totalElement = document.getElementById('total-final');
    const total = totalElement ? totalElement.textContent : 'R$ 0,00';

    if (confirm(`Finalizar compra no valor de ${total}?`)) {
        mostrarNotificacao('Redirecionando para o pagamento...', 'success');

        const finalizarBtn = document.querySelector('.finalizar-btn');
        if (finalizarBtn) {
            finalizarBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
            finalizarBtn.disabled = true;
        }

        setTimeout(() => {
            alert('Compra finalizada com sucesso! Você receberá um email de confirmação.');
            // Limpa o carrinho após a finalização
            cart = [];
            saveCartToStorage();
            renderizarCarrinhoPage(); // Re-renderiza para mostrar o carrinho vazio
            updateCartHeaderDisplay(); // Atualiza o cabeçalho
            if (finalizarBtn) {
                finalizarBtn.innerHTML = '<i class="fas fa-credit-card"></i> Finalizar Compra';
                finalizarBtn.disabled = false;
            }
        }, 2000);
    }
}

// =========================
// SISTEMA DE BUSCA
// =========================
function setupSearch() {
    const searchInput = document.querySelector('.search-bar input');
    const searchButton = document.querySelector('.search-button');

    if (searchInput && searchButton) {
        // Busca ao clicar no botão
        searchButton.addEventListener('click', performSearch);

        // Busca ao pressionar Enter
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });

        // Busca em tempo real (opcional)
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                if (searchInput.value.length >= 3 || searchInput.value.length === 0) { // Mostra tudo se o campo estiver vazio
                    performSearch();
                }
            }, 500);
        });
    }
}

function performSearch() {
    const searchInput = document.querySelector('.search-bar input');
    const searchTerm = searchInput.value.toLowerCase().trim();

    if (searchTerm === '') {
        showAllProducts();
        return;
    }

    const products = document.querySelectorAll('.card-produto, .product-card');
    let foundProducts = 0;

    products.forEach(product => {
        const title = product.querySelector('.titulo, h3');
        const productName = title ? title.textContent.toLowerCase() : '';

        if (productName.includes(searchTerm)) {
            product.style.display = 'block';
            foundProducts++;
        } else {
            product.style.display = 'none';
        }
    });

    // Mostrar mensagem se nenhum produto foi encontrado
    if (foundProducts === 0) {
        showNoResultsMessage(searchTerm);
    } else {
        hideNoResultsMessage();
    }
}

function showAllProducts() {
    const products = document.querySelectorAll('.card-produto, .product-card');
    products.forEach(product => {
        product.style.display = 'block';
    });
    hideNoResultsMessage();
}

function showNoResultsMessage(searchTerm) {
    let noResultsMsg = document.querySelector('.no-results-message');

    if (!noResultsMsg) {
        noResultsMsg = document.createElement('div');
        noResultsMsg.className = 'no-results-message';
        noResultsMsg.style.cssText = `
            text-align: center;
            padding: 40px 20px;
            color: #666;
            font-size: 1.2rem;
            grid-column: 1 / -1;
        `;

        const productsGrid = document.querySelector('.products-grid');
        if (productsGrid) {
            productsGrid.appendChild(noResultsMsg);
        }
    }

    noResultsMsg.innerHTML = `
        <h3>Nenhum produto encontrado</h3>
        <p>Não encontramos produtos para "${searchTerm}"</p>
        <button onclick="showAllProducts()" class="cta-button" style="margin-top: 20px;">
            Ver Todos os Produtos
        </button>
    `;
}

function hideNoResultsMessage() {
    const noResultsMsg = document.querySelector('.no-results-message');
    if (noResultsMsg) {
        noResultsMsg.remove();
    }
}

// =========================
// BOTÕES DE PRODUTOS (Adicionar ao Carrinho)
// =========================
function setupProductButtons() {
    const addButtons = document.querySelectorAll('.btn-adicionar, .add-to-cart');

    addButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();

            const productCard = this.closest('.card-produto, .product-card');
            if (!productCard) return;

            // Extrair informações do produto
            const productData = extractProductData(productCard);

            if (productData) {
                addToCart(productData); // Usa a função global addToCart
                animateButton(this);
            }
        });
    });
}

function extractProductData(productCard) {
    const titleElement = productCard.querySelector('.titulo, h3');
    const priceElement = productCard.querySelector('.preco-novo, .product-price');
    const imageElement = productCard.querySelector('img');
    const descriptionElement = productCard.querySelector('.descricao-produto, p:not(.preco-antigo):not(.preco-novo)'); // Tentativa de pegar descrição

    if (!titleElement || !priceElement) {
        console.error('Dados do produto incompletos para o card:', productCard);
        return null;
    }

    const name = titleElement.textContent.trim();
    const priceText = priceElement.textContent.replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
    const price = parseFloat(priceText);
    const image = imageElement ? imageElement.src : '';
    const description = descriptionElement ? descriptionElement.textContent.trim() : '';

    // Gerar ID único baseado no nome do produto para consistência
    const id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    return {
        id,
        name,
        price,
        image,
        description // Inclui a descrição
    };
}

function animateButton(button) {
    const originalText = button.textContent;
    const originalBackground = button.style.background;
    const originalColor = button.style.color;

    button.textContent = 'Adicionado!';
    button.style.background = 'var(--success-green)';
    button.style.color = 'var(--white)';
    button.disabled = true;

    setTimeout(() => {
        button.textContent = originalText;
        button.style.background = originalBackground;
        button.style.color = originalColor;
        button.disabled = false;
    }, 1500);
}

// =========================
// FILTROS DE CATEGORIA (para página de produtos - Consolidado de filtros-categoria.js)
// =========================
function setupCategoryFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const products = document.querySelectorAll('.card-produto[data-category]');

    if (filterButtons.length === 0) return;

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');

            const category = this.getAttribute('data-category');

            products.forEach(product => {
                const productCategory = product.getAttribute('data-category');

                if (category === 'todos' || productCategory === category) {
                    product.style.display = 'block';
                    // Animação de entrada
                    product.style.animation = 'fadeIn 0.3s ease-in';
                } else {
                    product.style.display = 'none';
                }
            });

            // Scroll suave para os produtos
            const productsSection = document.getElementById('products-grid'); // Precisa que a div products-grid tenha o ID
            if (productsSection) {
                productsSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// =========================
// ANIMAÇÕES E EFEITOS VISUAIS (Consolidado)
// =========================

// Smooth scroll para links internos
function setupSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * Mostra notificações temporárias
 * @param {string} mensagem - Mensagem a ser exibida
 * @param {string} tipo - Tipo da notificação (success, error, warning, info)
 */
function showCartNotification(mensagem, tipo = 'info') {
    // Remover notificações existentes
    const existingNotifications = document.querySelectorAll('.cart-notification');
    existingNotifications.forEach(notif => notif.remove());

    // Criar nova notificação
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.textContent = mensagem;

    // Definir cor baseada no tipo
    const cores = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };

    notification.style.background = cores[tipo] || cores.info;

    // Adicionar ao DOM
    document.body.appendChild(notification);

    // Remover após 3 segundos
    setTimeout(() => {
        notification.classList.add('hide');
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}


// =========================
// EXPOSIÇÃO DE FUNÇÕES GLOBAIS (para uso inline no HTML)
// =========================
window.addToCart = addToCart;
window.removeFromCart = removeFromCart; // Ainda útil para o carrinho lateral/popup
window.updateQuantity = updateQuantity; // Ainda útil para o carrinho lateral/popup
window.clearCart = clearCart; // Se houver um botão "limpar tudo" no carrinho lateral/popup
window.showAllProducts = showAllProducts; // Para o botão de busca "Ver Todos"
window.aplicarCupom = aplicarCupom; // Para o botão na página do carrinho
window.removerCupom = removerCupom; // Para o botão na página do carrinho
window.finalizarCompra = finalizarCompra; // Para o botão na página do carrinho

// Funções de controle de quantidade para a página do carrinho (carrinho.html)
window.aumentarQuantidadePage = aumentarQuantidadePage;
window.diminuirQuantidadePage = diminuirQuantidadePage;
window.atualizarItemPage = atualizarItemPage;
window.removerItemPage = removerItemPage;

// Auto-save periódico do carrinho (opcional, pode ser removido se preferir salvar apenas nas ações)
setInterval(() => {
    if (cart.length > 0) {
        saveCartToStorage();
    }
}, 30000); // Salva a cada 30 segundos