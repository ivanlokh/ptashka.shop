// Main JavaScript for Ptashka.shop

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Initialize popovers
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });

    // Cart functionality
    initializeCart();
    
    // Search functionality
    initializeSearch();
    
    // Wishlist functionality
    initializeWishlist();
    
    // Product filters
    initializeFilters();
    
    // Image lazy loading
    initializeLazyLoading();
    
    // Back to top button
    initializeBackToTop();
    
    // Mobile optimizations
    initializeMobileOptimizations();
    
    // Smooth scroll
    initializeSmoothScroll();
});

// Cart Functions
function initializeCart() {
    // Add to cart buttons
    document.addEventListener('click', function(e) {
        if (e.target.matches('[data-action="add-to-cart"]') || e.target.closest('[data-action="add-to-cart"]')) {
            e.preventDefault();
            const button = e.target.closest('[data-action="add-to-cart"]');
            const productId = button.dataset.productId;
            const quantity = button.dataset.quantity || 1;
            addToCart(productId, quantity);
        }
    });

    // Update cart quantity
    document.addEventListener('change', function(e) {
        if (e.target.matches('[data-action="update-cart-quantity"]')) {
            const cartItemId = e.target.dataset.cartItemId;
            const quantity = e.target.value;
            updateCartQuantity(cartItemId, quantity);
        }
    });

    // Remove from cart
    document.addEventListener('click', function(e) {
        if (e.target.matches('[data-action="remove-from-cart"]') || e.target.closest('[data-action="remove-from-cart"]')) {
            e.preventDefault();
            const button = e.target.closest('[data-action="remove-from-cart"]');
            const cartItemId = button.dataset.cartItemId;
            removeFromCart(cartItemId);
        }
    });
}

function addToCart(productId, quantity = 1) {
    const button = document.querySelector(`[data-action="add-to-cart"][data-product-id="${productId}"]`);
    if (button) {
        button.disabled = true;
        button.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Додавання...';
    }

    fetch('/cart/add/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify({
            product_id: productId,
            quantity: quantity
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Товар додано до кошика', 'success');
            updateCartBadge();
            if (button) {
                button.innerHTML = '<i class="fas fa-check me-2"></i>Додано';
                setTimeout(() => {
                    button.disabled = false;
                    button.innerHTML = '<i class="fas fa-shopping-cart me-2"></i>Додати до кошика';
                }, 2000);
            }
        } else {
            showNotification(data.message || 'Помилка при додаванні товару', 'error');
            if (button) {
                button.disabled = false;
                button.innerHTML = '<i class="fas fa-shopping-cart me-2"></i>Додати до кошика';
            }
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Помилка при додаванні товару', 'error');
        if (button) {
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-shopping-cart me-2"></i>Додати до кошика';
        }
    });
}

function updateCartQuantity(cartItemId, quantity) {
    fetch('/cart/update/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify({
            cart_item_id: cartItemId,
            quantity: quantity
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            updateCartTotals(data.cart_total);
            showNotification('Кількість оновлено', 'success');
        } else {
            showNotification('Помилка при оновленні', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Помилка при оновленні', 'error');
    });
}

function removeFromCart(cartItemId) {
    if (!confirm('Ви впевнені, що хочете видалити цей товар з кошика?')) {
        return;
    }

    fetch('/cart/remove/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify({
            cart_item_id: cartItemId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Remove the item from DOM
            const cartItem = document.querySelector(`[data-cart-item-id="${cartItemId}"]`);
            if (cartItem) {
                cartItem.remove();
            }
            updateCartBadge();
            updateCartTotals(data.cart_total);
            showNotification('Товар видалено з кошика', 'success');
        } else {
            showNotification('Помилка при видаленні', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Помилка при видаленні', 'error');
    });
}

// Wishlist Functions
function initializeWishlist() {
    document.addEventListener('click', function(e) {
        if (e.target.matches('[data-action="toggle-wishlist"]') || e.target.closest('[data-action="toggle-wishlist"]')) {
            e.preventDefault();
            const button = e.target.closest('[data-action="toggle-wishlist"]');
            const productId = button.dataset.productId;
            toggleWishlist(productId, button);
        }
    });
}

function toggleWishlist(productId, button) {
    const isInWishlist = button.dataset.inWishlist === 'true';
    
    fetch('/wishlist/toggle/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify({
            product_id: productId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const icon = button.querySelector('i');
            if (data.in_wishlist) {
                icon.className = 'fas fa-heart text-danger';
                button.dataset.inWishlist = 'true';
                showNotification('Додано до списку бажаних', 'success');
            } else {
                icon.className = 'far fa-heart';
                button.dataset.inWishlist = 'false';
                showNotification('Видалено зі списку бажаних', 'info');
            }
        } else {
            showNotification('Помилка при оновленні списку бажаних', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Помилка при оновленні списку бажаних', 'error');
    });
}

// Search Functions
function initializeSearch() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                performSearch(this.value);
            }, 300);
        });
    }
}

function performSearch(query) {
    if (query.length < 2) return;
    
    fetch(`/api/products/search/?q=${encodeURIComponent(query)}`)
    .then(response => response.json())
    .then(data => {
        displaySearchResults(data.results);
    })
    .catch(error => {
        console.error('Search error:', error);
    });
}

function displaySearchResults(products) {
    // Implementation for search results dropdown
    // This would show a dropdown with search results
}

// Filter Functions
function initializeFilters() {
    const filterForm = document.getElementById('product-filters');
    if (filterForm) {
        filterForm.addEventListener('change', function() {
            applyFilters();
        });
    }
}

function applyFilters() {
    const form = document.getElementById('product-filters');
    const formData = new FormData(form);
    const params = new URLSearchParams(formData);
    
    // Update URL without page reload
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, '', newUrl);
    
    // Reload the page with new filters
    window.location.reload();
}

// Lazy Loading
function initializeLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// Utility Functions
function getCSRFToken() {
    return document.querySelector('[name=csrfmiddlewaretoken]').value;
}

function updateCartBadge() {
    fetch('/cart/count/')
    .then(response => response.json())
    .then(data => {
        const badge = document.querySelector('.cart-badge');
        if (badge) {
            badge.textContent = data.count;
            badge.style.display = data.count > 0 ? 'inline' : 'none';
        }
    })
    .catch(error => {
        console.error('Error updating cart badge:', error);
    });
}

function updateCartTotals(total) {
    const totalElement = document.querySelector('.cart-total');
    if (totalElement) {
        totalElement.textContent = `${total} ₴`;
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Back to top button
function initializeBackToTop() {
    const backToTopButton = document.getElementById('backToTop');
    if (!backToTopButton) return;
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.add('show');
        } else {
            backToTopButton.classList.remove('show');
        }
    });
    
    // Smooth scroll to top when clicked
    backToTopButton.addEventListener('click', function(e) {
        e.preventDefault();
        smoothScrollToTop();
    });
}

// Mobile optimizations
function initializeMobileOptimizations() {
    // Touch-friendly interactions
    addTouchSupport();
    
    // Mobile navigation
    optimizeMobileNavigation();
    
    // Mobile forms
    optimizeMobileForms();
    
    // Mobile images
    optimizeMobileImages();
    
    // Mobile performance
    optimizeMobilePerformance();
}

function addTouchSupport() {
    // Add touch class to body for touch devices
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        document.body.classList.add('touch-device');
    }
    
    // Improve touch targets
    const touchElements = document.querySelectorAll('.btn, .nav-link, .social-links a, .back-to-top');
    touchElements.forEach(element => {
        element.style.minHeight = '44px';
        element.style.minWidth = '44px';
    });
}

function optimizeMobileNavigation() {
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    
    if (navbarToggler && navbarCollapse) {
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navbarToggler.contains(e.target) && !navbarCollapse.contains(e.target)) {
                if (navbarCollapse.classList.contains('show')) {
                    navbarToggler.click();
                }
            }
        });
        
        // Close mobile menu when clicking on nav links
        const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (navbarCollapse.classList.contains('show')) {
                    navbarToggler.click();
                }
            });
        });
    }
}

function optimizeMobileForms() {
    // Improve form inputs on mobile
    const formInputs = document.querySelectorAll('input, textarea, select');
    formInputs.forEach(input => {
        // Prevent zoom on focus for iOS
        if (input.type === 'text' || input.type === 'email' || input.type === 'tel' || input.type === 'url') {
            input.addEventListener('focus', function() {
                if (window.innerWidth <= 768) {
                    document.querySelector('meta[name="viewport"]').setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
                }
            });
            
            input.addEventListener('blur', function() {
                if (window.innerWidth <= 768) {
                    document.querySelector('meta[name="viewport"]').setAttribute('content', 'width=device-width, initial-scale=1.0');
                }
            });
        }
    });
}

function optimizeMobileImages() {
    // Lazy load images with intersection observer
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                img.classList.add('loaded');
                imageObserver.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px 0px',
        threshold: 0.01
    });

    images.forEach(img => imageObserver.observe(img));
}

function optimizeMobilePerformance() {
    // Debounce scroll events for better performance
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        scrollTimeout = setTimeout(function() {
            // Handle scroll events here
            handleScroll();
        }, 10);
    });
    
    // Optimize resize events
    let resizeTimeout;
    window.addEventListener('resize', function() {
        if (resizeTimeout) {
            clearTimeout(resizeTimeout);
        }
        resizeTimeout = setTimeout(function() {
            handleResize();
        }, 250);
    });
}

function handleScroll() {
    // Back to top button visibility
    const backToTopButton = document.getElementById('backToTop');
    if (backToTopButton) {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.add('show');
        } else {
            backToTopButton.classList.remove('show');
        }
    }
}

function handleResize() {
    // Update mobile-specific elements on resize
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        // Mobile-specific optimizations
        document.body.classList.add('mobile-view');
        document.body.classList.remove('desktop-view');
    } else {
        // Desktop-specific optimizations
        document.body.classList.add('desktop-view');
        document.body.classList.remove('mobile-view');
    }
}

// Smooth scroll functions
function smoothScrollToTop() {
    const startPosition = window.pageYOffset;
    const startTime = performance.now();
    const duration = 800; // 800ms duration
    
    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    }
    
    function animation(currentTime) {
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        const ease = easeInOutCubic(progress);
        
        window.scrollTo(0, startPosition * (1 - ease));
        
        if (timeElapsed < duration) {
            requestAnimationFrame(animation);
        }
    }
    
    requestAnimationFrame(animation);
}

function smoothScrollToElement(element, offset = 80) {
    const elementPosition = element.offsetTop - offset;
    const startPosition = window.pageYOffset;
    const startTime = performance.now();
    const duration = 600; // 600ms duration
    
    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    }
    
    function animation(currentTime) {
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        const ease = easeInOutCubic(progress);
        
        const currentPosition = startPosition + (elementPosition - startPosition) * ease;
        window.scrollTo(0, currentPosition);
        
        if (timeElapsed < duration) {
            requestAnimationFrame(animation);
        }
    }
    
    requestAnimationFrame(animation);
}

function smoothScrollToPosition(position, offset = 0) {
    const targetPosition = position - offset;
    const startPosition = window.pageYOffset;
    const startTime = performance.now();
    const duration = 600; // 600ms duration
    
    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    }
    
    function animation(currentTime) {
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        const ease = easeInOutCubic(progress);
        
        const currentPosition = startPosition + (targetPosition - startPosition) * ease;
        window.scrollTo(0, currentPosition);
        
        if (timeElapsed < duration) {
            requestAnimationFrame(animation);
        }
    }
    
    requestAnimationFrame(animation);
}

// Initialize smooth scroll for anchor links
function initializeSmoothScroll() {
    // Handle anchor links
    document.addEventListener('click', function(e) {
        const link = e.target.closest('a[href^="#"]');
        if (link) {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                smoothScrollToElement(targetElement);
            }
        }
    });
    
    // Handle back to top button
    const backToTopButton = document.getElementById('backToTop');
    if (backToTopButton) {
        backToTopButton.addEventListener('click', function(e) {
            e.preventDefault();
            smoothScrollToTop();
        });
    }
    
    // Handle navigation links
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                smoothScrollToElement(targetElement);
            }
        });
    });
}

