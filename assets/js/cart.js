// This file handles the functionality of the shopping cart, including adding, removing, and updating items in the cart.

let cart = [];

// Function to add item to cart
function addToCart(product) {
    const existingProduct = cart.find(item => item.id === product.id);
    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    updateCartDisplay();
}

// Function to remove item from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartDisplay();
}

// Function to update item quantity in cart
function updateCartQuantity(productId, quantity) {
    const existingProduct = cart.find(item => item.id === productId);
    if (existingProduct) {
        existingProduct.quantity = quantity;
        if (existingProduct.quantity <= 0) {
            removeFromCart(productId);
        }
    }
    updateCartDisplay();
}

// Function to calculate total price
function calculateTotal() {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}

// Function to update cart display
function updateCartDisplay() {
    const cartContainer = document.getElementById('cart-container');
    cartContainer.innerHTML = '';

    cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <h4>${item.name}</h4>
            <p>Price: $${item.price}</p>
            <p>Quantity: <input type="number" value="${item.quantity}" min="1" onchange="updateCartQuantity(${item.id}, this.value)"></p>
            <button onclick="removeFromCart(${item.id})">Remove</button>
        `;
        cartContainer.appendChild(itemElement);
    });

    const totalElement = document.createElement('div');
    totalElement.className = 'cart-total';
    totalElement.innerHTML = `Total: $${calculateTotal()}`;
    cartContainer.appendChild(totalElement);
}

// Function to clear the cart
function clearCart() {
    cart = [];
    updateCartDisplay();
}