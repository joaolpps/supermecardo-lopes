// =========================
// SUPERMERCADO LOPES - SCRIPT ÚNICO
// =========================

// =========================
// PREÇOS GLOBAIS DOS PRODUTOS
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
    }
    // Adicione outros produtos conforme necessário
};

// =========================
// SCRIPT PARA PREENCHER PREÇOS NOS CARDS
// =========================
document.addEventListener('DOMContentLoaded', function() {
    // Mapeamento entre nome do produto (alt da imagem) e chave do objeto global
    const mapaProdutos = {
        'Café Pilão': 'cafe_pilao',
        'Heineken Long Neck': 'cerveja_heineken',
        'Sabonete Dove': 'sabonete_dove',
        'Cerveja Amstel Lata 350ml': 'cerveja_amstel',
        'Arroz Tipo 1': 'arroz_camil',
        'Leite Integral': 'leite_longa_vida',
        'Detergente Ypê': 'detergente_ype'
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
        if (precoAntigoEl) precoAntigoEl.textContent = `R$ ${precos.antigo.toFixed(2).replace('.', ',')}`;
        if (precoNovoEl) precoNovoEl.textContent = `R$ ${precos.novo.toFixed(2).replace('.', ',')}`;
    });
});

// =========================
// POPUP DE LOGIN
// =========================
const loginPopup = document.getElementById('login-popup');
const openLoginPopup = document.getElementById('openLoginPopup');
const closeLoginPopup = document.getElementById('closeLoginPopup');

if (openLoginPopup && loginPopup && closeLoginPopup) {
    openLoginPopup.addEventListener('click', function(e) {
        e.preventDefault();
        loginPopup.style.display = 'flex';
    });

    closeLoginPopup.addEventListener('click', function() {
        loginPopup.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target === loginPopup) {
            loginPopup.style.display = 'none';
        }
    });
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
    setupCarousel();
    setupCart();
    setupSearch();
    setupProductButtons();
    setupCategoryFilters();
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
// CARROSSEL DE BANNERS
// =========================
function setupCarousel() {
    const carouselItems = document.querySelectorAll('.carousel-item');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    
    if (carouselItems.length === 0) return;
    
    let currentSlide = 0;
    const totalSlides = carouselItems.length;
    
    // Função para mostrar slide
    function showSlide(index) {
        carouselItems.forEach((item, i) => {
            item.classList.remove('active');
            if (i === index) {
                item.classList.add('active');
            }
        });
    }
    
    // Próximo slide
    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        showSlide(currentSlide);
    }
    
    // Slide anterior
    function prevSlide() {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        showSlide(currentSlide);
    }
    
    // Event listeners para botões
    if (nextBtn) {
        nextBtn.addEventListener('click', nextSlide);
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', prevSlide);
    }
    
    // Auto-play do carrossel
    setInterval(nextSlide, 5000); // Muda slide a cada 5 segundos
    
    // Suporte a touch/swipe em dispositivos móveis
    let startX = 0;
    let endX = 0;
    
    const carousel = document.querySelector('.hero-carousel');
    if (carousel) {
        carousel.addEventListener('touchstart', function(e) {
            startX = e.touches[0].clientX;
        });
        
        carousel.addEventListener('touchend', function(e) {
            endX = e.changedTouches[0].clientX;
            handleSwipe();
        });
        
        function handleSwipe() {
            const swipeThreshold = 50;
            const diff = startX - endX;
            
            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    nextSlide(); // Swipe left - próximo slide
                } else {
                    prevSlide(); // Swipe right - slide anterior
                }
            }
        }
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
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 9999;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // Remover notificação após 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
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
                if (searchInput.value.length >= 3) {
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
        console.error('Dados do produto incompletos');
        return null;
    }
    
    const name = titleElement.textContent.trim();
    const priceText = priceElement.textContent.replace('R$', '').replace(',', '.').trim();
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
    
    button.textContent = 'Adicionado!';
    button.style.background = '#28a745';
    button.disabled = true;
    
    setTimeout(() => {
        button.textContent = originalText;
        button.style.background = '';
        button.disabled = false;
    }, 1500);
}

// =========================
// FILTROS DE CATEGORIA (para página de produtos)
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
            const productsSection = document.getElementById('products-grid');
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
// ANIMAÇÕES E EFEITOS VISUAIS
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
    addAnimations();
    setupSmoothScroll();
    
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

// Função para detectar se é dispositivo móvel
function isMobile() {
    return window.innerWidth <= 768;
}

// =========================
// EXPOSIÇÃO DE FUNÇÕES GLOBAIS
// =========================

// Tornar algumas funções disponíveis globalmente para uso inline
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.clearCart = clearCart;
window.showAllProducts = showAllProducts;