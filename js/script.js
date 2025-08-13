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
let cart = [];
let cartCount = 0;
let cartTotal = 0;

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
    setupCart();
    setupSearch();
    setupProductButtons();
    setupCategoryFilters(); // Verifica a existência dos botões e do grid
    setupSmoothScroll(); // Adicionado para links internos
    // Carregar carrinho do localStorage (se disponível)
    loadCartFromStorage();
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
// SISTEMA DE CARRINHO
// =========================
function setupCart() {
    const cartIcon = document.querySelector('.cart-icon');
    const cart = document.getElementById('shoppingCart');
    const closeCartBtn = document.querySelector('.close-cart');
    const clearCartBtn = document.querySelector('.clear-cart-btn');
    const checkoutBtn = document.querySelector('.checkout-btn');
    
    // Abrir carrinho
    if (cartIcon) {
        cartIcon.addEventListener('click', function() {
            if (cart) {
                cart.classList.add('open');
                document.body.style.overflow = 'hidden'; // Previne scroll da página
            }
        });
    }
    
    // Fechar carrinho
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', function() {
            if (cart) {
                cart.classList.remove('open');
                document.body.style.overflow = 'auto';
            }
        });
    }
    
    // Limpar carrinho
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', function() {
            if (confirm('Tem certeza que deseja limpar o carrinho?')) {
                clearCart();
            }
        });
    }
    
    // Finalizar compra
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            if (cart.length === 0) {
                alert('Seu carrinho está vazio!');
                return;
            }
            
            // Aqui você pode implementar a lógica de checkout
            alert(`Finalizando compra de ${cartCount} itens no valor de R$ ${cartTotal.toFixed(2)}`);
            
            // Para demonstração, vamos limpar o carrinho após "finalizar"
            setTimeout(() => {
                clearCart();
                // Não fechar o carrinho automaticamente
            }, 1000);
        });
    }
    
    // Fechar carrinho ao clicar fora dele
    document.addEventListener('click', function(e) {
        if (cart && cart.classList.contains('open')) {
            const ignoreClasses = ['qty-btn', 'remove-btn'];
            const isQtyOrRemoveBtn = ignoreClasses.some(cls => e.target.classList.contains(cls));
            if (!cart.contains(e.target) && !cartIcon.contains(e.target) && !isQtyOrRemoveBtn) {
                cart.classList.remove('open');
                document.body.style.overflow = 'auto';
            }
        }
    });
}

// Função para adicionar produto ao carrinho
function addToCart(productData) {
    // Verificar se o produto já existe no carrinho
    const existingProduct = cart.find(item => item.id === productData.id);
    
    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({
            ...productData,
            quantity: 1
        });
    }
    
    updateCartDisplay();
    saveCartToStorage();
    
    // Feedback visual
    showCartNotification(`${productData.name} adicionado ao carrinho!`);
}

// Função para remover produto do carrinho
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartDisplay();
    saveCartToStorage();
}

// Função para atualizar quantidade de um produto
function updateQuantity(productId, newQuantity) {
    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }
    
    const product = cart.find(item => item.id === productId);
    if (product) {
        product.quantity = newQuantity;
        updateCartDisplay();
        saveCartToStorage();
    }
}

// Função para atualizar a exibição do carrinho
function updateCartDisplay() {
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartCountElement = document.querySelector('.cart-count');
    const cartTotalElement = document.querySelector('.cart-total');
    
    // Atualizar contador
    cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    if (cartCountElement) {
        cartCountElement.textContent = cartCount;
    }
    
    // Atualizar total
    cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    if (cartTotalElement) {
        cartTotalElement.textContent = `Total: R$ ${cartTotal.toFixed(2)}`;
    }
    
    // Atualizar itens do carrinho
    if (cartItemsContainer) {
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Seu carrinho está vazio.</p>';
        } else {
            cartItemsContainer.innerHTML = cart.map(item => `
                <div class="cart-item" data-id="${item.id}">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p>R$ ${item.price.toFixed(2)} x ${item.quantity}</p>
                    </div>
                    <div class="cart-item-controls">
                        <button onclick="updateQuantity('${item.id}', ${item.quantity - 1})" class="qty-btn">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button onclick="updateQuantity('${item.id}', ${item.quantity + 1})" class="qty-btn">+</button>
                        <button onclick="removeFromCart('${item.id}')" class="remove-btn">🗑️</button>
                    </div>
                </div>
            `).join('');
        }
    }
}

// Função para limpar o carrinho
function clearCart() {
    cart = [];
    cartCount = 0;
    cartTotal = 0;
    updateCartDisplay();
    saveCartToStorage();
}

// Função para salvar carrinho no localStorage
function saveCartToStorage() {
    try {
        localStorage.setItem('supermercado_cart', JSON.stringify(cart));
    } catch (e) {
        console.log('localStorage não disponível');
    }
}

// Função para carregar carrinho do localStorage
function loadCartFromStorage() {
    try {
        const savedCart = localStorage.getItem('supermercado_cart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
            updateCartDisplay();
        }
    } catch (e) {
        console.log('Erro ao carregar carrinho do localStorage');
    }
}

// Função para mostrar notificação do carrinho
function showCartNotification(message) {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.textContent = message;
    // O CSS para esta notificação é definido em style.css (cart-notification)
    // As animações slideInRight e slideOutRight também estão no style.css
    
    document.body.appendChild(notification);
    
    // Remover notificação após 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in forwards'; // 'forwards' para manter o estado final da animação
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
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
// BOTÕES DE PRODUTOS
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
                addToCart(productData);
                
                // Animação do botão
                animateButton(this);
            }
        });
    });
}

function extractProductData(productCard) {
    const titleElement = productCard.querySelector('.titulo, h3');
    const priceElement = productCard.querySelector('.preco-novo, .product-price');
    const imageElement = productCard.querySelector('img');
    
    if (!titleElement || !priceElement) {
        console.error('Dados do produto incompletos para o card:', productCard);
        return null;
    }
    
    const name = titleElement.textContent.trim();
    // Use .replace('.', '') antes de .replace(',', '.') para lidar com milhares e decimais
    const priceText = priceElement.textContent.replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
    const price = parseFloat(priceText);
    const image = imageElement ? imageElement.src : '';
    
    // Gerar ID único baseado no nome do produto
    const id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    return {
        id,
        name,
        price,
        image
    };
}

function animateButton(button) {
    const originalText = button.textContent;
    const originalBackground = button.style.background;
    const originalColor = button.style.color; // Captura a cor original do texto

    button.textContent = 'Adicionado!';
    button.style.background = 'var(--success-green)'; // Usa a variável CSS
    button.style.color = 'var(--white)'; // Assegura texto branco
    button.disabled = true;
    
    setTimeout(() => {
        button.textContent = originalText;
        button.style.background = originalBackground;
        button.style.color = originalColor; // Restaura a cor original
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

// =========================
// INICIALIZAÇÃO FINAL
// =========================

// Executar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // A função addAnimations não está definida neste script.
    // Se você tinha animações adicionais em outro JS, mova-as para cá
    // ou remova a chamada.
    // addAnimations(); 
    
    // Log de inicialização
    console.log('🛒 Supermercado Lopes - Sistema totalmente carregado!');
    console.log('📊 Carrinho:', cart);
    console.log('🔧 Funcionalidades ativas: Menu Mobile, Carrossel, Carrinho, Busca, Filtros');
});

// =========================
// FUNÇÕES UTILITÁRIAS
// =========================

// Função para formatar preço
function formatPrice(price) {
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
}

// Função para gerar ID único
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Função para debounce (útil para busca)
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Função para detectar se é dispositivo móvel (útil para lógica responsiva em JS)
function isMobile() {
    return window.innerWidth <= 768;
}

// Funções do Carrinho de Compras - Supermercado Lopes

/**
 * Aumenta a quantidade de um item no carrinho
 * @param {HTMLElement} btn - Botão de aumentar quantidade
 */
function aumentarQuantidade(btn) {
    const input = btn.parentElement.querySelector('.quantidade-input');
    input.value = parseInt(input.value) + 1;
    atualizarItem(input);
}

/**
 * Diminui a quantidade de um item no carrinho
 * @param {HTMLElement} btn - Botão de diminuir quantidade
 */
function diminuirQuantidade(btn) {
    const input = btn.parentElement.querySelector('.quantidade-input');
    if (parseInt(input.value) > 1) {
        input.value = parseInt(input.value) - 1;
        atualizarItem(input);
    }
}

/**
 * Atualiza o preço de um item específico baseado na quantidade
 * @param {HTMLElement} input - Input da quantidade
 */
function atualizarItem(input) {
    const item = input.closest('.item-carrinho');
    const preco = parseFloat(item.dataset.preco);
    const quantidade = parseInt(input.value);
    
    // Validar quantidade mínima
    if (quantidade < 1) {
        input.value = 1;
        return;
    }
    
    // Atualizar preço do item
    const precoElement = item.querySelector('.item-preco');
    const precoTotal = preco * quantidade;
    precoElement.textContent = `R$ ${precoTotal.toFixed(2).replace('.', ',')}`;
    
    // Atualizar resumo geral
    atualizarResumo();
    
    // Adicionar efeito visual
    precoElement.style.transform = 'scale(1.1)';
    setTimeout(() => {
        precoElement.style.transform = 'scale(1)';
    }, 200);
}

/**
 * Remove um item do carrinho com animação
 * @param {HTMLElement} btn - Botão de remover item
 */
function removerItem(btn) {
    const item = btn.closest('.item-carrinho');
    const nomeItem = item.querySelector('.item-info h3').textContent;
    
    // Confirmar remoção
    if (confirm(`Deseja remover "${nomeItem}" do carrinho?`)) {
        // Aplicar animação de saída
        item.style.animation = 'fadeOut 0.3s ease';
        item.style.pointerEvents = 'none';
        
        setTimeout(() => {
            item.remove();
            atualizarResumo();
            verificarCarrinhoVazio();
            mostrarNotificacao(`${nomeItem} removido do carrinho`, 'info');
        }, 300);
    }
}

/**
 * Atualiza o resumo do pedido com cálculos automáticos
 */
function atualizarResumo() {
    const items = document.querySelectorAll('.item-carrinho');
    let subtotal = 0;

    // Calcular subtotal
    items.forEach(item => {
        const preco = parseFloat(item.dataset.preco);
        const quantidade = parseInt(item.querySelector('.quantidade-input').value);
        subtotal += preco * quantidade;
    });

    // Valores fixos (podem ser dinâmicos no futuro)
    const taxaEntrega = items.length > 0 ? 5.00 : 0;
    const descontoAtual = parseFloat(
        document.getElementById('desconto').textContent
            .replace('R$', '')
            .replace('-', '')
            .replace(',', '.')
    ) || 0;
    
    const total = Math.max(0, subtotal + taxaEntrega - descontoAtual);

    // Atualizar elementos na tela
    document.getElementById('subtotal').textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    document.getElementById('taxa-entrega').textContent = `R$ ${taxaEntrega.toFixed(2).replace('.', ',')}`;
    document.getElementById('total-final').textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    document.getElementById('total-carrinho').textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

/**
 * Verifica se o carrinho está vazio e exibe mensagem apropriada
 */
function verificarCarrinhoVazio() {
    const items = document.querySelectorAll('.item-carrinho');
    const carrinhoContent = document.getElementById('carrinho-content');
    const carrinhoVazio = document.getElementById('carrinho-vazio');

    if (items.length === 0) {
        carrinhoContent.style.display = 'none';
        carrinhoVazio.style.display = 'block';
        document.getElementById('total-carrinho').textContent = 'R$ 0,00';
        
        // Animação de entrada para tela vazia
        carrinhoVazio.style.animation = 'slideIn 0.5s ease';
    }
}

/**
 * Aplica cupom de desconto
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
        'frete': { valor: 5.00, descricao: 'Frete grátis!' }
    };
    
    if (cuponsValidos[cupom]) {
        const desconto = cuponsValidos[cupom];
        descontoElement.textContent = `-R$ ${desconto.valor.toFixed(2).replace('.', ',')}`;
        descontoElement.style.color = '#4CAF50';
        
        mostrarNotificacao(`Cupom aplicado com sucesso! ${desconto.descricao}`, 'success');
        cupomInput.value = '';
        cupomInput.disabled = true;
        
        // Adicionar botão para remover cupom
        const removerCupomBtn = document.createElement('button');
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
        
        atualizarResumo();
    } else if (cupom) {
        mostrarNotificacao('Cupom inválido. Tente: desconto10, bemvindo, primeira, frete', 'error');
        cupomInput.focus();
    } else {
        mostrarNotificacao('Digite um cupom válido', 'warning');
    }
}

/**
 * Remove cupom aplicado
 */
function removerCupom() {
    const descontoElement = document.getElementById('desconto');
    const cupomInput = document.getElementById('cupom');
    
    descontoElement.textContent = '-R$ 5,00';
    descontoElement.style.color = '#4CAF50';
    
    cupomInput.disabled = false;
    cupomInput.placeholder = 'Digite o cupom';
    
    // Remover botão de remover cupom
    const removerBtn = cupomInput.parentElement.querySelector('button[onclick="removerCupom()"]');
    if (removerBtn) {
        removerBtn.remove();
    }
    
    atualizarResumo();
    mostrarNotificacao('Cupom removido com sucesso', 'info');
}

/**
 * Finaliza a compra
 */
function finalizarCompra() {
    const items = document.querySelectorAll('.item-carrinho');
    if (items.length === 0) {
        mostrarNotificacao('Seu carrinho está vazio!', 'error');
        return;
    }
    
    // Simular processo de finalização
    const totalElement = document.getElementById('total-final');
    const total = totalElement.textContent;
    
    if (confirm(`Finalizar compra no valor de ${total}?`)) {
        mostrarNotificacao('Redirecionando para o pagamento...', 'success');
        
        // Simular carregamento
        const finalizarBtn = document.querySelector('.finalizar-btn');
        finalizarBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
        finalizarBtn.disabled = true;
        
        setTimeout(() => {
            alert('Compra finalizada com sucesso! Você receberá um email de confirmação.');
            finalizarBtn.innerHTML = '<i class="fas fa-credit-card"></i> Finalizar Compra';
            finalizarBtn.disabled = false;
        }, 2000);
    }
}

/**
 * Mostra notificações temporárias
 * @param {string} mensagem - Mensagem a ser exibida
 * @param {string} tipo - Tipo da notificação (success, error, warning, info)
 */
function mostrarNotificacao(mensagem, tipo = 'info') {
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

/**
 * Adiciona eventos aos elementos quando a página carrega
 */
document.addEventListener('DOMContentLoaded', function() {
    // Atualizar resumo inicial
    atualizarResumo();
    
    // Adicionar eventos aos inputs de quantidade
    const quantidadeInputs = document.querySelectorAll('.quantidade-input');
    quantidadeInputs.forEach(input => {
        input.addEventListener('change', function() {
            if (parseInt(this.value) < 1) {
                this.value = 1;
            }
            atualizarItem(this);
        });
        
        // Impedir valores negativos
        input.addEventListener('keypress', function(e) {
            if (e.key === '-' || e.key === '+' || e.key === 'e') {
                e.preventDefault();
            }
        });
    });
    
    // Evento para aplicar cupom com Enter
    const cupomInput = document.getElementById('cupom');
    if (cupomInput) {
        cupomInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                aplicarCupom();
            }
        });
    }
    
    // Adicionar efeitos visuais aos cards
    const items = document.querySelectorAll('.item-carrinho');
    items.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.1}s`;
    });
    
    // Mostrar notificação de boas-vindas
    setTimeout(() => {
        mostrarNotificacao('Revise seus itens e finalize sua compra!', 'info');
    }, 500);
});

/**
 * Adiciona funcionalidade de busca (para o header)
 */
function setupSearch() {
    const searchButton = document.querySelector('.search-button');
    const searchInput = document.querySelector('.search-bar input');
    
    if (searchButton && searchInput) {
        searchButton.addEventListener('click', function() {
            const termo = searchInput.value.trim();
            if (termo) {
                mostrarNotificacao(`Buscando por: "${termo}"`, 'info');
                // Aqui você implementaria a lógica de busca real
            }
        });
        
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchButton.click();
            }
        });
    }
}

// Inicializar busca quando a página carregar
document.addEventListener('DOMContentLoaded', setupSearch);

/**
 * Funcionalidade para salvar carrinho no armazenamento local (simulado)
 */
function salvarCarrinho() {
    const items = [];
    document.querySelectorAll('.item-carrinho').forEach(item => {
        const produto = item.dataset.produto;
        const preco = parseFloat(item.dataset.preco);
        const quantidade = parseInt(item.querySelector('.quantidade-input').value);
        const nome = item.querySelector('.item-info h3').textContent;
        
        items.push({ produto, preco, quantidade, nome });
    });
    
    // Em um app real, você salvaria no localStorage ou enviaria para servidor
    console.log('Carrinho salvo:', items);
}

/**
 * Atualiza o carrinho periodicamente (auto-save)
 */
setInterval(() => {
    if (document.querySelectorAll('.item-carrinho').length > 0) {
        salvarCarrinho();
    }
}, 30000); // Salva a cada 30 segundos
// =========================
// EXPOSIÇÃO DE FUNÇÕES GLOBAIS
// =========================

// Tornar algumas funções disponíveis globalmente para uso inline no HTML (onclick, etc.)
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.clearCart = clearCart;
window.showAllProducts = showAllProducts;