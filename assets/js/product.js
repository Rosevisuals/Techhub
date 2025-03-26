document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS (Animate on Scroll)
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        mirror: false
    });

    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
            document.body.classList.toggle('nav-open');
        });
    }
    
    // Initialize category page functionality
    initCategoryPage();
    initPriceSlider();
    initViewToggle();
    initFilterToggle();
    initSorting();
    initFilters();
    loadProducts();
    initRecentlyViewed();
});

function loadCartSummary() {
    // Get cart data from localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartSummary = document.getElementById('cart-summary');
    const cartCountElement = document.querySelector('.cart-count');
    
    // Get product data from product.js
    const allProducts = typeof generateProducts === 'function' ? generateProducts() : [];
    
    // Update cart count in header
    if (cartCountElement) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = totalItems;
        cartCountElement.classList.toggle('has-items', totalItems > 0);
    }
    
    if (cart.length === 0) {
        cartSummary.innerHTML = '<div class="empty-cart" data-aos="fade-in">' +
            '<i class="fas fa-shopping-cart" style="font-size: 3rem; color: #ddd; margin-bottom: 1rem;"></i>' +
            '<p>Your cart is empty.</p>' +
            '<a href="product.html">Continue shopping</a></div>';
        updateTotals(0, 0, 0, 0);
        return;
    }
    
    let subtotal = 0;
    let html = '<ul class="cart-summary-items">';
    
    cart.forEach((item, index) => {
        // Find complete product data from product.js
        const productData = allProducts.find(p => p.id.toString() === item.id.toString()) || item;
        
        // Use product data from product.js if available, otherwise use cart item data
        const productName = productData.name || item.name;
        const productImage = productData.image || item.image;
        const productPrice = item.price || productData.price;
        
        const itemTotal = productPrice * item.quantity;
        subtotal += itemTotal;
        
        html += `
            <li class="summary-item" data-aos="fade-up" data-aos-delay="${100 + (index * 50)}">
                <div class="item-image">
                    <img src="${productImage}" alt="${productName}">
                </div>
                <div class="item-details">
                    <h4>${productName}</h4>
                    <div class="item-meta">
                        ${item.color ? `<span>Color: ${item.color}</span>` : ''}
                        ${item.storage ? `<span>Storage: ${item.storage}</span>` : ''}
                        ${productData.category ? `<span>Category: ${productData.category}</span>` : ''}
                    </div>
                    <div class="item-price">
                        <div class="item-quantity">
                            <button type="button" class="decrease-qty" data-index="${index}">-</button>
                            <input type="number" min="1" max="99" value="${item.quantity}" data-index="${index}">
                            <button type="button" class="increase-qty" data-index="${index}">+</button>
                        </div>
                        <div>
                            <span>$${productPrice.toFixed(2)} × ${item.quantity}</span>
                            <strong>$${itemTotal.toFixed(2)}</strong>
                        </div>
                    </div>
                </div>
                <button type="button" class="remove-item" data-index="${index}" title="Remove item">
                    <i class="fas fa-times"></i>
                </button>
            </li>
        `;
    });
    
    html += '</ul>';
    cartSummary.innerHTML = html;
    
    // Calculate shipping, tax, and total
    const shipping = subtotal > 100 ? 0 : 10;
    const tax = subtotal * 0.07; // Assume 7% tax rate
    const total = subtotal + shipping + tax;
    
    updateTotals(subtotal, shipping, tax, total);
    
    // Add event listeners to quantity buttons and remove buttons
    const decreaseButtons = document.querySelectorAll('.decrease-qty');
    const increaseButtons = document.querySelectorAll('.increase-qty');
    const quantityInputs = document.querySelectorAll('.item-quantity input');
    const removeButtons = document.querySelectorAll('.remove-item');
    
    decreaseButtons.forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            if (cart[index].quantity > 1) {
                cart[index].quantity--;
                localStorage.setItem('cart', JSON.stringify(cart));
                loadCartSummary(); // Reload cart summary with updated quantities
            }
        });
    });
    
    increaseButtons.forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            if (cart[index].quantity < 99) {
                cart[index].quantity++;
                localStorage.setItem('cart', JSON.stringify(cart));
                loadCartSummary(); // Reload cart summary with updated quantities
            }
        });
    });
    
    quantityInputs.forEach(input => {
        input.addEventListener('change', function() {
            const index = parseInt(this.dataset.index);
            let value = parseInt(this.value);
            
            // Ensure value is within valid range
            if (isNaN(value) || value < 1) value = 1;
            if (value > 99) value = 99;
            
            cart[index].quantity = value;
            localStorage.setItem('cart', JSON.stringify(cart));
            loadCartSummary(); // Reload cart summary with updated quantities
        });
    });
    
    removeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            
            // Add a fade-out animation before removing
            const item = this.closest('.summary-item');
            item.style.opacity = '0';
            item.style.transform = 'translateX(20px)';
            
            setTimeout(() => {
                cart.splice(index, 1);
                localStorage.setItem('cart', JSON.stringify(cart));
                loadCartSummary(); // Reload cart summary with updated cart
            }, 300);
        });
    });
    
    // Refresh AOS for dynamically added elements
    setTimeout(() => {
        AOS.refresh();
    }, 100);
}
// Category page initialization
function initCategoryPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    
    if (category) {
        const categoryTitle = document.getElementById('category-title');
        if (categoryTitle) {
            categoryTitle.textContent = category.charAt(0).toUpperCase() + category.slice(1);
            const categoryCheckbox = document.querySelector(`input[name="category"][value="${category}"]`);
            if (categoryCheckbox) {
                categoryCheckbox.checked = true;
            }
        }
    }
}

// Initialize price range slider
function initPriceSlider() {
    const priceSlider = document.getElementById('price-slider');
    if (!priceSlider) return;
    
    const minInput = document.getElementById('price-min');
    const maxInput = document.getElementById('price-max');
    
    noUiSlider.create(priceSlider, {
        start: [0, 2000],
        connect: true,
        step: 10,
        range: {
            'min': 0,
            'max': 2000
        },
        format: {
            to: function(value) {
                return Math.round(value);
            },
            from: function(value) {
                return Number(value);
            }
        }
    });
    
    priceSlider.noUiSlider.on('update', function(values, handle) {
        const value = values[handle];
        if (handle === 0) {
            minInput.value = value;
        } else {
            maxInput.value = value;
        }
        loadProducts(); // Auto-refresh on slider change
    });
    
    minInput.addEventListener('change', function() {
        priceSlider.noUiSlider.set([this.value, null]);
    });
    
    maxInput.addEventListener('change', function() {
        priceSlider.noUiSlider.set([null, this.value]);
    });
}

// Initialize view toggle (grid/list)
function initViewToggle() {
    const viewButtons = document.querySelectorAll('.view-btn');
    const productsContainer = document.getElementById('products-grid');
    
    if (!viewButtons.length || !productsContainer) return;
    
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const view = this.getAttribute('data-view');
            viewButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            if (view === 'grid') {
                productsContainer.classList.remove('products-list');
                productsContainer.classList.add('products-grid');
            } else {
                productsContainer.classList.remove('products-grid');
                productsContainer.classList.add('products-list');
            }
            loadProducts(); // Refresh to apply view change
        });
    });
}

// Initialize filter toggle for mobile
function initFilterToggle() {
    const filterToggle = document.getElementById('filter-toggle');
    const filters = document.getElementById('product-filters');
    
    if (!filterToggle || !filters) return;
    
    filterToggle.addEventListener('click', function() {
        filters.classList.toggle('active');
    });
}

// Initialize sorting functionality
function initSorting() {
    const sortSelect = document.getElementById('sort-by');
    if (!sortSelect) return;
    
    sortSelect.addEventListener('change', function() {
        loadProducts();
    });
}

// Initialize filter functionality
function initFilters() {
    const filterInputs = document.querySelectorAll('.filter-list input');
    const clearFiltersBtn = document.querySelectorAll('.clear-filters-btn');
    
    // Auto-refresh on checkbox change
    filterInputs.forEach(input => {
        input.addEventListener('change', function() {
            loadProducts();
        });
    });
    
    if (clearFiltersBtn.length) {
        clearFiltersBtn.forEach(btn => {
            btn.addEventListener('click', function() {
                filterInputs.forEach(input => {
                    input.checked = false;
                });
                
                const priceSlider = document.getElementById('price-slider');
                if (priceSlider && priceSlider.noUiSlider) {
                    priceSlider.noUiSlider.set([0, 2000]);
                }
                
                loadProducts();
            });
        });
    }
    
    const viewMoreBtns = document.querySelectorAll('.view-more-btn');
    viewMoreBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const filterList = this.previousElementSibling;
            filterList.classList.toggle('expanded');
            this.textContent = filterList.classList.contains('expanded') ? '- View Less' : '+ View More';
        });
    });
}

// Load products based on selected filters and sorting
function loadProducts(page = 1) {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;

    const sortBy = document.getElementById('sort-by')?.value || 'featured';
    const categoryFilters = getCheckedValues('category');
    const brandFilters = getCheckedValues('brand');
    const statusFilters = getCheckedValues('status');
    const ratingFilter = document.querySelector('input[name="rating"]:checked')?.value;
    
    let minPrice = 0;
    let maxPrice = 2000;
    const priceSlider = document.getElementById('price-slider');
    if (priceSlider && priceSlider.noUiSlider) {
        const priceValues = priceSlider.noUiSlider.get();
        minPrice = parseInt(priceValues[0]);
        maxPrice = parseInt(priceValues[1]);
    }
    
    productsGrid.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i></div>';
    
    setTimeout(() => {
        const products = generateProducts();
        let filteredProducts = products.filter(product => {
            if (product.price < minPrice || product.price > maxPrice) return false;
            if (categoryFilters.length > 0 && !categoryFilters.includes(product.category.toLowerCase())) return false;
            if (brandFilters.length > 0 && !brandFilters.includes(product.brand.toLowerCase())) return false;
            if (statusFilters.length > 0) {
                if (statusFilters.includes('in-stock') && !product.inStock) return false;
                if (statusFilters.includes('on-sale') && !product.onSale) return false;
                if (statusFilters.includes('new-arrival') && !product.isNew) return false;
            }
            if (ratingFilter) {
                const minRating = parseInt(ratingFilter.split('-')[0]);
                if (product.rating < minRating) return false;
            }
            return true;
        });
        
        filteredProducts = sortProducts(filteredProducts, sortBy);
        
        // Pagination logic
        const itemsPerPage = 8;
        const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
        
        const productsTotal = document.getElementById('products-total');
        if (productsTotal) {
            productsTotal.textContent = `${filteredProducts.length} Products`;
        }
        
        updateActiveFilters(categoryFilters, brandFilters, statusFilters, minPrice, maxPrice);
        renderProducts(paginatedProducts);
        initPagination(totalPages, page);
    }, 500);
}

// Sort products based on selected option
function sortProducts(products, sortBy) {
    switch (sortBy) {
        case 'price-low':
            return products.sort((a, b) => a.price - b.price);
        case 'price-high':
            return products.sort((a, b) => b.price - a.price);
        case 'newest':
            return products.sort((a, b) => new Date(b.date) - new Date(a.date));
        case 'rating':
            return products.sort((a, b) => b.rating - a.rating);
        case 'popularity':
            return products.sort((a, b) => b.popularity - a.popularity);
        default:
            return products.sort((a, b) => b.featured - a.featured);
    }
}

// Utility functions
function getCheckedValues(name) {
    return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`))
        .map(input => input.value.toLowerCase());
}

function generateProducts() {
    return [
        {
            id: 1,
            name: "iPhone 14 Pro",
            category: "smartphones",
            brand: "apple",
            price: 9.99,
            originalPrice: 1099.99,
            rating: 4.8,
            reviewCount: 156,
            inStock: true,
            onSale: true,
            isNew: true,
            isBestseller: false,
            featured: true,
            popularity: 95,
            date: "2023-09-15",
            image: "https://smartrendz.ug/storage/product-images/0606b9b6-fdb2-484a-8568-60fe4566626f-300x300.jpeg",
            description: "Latest iPhone with A16 Bionic chip"
        },
        {
            id: 2,
            name: "Galaxy Buds Pro",
            category: "audio",
            brand: "samsung",
            price: 14.99,
            rating: 4.5,
            reviewCount: 89,
            inStock: true,
            onSale: false,
            isNew: false,
            isBestseller: true,
            featured: true,
            popularity: 85,
            date: "2023-06-20",
            image: "https://smartrendz.ug/storage/product-images/samsung-galaxy-buds-pro-2-lifestyle-image-300x300.webp",
            description: "Premium wireless earbuds"
        },
        // ... (other products remain the same as in your provided code)
        {
            id: 3,
            name: "MacBook Air M2",
            category: "laptops",
            brand: "apple",
            price: 1199.99,
            originalPrice: 1299.99,
            rating: 4.9,
            reviewCount: 128,
            inStock: true,
            onSale: true,
            isNew: true,
            isBestseller: false,
            featured: true,
            popularity: 92,
            date: "2023-08-10",
            image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-air-midnight-select-20220606?wid=300&hei=300&fmt=jpeg&qlt=95&.v=1653084303665",
            description: "Sleek and powerful laptop with M2 chip"
        },
        {
            id: 4,
            name: "Sony WH-1000XM5",
            category: "audio",
            brand: "sony",
            price: 349.99,
            originalPrice: 399.99,
            rating: 4.7,
            reviewCount: 72,
            inStock: true,
            onSale: true,
            isNew: false,
            isBestseller: true,
            featured: true,
            popularity: 90,
            date: "2023-05-12",
            image: "https://m.media-amazon.com/images/I/61+btxzpfDL._AC_UF1000,1000_QL80_.jpg",
            description: "Industry-leading noise cancelling headphones"
        },
        {
            id: 5,
            name: "Samsung Galaxy S23",
            category: "smartphones",
            brand: "samsung",
            price: 799.99,
            rating: 4.6,
            reviewCount: 103,
            inStock: true,
            onSale: false,
            isNew: true,
            isBestseller: false,
            featured: true,
            popularity: 88,
            date: "2023-07-20",
            image: "https://smartrendz.ug/storage/product-images/324-300x300.webp",
            description: "Powerful Android smartphone with advanced camera system"
        },
        {
            id: 6,
            name: "iPad Air",
            category: "tablets",
            brand: "apple",
            price: 599.99,
            rating: 4.8,
            reviewCount: 86,
            inStock: true,
            onSale: false,
            isNew: false,
            isBestseller: true,
            featured: true,
            popularity: 87,
            date: "2022-12-05",
            image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-air-select-wifi-purple-202203?wid=300&hei=300&fmt=jpeg&qlt=95&.v=1645066730451",
            description: "Versatile tablet with powerful performance"
        },
        {
            id: 7,
            name: "Dell XPS 13",
            category: "laptops",
            brand: "dell",
            price: 1299.99,
            originalPrice: 1399.99,
            rating: 4.7,
            reviewCount: 65,
            inStock: true,
            onSale: true,
            isNew: false,
            isBestseller: false,
            featured: true,
            popularity: 86,
            date: "2023-04-18",
            image: "https://ug.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/25/4657342/1.jpg?5176",
            description: "Premium ultrabook with stunning InfinityEdge display"
        },
        {
            id: 8,
            name: "Apple Watch Series 8",
            category: "smartwatches",
            brand: "apple",
            price: 399.99,
            rating: 4.6,
            reviewCount: 92,
            inStock: true,
            onSale: false,
            isNew: true,
            isBestseller: true,
            featured: true,
            popularity: 89,
            date: "2023-09-01",
            image: "https://smartrendz.ug/storage/product-images/8-s-300x300.png",
            description: "Advanced health features and fitness tracking"
        },
        {
            id: 9,
            name: "Bose QuietComfort Earbuds",
            category: "audio",
            brand: "bose",
            price: 279.99,
            originalPrice: 299.99,
            rating: 4.5,
            reviewCount: 58,
            inStock: true,
            onSale: true,
            isNew: false,
            isBestseller: false,
            featured: false,
            popularity: 82,
            date: "2023-03-14",
            image: "https://assets.bose.com/content/dam/cloudassets/Bose_DAM/Web/consumer_electronics/global/products/headphones/qc_earbuds/product_silo_images/QCE_PDP_Ecom-Gallery-B03.png/jcr:content/renditions/cq5dam.web.300.300.png",
            description: "Premium noise cancelling earbuds with comfortable fit"
        },
        {
            id: 10,
            name: "Google Pixel 7",
            category: "smartphones",
            brand: "google",
            price: 599.99,
            rating: 4.6,
            reviewCount: 76,
            inStock: true,
            onSale: false,
            isNew: false,
            isBestseller: true,
            featured: true,
            popularity: 84,
            date: "2023-01-25",
            image: "https://smartrendz.ug/storage/product-images/download-2024-04-25t102825862-300x300.jpeg",
            description: "Pure Android experience with exceptional camera"
        },
        {
            id: 11,
            name: "Samsung Galaxy Tab S8",
            category: "tablets",
            brand: "samsung",
            price: 699.99,
            originalPrice: 749.99,
            rating: 4.7,
            reviewCount: 63,
            inStock: true,
            onSale: true,
            isNew: false,
            isBestseller: false,
            featured: true,
            popularity: 83,
            date: "2023-02-10",
            image: "https://images.samsung.com/is/image/samsung/p6pim/uk/sm-x700nzaaeub/gallery/uk-galaxy-tab-s8-wifi-x700-sm-x700nzaaeub-thumb-530960422?imwidth=300",
            description: "Powerful Android tablet with S Pen included"
        },
        {
            id: 12,
            name: "Microsoft Surface Laptop 5",
            category: "laptops",
            brand: "microsoft",
            price: 999.99,
            rating: 4.5,
            reviewCount: 48,
            inStock: true,
            onSale: false,
            isNew: true,
            isBestseller: false,
            featured: false,
            popularity: 80,
            date: "2023-08-22",
            image: "https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RW163Qx?ver=2a93&q=90&m=6&h=300&w=300&b=%23FFFFFFFF&l=f&o=t&aim=true",
            description: "Elegant design with premium performance"
        },
        {
            id: 13,
            name: "Samsung Galaxy Watch 5",
            category: "smartwatches",
            brand: "samsung",
            price: 279.99,
            originalPrice: 299.99,
            rating: 4.4,
            reviewCount: 52,
            inStock: true,
            onSale: true,
            isNew: false,
            isBestseller: false,
            featured: true,
            popularity: 81,
            date: "2023-04-05",
            image: "https://images.samsung.com/is/image/samsung/p6pim/uk/2208/gallery/uk-galaxy-watch5-40mm-sm-r900nzdaeua-thumb-533187665?$344_344_PNG$",
            description: "Advanced health tracking and smart features"
        },
        {
            id: 14,
            name: "Sony WF-1000XM4",
            category: "audio",
            brand: "sony",
            price: 249.99,
            rating: 4.8,
            reviewCount: 87,
            inStock: true,
            onSale: false,
            isNew: false,
            isBestseller: true,
            featured: true,
            popularity: 88,
            date: "2023-01-15",
            image: "https://d13o3tuo14g2wf.cloudfront.net/thumbnails%2Flarge%2FAsset+Hierarchy%2FConsumer+Assets%2FAccessories%2FHeadphones%2F2021%2FWF-1000XM4%2FProduct+Images%2FSilver%2Fecom%2F1+WF-1000XM4_silver_product_image_500x500.png.png?Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9kMTNvM3R1bzE0ZzJ3Zi5jbG91ZGZyb250Lm5ldC90aHVtYm5haWxzJTJGbGFyZ2UlMkZBc3NldCtIaWVyYXJjaHklMkZDb25zdW1lcitBc3NldHMlMkZBY2Nlc3NvcmllcyUyRkhlYWRwaG9uZXMlMkYyMDIxJTJGV0YtMTAwMFhNNCUyRlByb2R1Y3QrSW1hZ2VzJTJGU2lsdmVyJTJGZWNvbSUyRjErV0YtMTAwMFhNNF9zaWx2ZXJfcHJvZHVjdF9pbWFnZV81MDB4NTAwLnBuZy5wbmciLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjIxNDc0MTQ0MDB9fX1dfQ__&Signature=MZfCSoi8PFeUUJQvpNf72CqPxiCIEiuEPQ~4MfabKF0FEeTkjT~LeZx~PdOaKtQJF-Wm9N9xOpgkeVkmvM2gg6yMX7pcvH-P8SYlSvOY7oLq16nKbWZfnFkTmvM3xpZqUc58exU-KuYsyPIrqlYp8PGXyBZPh8tmKVEAQfBPyc3JO7acjN80jxAZvZpomHLgNPqyhVH10-RHV1qwZg1Z47FGEfSfzevxOl4X88GY2jHNYqve1FLyN~9sjd~MIKGl~dZGzueCeCQDhEGBw-H-qaCBdxf~zUD~yMljMBGHhW-3MGKlxV9oq1qlPUXw-USZZeJYg~KlxUfah3nnTHJPOA__&Key-Pair-Id=K37BLT9C6HMMJ0",
            description: "Industry-leading noise cancellation and sound quality"
        },
        {
            id: 15,
            name: "Lenovo ThinkPad X1 Carbon",
            category: "laptops",
            brand: "lenovo",
            price: 1499.99,
            originalPrice: 1599.99,
            rating: 4.7,
            reviewCount: 41,
            inStock: true,
            onSale: true,
            isNew: false,
            isBestseller: false,
            featured: false,
            popularity: 79,
            date: "2023-03-30",
            image: "https://www.lenovo.com/medias/thinkpad-x1-carbon-gen-10-hero.png?context=bWFzdGVyfHJvb3R8OTc1MDF8aW1hZ2UvcG5nfGhmYy9oYmUvMTMyOTExOTc1NTg4MTQucG5nfDI1Y2E3Y2NiY2Q2ZDAyYjgwMWE4MjBlZGEwYWI0ZWNkNzlkOTc3MDkzY2FmMjdmNzRmODg3M2Q3N2FmODU1MTY",
            description: "Business laptop with exceptional durability and performance"
        },
        {
            id: 16,
            name: "iPad Pro",
            category: "tablets",
            brand: "apple",
            price: 999.99,
            rating: 4.9,
            reviewCount: 112,
            inStock: true,
            onSale: false,
            isNew: true,
            isBestseller: true,
            featured: true,
            popularity: 93,
            date: "2023-10-01",
            image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-pro-finish-select-202212-11inch-space-gray-wifi_AV1?wid=5120&hei=2880&fmt=jpeg&qlt=90&.v=1670865999212",
            description: "Professional-grade tablet with M2 chip and Liquid Retina display"
        },
        {
            id: 17,
            name: "Anker PowerCore 26800",
            category: "accessories",
            brand: "anker",
            price: 59.99,
            originalPrice: 69.99,
            rating: 4.7,
            reviewCount: 125,
            inStock: true,
            onSale: true,
            isNew: false,
            isBestseller: true,
            featured: false,
            popularity: 86,
            date: "2022-12-12",
            image: "https://cdn.shopify.com/s/files/1/0493/9834/9974/products/A1277011-2_300x300.jpg?v=1658754091",
            description: "High-capacity power bank with fast charging"
        },
        {
            id: 18,
            name: "Logitech MX Master 3",
            category: "accessories",
            brand: "logitech",
            price: 99.99,
            rating: 4.8,
            reviewCount: 78,
            inStock: true,
            onSale: false,
            isNew: false,
            isBestseller: true,
            featured: true,
            popularity: 88,
            date: "2023-02-15",
            image: "https://resource.logitechg.com/w_386,ar_1.0,c_limit,f_auto,q_auto,dpr_2.0/d_transparent.gif/content/dam/gaming/en/products/g502x/gallery/g502x-gallery-1-white.png?v=1",
            description: "Advanced wireless mouse with customizable buttons"
        },
        {
            id: 19,
            name: "GoPro HERO11 Black",
            category: "cameras",
            brand: "gopro",
            price: 399.99,
            originalPrice: 499.99,
            rating: 4.6,
            reviewCount: 53,
            inStock: true,
            onSale: true,
            isNew: true,
            isBestseller: false,
            featured: true,
            popularity: 85,
            date: "2023-07-10",
            image: "https://fdn.gsmarena.com/imgroot/news/22/09/gopro-hero11-black/-300/gsmarena_001.jpg",
            description: "Ultimate action camera with superior image stabilization"
        },
        {
            id: 20,
            name: "Amazon Echo Dot",
            category: "smart home",
            brand: "amazon",
            price: 49.99,
            originalPrice: 59.99,
            rating: 4.7,
            reviewCount: 145,
            inStock: true,
            onSale: true,
            isNew: false,
            isBestseller: true,
            featured: true,
            popularity: 91,
            date: "2023-01-30",
            image: "https://m.media-amazon.com/images/I/61MbLLagiVL._SX300_SY300_QL70_FMwebp_.jpg",
            description: "Compact smart speaker with Alexa"
        }
    ];
}

function updateActiveFilters(categories, brands, statuses, minPrice, maxPrice) {
    const activeFilters = document.querySelector('.active-filters');
    if (!activeFilters) return;
    
    const clearAllBtn = activeFilters.querySelector('.clear-filters-btn');
    activeFilters.innerHTML = '';
    if (clearAllBtn) {
        activeFilters.appendChild(clearAllBtn);
    }
    
    categories.forEach(category => addFilterTag(activeFilters, category.charAt(0).toUpperCase() + category.slice(1)));
    brands.forEach(brand => addFilterTag(activeFilters, brand.charAt(0).toUpperCase() + brand.slice(1)));
    statuses.forEach(status => {
        const displayText = {
            'in-stock': 'In Stock',
            'on-sale': 'On Sale',
            'new-arrival': 'New Arrival'
        }[status];
        if (displayText) addFilterTag(activeFilters, displayText);
    });
    
    if (minPrice > 0 || maxPrice < 2000) {
        addFilterTag(activeFilters, `$${minPrice} - $${maxPrice}`);
    }
    
    activeFilters.style.display = activeFilters.querySelectorAll('.filter-tag').length === 0 ? 'none' : 'flex';
    
    // Re-attach remove filter events
    activeFilters.querySelectorAll('.remove-filter').forEach(tag => {
        tag.addEventListener('click', function() {
            const filterTag = this.parentElement;
            const filterText = filterTag.querySelector('span').textContent;
            filterTag.remove();
            
            document.querySelectorAll('.filter-list input').forEach(input => {
                const labelText = input.parentElement.querySelector('.label-text')?.textContent;
                if (labelText === filterText) {
                    input.checked = false;
                }
            });
            loadProducts();
        });
    });
}

function addFilterTag(container, text) {
    const tagHTML = `
        <div class="filter-tag">
            <span>${text}</span>
            <button class="remove-filter"><i class="fas fa-times"></i></button>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', tagHTML);
}

function renderProducts(products) {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;
    
    const isList = productsGrid.classList.contains('products-list');
    
    if (products.length === 0) {
        productsGrid.innerHTML = `
            <div class="no-products">
                <img src="https://cdn-icons-png.flaticon.com/512/6134/6134065.png" alt="No Products Found" width="150">
                <h3>No Products Found</h3>
                <p>Try adjusting your filters or search terms</p>
                <button class="btn primary-btn" id="reset-filters">Reset Filters</button>
            </div>
        `;
        
        document.getElementById('reset-filters')?.addEventListener('click', () => {
            document.querySelector('.clear-filters-btn')?.click();
        });
        return;
    }
    
    let productsHTML = '';
    products.forEach((product, index) => {
        const delay = index * 100;
        productsHTML += isList ? 
            createProductListItem(product, delay) : 
            createProductCard(product, delay);
    });
    
    productsGrid.innerHTML = productsHTML;
    initProductActions();
}

function createProductCard(product, delay) {
    const badgeHTML = getBadgeHTML(product);
    const ratingHTML = createRatingStars(product.rating);
    const priceHTML = getPriceHTML(product);
    
    return `
        <div class="product-card" data-aos="fade-up" data-aos-delay="${delay}" data-id="${product.id}">
            ${badgeHTML}
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
                <div class="product-actions">
                    <button class="product-action-btn quick-view" data-id="${product.id}" title="Quick View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="product-action-btn add-to-cart" data-id="${product.id}" title="Add to Cart">
                        <i class="fas fa-shopping-cart"></i>
                    </button>
                    <button class="product-action-btn add-to-wishlist" data-id="${product.id}" title="Add to Wishlist">
                        <i class="far fa-heart"></i>
                    </button>
                    <button class="product-action-btn compare" data-id="${product.id}" title="Compare">
                        <i class="fas fa-exchange-alt"></i>
                    </button>
                </div>
            </div>
            <div class="product-info">
                <span class="product-category">${product.category}</span>
                <h3 class="product-name">
                    <a href="product-detail.html?id=${product.id}">${product.name}</a>
                </h3>
                <div class="product-rating">
                    <div class="stars">${ratingHTML}</div>
                    <span class="rating-count">(${product.reviewCount})</span>
                </div>
                <div class="product-price">
                    ${priceHTML}
                </div>
            </div>
        </div>
    `;
}

function createProductListItem(product, delay) {
    const badgeHTML = getBadgeHTML(product);
    const ratingHTML = createRatingStars(product.rating);
    const priceHTML = getPriceHTML(product);
    const features = generateProductFeatures(product.category);
    let featuresHTML = features.map(feature => 
        `<li class="list-item-feature"><i class="fas fa-check-circle"></i>${feature}</li>`
    ).join('');
    
    return `
        <div class="product-list-item" data-aos="fade-up" data-aos-delay="${delay}" data-id="${product.id}">
            ${badgeHTML}
            <div class="list-item-image">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="list-item-content">
                <div class="list-item-header">
                    <span class="product-category">${product.category}</span>
                    <h3 class="list-item-name">
                        <a href="product-detail.html?id=${product.id}">${product.name}</a>
                    </h3>
                    <div class="product-rating">
                        <div class="stars">${ratingHTML}</div>
                        <span class="rating-count">(${product.reviewCount})</span>
                    </div>
                </div>
                <p class="list-item-description">${product.description}</p>
                <ul class="list-item-features">${featuresHTML}</ul>
                <div class="list-item-bottom">
                    <div class="product-price">${priceHTML}</div>
                    <div class="list-item-actions">
                        <button class="btn primary-btn add-to-cart" data-id="${product.id}">
                            <i class="fas fa-shopping-cart"></i> Add to Cart
                        </button>
                        <button class="btn outline-btn quick-view" data-id="${product.id}">
                            <i class="fas fa-eye"></i> Quick View
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getBadgeHTML(product) {
    if (product.isNew) return '<span class="product-badge new">New</span>';
    if (product.onSale) return '<span class="product-badge sale">Sale</span>';
    if (product.isBestseller) return '<span class="product-badge bestseller">Bestseller</span>';
    return '';
}

function getPriceHTML(product) {
    if (product.onSale && product.originalPrice) {
        const discountPercent = Math.round((product.originalPrice - product.price) / product.originalPrice * 100);
        return `
            <span class="current-price">$${product.price.toFixed(2)}</span>
            <span class="old-price">$${product.originalPrice.toFixed(2)}</span>
            <span class="discount-percentage">-${discountPercent}%</span>
        `;
    }
    return `<span class="current-price">$${product.price.toFixed(2)}</span>`;
}

function createRatingStars(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    let starsHTML = '';
    for (let i = 0; i < fullStars; i++) starsHTML += '<i class="fas fa-star"></i>';
    if (halfStar) starsHTML += '<i class="fas fa-star-half-alt"></i>';
    for (let i = 0; i < emptyStars; i++) starsHTML += '<i class="far fa-star"></i>';
    
    return starsHTML;
}

function generateProductFeatures(category) {
    const featureSets = {
        "smartphones": ["5G Connectivity", "High-Res Display", "Fast Charging", "Advanced Camera"],
        "audio": ["Noise Cancellation", "Long Battery Life", "Water Resistant", "Hi-Fi Sound"],
        "laptops": ["High-Performance CPU", "SSD Storage", "Backlit Keyboard", "Long Battery Life"],
        "smartwatches": ["Heart Rate Monitor", "Waterproof Design", "Fitness Tracking", "Smart Notifications"],
        "tablets": ["Touch Screen", "Lightweight Design", "Long Battery Life", "Wi-Fi Connectivity"]
    };
    return featureSets[category.toLowerCase()] || ["Premium Quality", "Modern Design"];
}

function initPagination(totalPages, currentPage) {
    const paginationContainer = document.querySelector('.pagination-container');
    if (!paginationContainer) return;
    
    paginationContainer.style.display = totalPages > 1 ? 'flex' : 'none';
    
    const paginationNumbers = paginationContainer.querySelector('.pagination-numbers');
    if (paginationNumbers) {
        let numbersHTML = '';
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                numbersHTML += `<button class="pagination-number ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
            }
        } else {
            numbersHTML = `
                <button class="pagination-number ${currentPage === 1 ? 'active' : ''}" data-page="1">1</button>
                <button class="pagination-number ${currentPage === 2 ? 'active' : ''}" data-page="2">2</button>
                <button class="pagination-number ${currentPage === 3 ? 'active' : ''}" data-page="3">3</button>
                <span class="pagination-ellipsis">...</span>
                <button class="pagination-number" data-page="${totalPages}">${totalPages}</button>
            `;
        }
        
        paginationNumbers.innerHTML = numbersHTML;
        
        const pageButtons = paginationNumbers.querySelectorAll('.pagination-number');
        pageButtons.forEach(button => {
            button.addEventListener('click', function() {
                const page = parseInt(this.getAttribute('data-page'));
                pageButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                window.scrollTo({ top: 0, behavior: 'smooth' });
                loadProducts(page);
            });
        });
        
        const prevBtn = paginationContainer.querySelector('.prev');
        const nextBtn = paginationContainer.querySelector('.next');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (currentPage > 1) loadProducts(currentPage - 1);
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (currentPage < totalPages) loadProducts(currentPage + 1);
            });
        }
    }
}

function initProductActions() {
    document.querySelectorAll('.quick-view').forEach(button => {
        button.addEventListener('click', () => showQuickView(button.getAttribute('data-id')));
    });
    
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', () => addToCart(button.getAttribute('data-id')));
    });
    
    document.querySelectorAll('.add-to-wishlist').forEach(button => {
        button.addEventListener('click', () => addToWishlist(button.getAttribute('data-id')));
    });
    
    document.querySelectorAll('.compare').forEach(button => {
        button.addEventListener('click', () => addToCompare(button.getAttribute('data-id')));
    });
}

function showQuickView(productId) {
    const product = findProductById(productId);
    if (!product) return;
    
    const modalHTML = `
        <div class="quick-view-modal">
            <div class="quick-view-content">
                <button class="close-quick-view"><i class="fas fa-times"></i></button>
                <div class="quick-view-grid">
                    <div class="quick-view-image">
                        <img src="${product.image}" alt="${product.name}">
                    </div>
                    <div class="quick-view-info">
                        <span class="product-category">${product.category}</span>
                        <h2>${product.name}</h2>
                        <div class="product-rating">
                            <div class="stars">${createRatingStars(product.rating)}</div>
                            <span class="rating-count">(${product.reviewCount} Reviews)</span>
                        </div>
                        <div class="product-price">${getPriceHTML(product)}</div>
                        <p class="product-description">${product.description}</p>
                        <div class="product-availability">
                            <span class="${product.inStock ? 'in-stock' : 'out-of-stock'}">
                                ${product.inStock ? 'In Stock' : 'Out of Stock'}
                            </span>
                        </div>
                        <div class="quick-view-actions">
                            <div class="quantity-selector">
                                <button class="qty-btn minus">-</button>
                                <input type="number" value="1" min="1" max="99">
                                <button class="qty-btn plus">+</button>
                            </div>
                            <button class="btn primary-btn add-to-cart-btn" data-id="${product.id}">
                                <i class="fas fa-shopping-cart"></i> Add to Cart
                            </button>
                            <button class="btn wishlist-btn" data-id="${product.id}">
                                <i class="far fa-heart"></i>
                            </button>
                        </div>
                        <div class="quick-view-meta">
                            <p><strong>SKU:</strong> ${product.sku || 'TH-' + product.id}</p>
                            <p><strong>Brand:</strong> ${product.brand}</p>
                            <p><strong>Category:</strong> ${product.category}</p>
                        </div>
                        <a href="product-detail.html?id=${product.id}" class="view-details-btn">
                            View Full Details
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = document.querySelector('.quick-view-modal');
    setTimeout(() => modal.classList.add('active'), 10);
    
    const closeBtn = modal.querySelector('.close-quick-view');
    closeBtn.addEventListener('click', () => closeQuickView(modal));
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeQuickView(modal);
    });
    
    const minusBtn = modal.querySelector('.qty-btn.minus');
    const plusBtn = modal.querySelector('.qty-btn.plus');
    const qtyInput = modal.querySelector('.quantity-selector input');
    
    minusBtn.addEventListener('click', () => {
        const currentValue = parseInt(qtyInput.value);
        if (currentValue > 1) qtyInput.value = currentValue - 1;
    });
    
    plusBtn.addEventListener('click', () => {
        const currentValue = parseInt(qtyInput.value);
        if (currentValue < 99) qtyInput.value = currentValue + 1;
    });
    
    modal.querySelector('.add-to-cart-btn').addEventListener('click', () => {
        const quantity = parseInt(qtyInput.value);
        addToCart(productId, quantity);
        closeQuickView(modal);
    });
    
    modal.querySelector('.wishlist-btn').addEventListener('click', function() {
        addToWishlist(productId);
        this.classList.toggle('active');
        const icon = this.querySelector('i');
        icon.classList.toggle('far');
        icon.classList.toggle('fas');
    });
}

function closeQuickView(modal) {
    if (!modal) return;
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
}

function findProductById(productId) {
    return generateProducts().find(product => product.id === parseInt(productId));
}

function addToCart(productId, quantity = 1) {
    // Get product data from the products array
    const product = findProductById(productId);
    
    if (!product) {
        console.error(`Product with ID ${productId} not found`);
        return;
    }
    
    // Get current cart or initialize empty array
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Check if product already in cart
    const existingItemIndex = cart.findIndex(item => item.id === productId);
    
    if (existingItemIndex >= 0) {
        // Update quantity if product already in cart
        cart[existingItemIndex].quantity += quantity;
    } else {
        // Add new item to cart
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: quantity
        });
    }
    
    // Save updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart count display
    updateCartCount();
    
    // Show notification
    showNotification(`${product.name} added to cart!`);
}

// Function to update cart count in header
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
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

function addToWishlist(productId) {
    const product = findProductById(productId);
    if (!product) return;
    
    const button = document.querySelector(`.add-to-wishlist[data-id="${productId}"]`);
    if (button) {
        button.classList.toggle('active');
        const icon = button.querySelector('i');
        if (icon) {
            icon.classList.toggle('far');
            icon.classList.toggle('fas');
        }
    }
    console.log(`${product.name} ${button?.classList.contains('active') ? 'added to' : 'removed from'} wishlist`);
}

function addToCompare(productId) {
    const product = findProductById(productId);
    if (!product) return;
    console.log(`Added ${product.name} to compare`);
}

function initRecentlyViewed() {
    const slider = document.querySelector('.recently-viewed-slider');
    if (!slider) return;
    
    const recentlyViewed = generateProducts().slice(0, 2);
    let sliderHTML = '';
    recentlyViewed.forEach((product, index) => {
        sliderHTML += `
            <div class="recently-viewed-item" data-aos="fade-up" data-aos-delay="${index * 100}">
                <div class="rv-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="rv-info">
                    <h4>${product.name}</h4>
                    <span class="rv-price">$${product.price.toFixed(2)}</span>
                </div>
                <a href="product-detail.html?id=${product.id}" class="rv-link"></a>
            </div>
        `;
    });
    
    slider.innerHTML = sliderHTML;
    
    const items = slider.querySelectorAll('.recently-viewed-item');
    if (items.length > 4) slider.classList.add('scrollable');
}


const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const emailInput = this.querySelector('input[type="email"]');
        if (emailInput && emailInput.value) {
            console.log(`Subscribed: ${emailInput.value}`);
            emailInput.value = '';
            alert('Thank you for subscribing!');
        }
    });
}