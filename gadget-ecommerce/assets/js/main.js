document.addEventListener('DOMContentLoaded', () => {
    // Initialize AOS animation library
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true
    });
  
    // Mobile navigation toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (menuToggle) {
      menuToggle.addEventListener('click', () => {
        mainNav.classList.toggle('active');
        document.body.classList.toggle('nav-open');
      });
    }
  
    // Close mobile nav when clicking on links
    const navLinks = document.querySelectorAll('.main-nav a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (mainNav.classList.contains('active')) {
          mainNav.classList.remove('active');
          document.body.classList.remove('nav-open');
        }
      });
    });
  
    // Featured Products - Fetch and render dynamically
    fetchFeaturedProducts();
  
    // Search functionality 
    const searchIcon = document.querySelector('.search-icon');
    if (searchIcon) {
      searchIcon.addEventListener('click', toggleSearch);
    }
  
    // 3D tilt effect for product images
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
      card.addEventListener('mousemove', tiltCard);
      card.addEventListener('mouseleave', resetTilt);
    });
  
    // Newsletter form submit
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', handleNewsletterSubmit);
    }

    // Initialize scroll animations
    initScrollAnimations();
    
    // Initialize parallax effects
    initParallaxEffects();
    
    // Handle cart count updates
    updateCartCount();
});
  
// Fetch featured products from JSON file
function fetchFeaturedProducts() {
    const productGrid = document.querySelector('.product-grid');
    if (!productGrid) return;
  
    // Featured products data - in a real app, this would come from an API or database
    const featuredProducts = [
      {
        id: 'phone1',
        name: 'Iphones',
        category: 'Smartphones',
        price: 9.99,
        image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        rating: 4.8,
        badge: 'New'
      },
      {
        id: 'tablet1',
        name: 'UltraTab X9',
        category: 'Tablets',
        price: 5.99,
        image: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        rating: 4.5,
        badge: 'Bestseller'
      },
      {
        id: 'headphone1',
        name: 'SoundSphere Pro',
        category: 'Audio',
        price: 2.99,
        image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        rating: 4.7,
        badge: 'Sale'
      }
      
    ];
  
    // Clear existing products
    productGrid.innerHTML = '';
  
    // Add product cards to grid
    featuredProducts.forEach((product, index) => {
      const delay = (index + 1) * 100;
      const productHTML = createProductCard(product, delay);
      productGrid.innerHTML += productHTML;
    });
  
    // Reinitialize tilt effect after adding products
    setTimeout(() => {
      const productCards = document.querySelectorAll('.product-card');
      productCards.forEach(card => {
        card.addEventListener('mousemove', tiltCard);
        card.addEventListener('mouseleave', resetTilt);
      });
      
      // Initialize add to cart buttons
      initAddToCartButtons();
    }, 100);
}
  
function createProductCard(product, delay) {
    const badgeHTML = product.badge ? `<span class="product-badge ${product.badge.toLowerCase()}">${product.badge}</span>` : '';
    const ratingHTML = createRatingStars(product.rating);
    
    return `
      <div class="product-card" data-aos="fade-up" data-aos-delay="${delay}">
        ${badgeHTML}
        <div class="product-image">
          <img src="${product.image}" alt="${product.name}">
          <div class="product-actions">
            <button class="quick-view" data-id="${product.id}"><i class="fas fa-eye"></i></button>
            <button class="add-to-cart" data-id="${product.id}"><i class="fas fa-shopping-cart"></i></button>
            <button class="add-to-wishlist" data-id="${product.id}"><i class="fas fa-heart"></i></button>
          </div>
        </div>
        <div class="product-info">
          <span class="product-category">${product.category}</span>
          <h3 class="product-name">${product.name}</h3>
          <div class="product-rating">${ratingHTML}</div>
          <div class="product-price">$${product.price.toFixed(2)}</div>
        </div>
      </div>
    `;
}
  
function createRatingStars(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    let starsHTML = '';
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      starsHTML += '<i class="fas fa-star"></i>';
    }
    
    // Add half star if needed
    if (halfStar) {
      starsHTML += '<i class="fas fa-star-half-alt"></i>';
    }
    
    // Add empty stars
    for (let i = 0; i < emptyStars; i++) {
      starsHTML += '<i class="far fa-star"></i>';
    }
    
    return starsHTML;
}
  
function tiltCard(e) {
    const card = this;
    const cardRect = card.getBoundingClientRect();
    const cardWidth = cardRect.width;
    const cardHeight = cardRect.height;
    
    const centerX = cardRect.left + cardWidth / 2;
    const centerY = cardRect.top + cardHeight / 2;
    
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    const rotateY = 10 * (mouseX / (cardWidth / 2));
    const rotateX = -10 * (mouseY / (cardHeight / 2));
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
    card.style.boxShadow = `0 15px 35px rgba(0, 0, 0, 0.2)`;
}
  
function resetTilt() {
    this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    this.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.1)';
}
  
function toggleSearch() {
    const searchContainer = document.querySelector('.search-container') || createSearchContainer();
    searchContainer.classList.toggle('active');
    
    if (searchContainer.classList.contains('active')) {
      setTimeout(() => {
        document.querySelector('.search-input').focus();
      }, 300);
    }
}
  
function createSearchContainer() {
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    
    searchContainer.innerHTML = `
      <div class="search-wrapper">
        <input type="text" class="search-input" placeholder="Search for products...">
        <button class="search-button"><i class="fas fa-search"></i></button>
        <button class="search-close"><i class="fas fa-times"></i></button>
      </div>
    `;
    
    document.body.appendChild(searchContainer);
    
    const closeButton = searchContainer.querySelector('.search-close');
    closeButton.addEventListener('click', () => {
      searchContainer.classList.remove('active');
    });
    
    return searchContainer;
}
  
function handleNewsletterSubmit(e) {
    e.preventDefault();
    const email = this.querySelector('input[type="email"]').value;
    
    // Simulate API call
    showNotification('Thank you for subscribing!', 'success');
    this.reset();
}
  
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <p>${message}</p>
      <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    const closeButton = notification.querySelector('.notification-close');
    closeButton.addEventListener('click', () => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    });
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 5000);
}

function initAddToCartButtons() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            addToCart(productId);
        });
    });
}

function addToCart(productId) {
    // Get current cart from localStorage or create empty array
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Check if product already in cart
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            quantity: 1
        });
    }
    
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Show notification
    showNotification('Product added to cart!', 'success');
    
    // Update cart count
    updateCartCount();
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    
    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(element => {
        element.textContent = cartCount;
        
        if (cartCount > 0) {
            element.classList.add('has-items');
        } else {
            element.classList.remove('has-items');
        }
    });
}

function initScrollAnimations() {
    // Add scroll event listener
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Parallax elements
        const parallaxElements = document.querySelectorAll('.parallax');
        parallaxElements.forEach(element => {
            const speed = element.getAttribute('data-speed') || 0.5;
            element.style.transform = `translateY(${scrollTop * speed}px)`;
        });
        
        // Fade in elements as they come into view
        const fadeElements = document.querySelectorAll('.fade-in-element');
        fadeElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('visible');
            }
        });
    });
}

function initParallaxEffects() {
    const parallaxContainers = document.querySelectorAll('.parallax-container');
    
    parallaxContainers.forEach(container => {
        container.addEventListener('mousemove', function(e) {
            const elements = this.querySelectorAll('.parallax-element');
            
            const rect = this.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const mouseX = e.clientX - centerX;
            const mouseY = e.clientY - centerY;
            
            elements.forEach(element => {
                const depth = parseFloat(element.getAttribute('data-depth')) || 0.1;
                const moveX = mouseX * depth;
                const moveY = mouseY * depth;
                
                element.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
            });
        });
        
        container.addEventListener('mouseleave', function() {
            const elements = this.querySelectorAll('.parallax-element');
            elements.forEach(element => {
                element.style.transform = 'translate3d(0, 0, 0)';
                element.style.transition = 'transform 0.5s ease-out';
            });
        });
    });
}