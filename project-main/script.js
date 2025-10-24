
function getCart() {
  try {
    return JSON.parse(localStorage.getItem('cart')) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}


function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((acc, item) => acc + (item.qty || 0), 0);
  document.querySelectorAll(".nav-links a").forEach(link => {
    if (link.textContent.includes("Cart")) {
      link.textContent = `Cart (${count})`;
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();

  const addToCartBtn = document.querySelector(".add-to-cart");
  if (!addToCartBtn) return;

  addToCartBtn.addEventListener("click", () => {
    
    const nameEl = document.querySelector(".product-title");
    const priceEl = document.querySelector(".current-price");
    const colorEl = document.getElementById("color");
    const qtyEl = document.getElementById("quantity");

    if (!nameEl || !priceEl || !qtyEl) {
      alert("Product info missing. Cannot add to cart!");
      return;
    }

    
    const product = {
      id: nameEl.textContent.trim().toLowerCase().replace(/\s+/g, "-"),
      name: nameEl.textContent.trim(),
      price: parseFloat(priceEl.textContent.replace(/[^\d.]/g, "")) || 0,
      color: colorEl ? colorEl.value : "Default",
      qty: parseInt(qtyEl.value) || 1
    };

    
    const cart = getCart();
    const existing = cart.find(item => item.id === product.id && item.color === product.color);
    if (existing) {
      existing.qty += product.qty;
    } else {
      cart.push(product);
    }

    saveCart(cart);
    updateCartCount();
    alert(`${product.qty} × ${product.name} added to cart!`);
  });

  
  const incBtn = document.getElementById("increment");
  const decBtn = document.getElementById("decrement");
  const qtyInput = document.getElementById("quantity");

  if (incBtn && decBtn && qtyInput) {
    incBtn.onclick = () => {
      if (parseInt(qtyInput.value) < 10) qtyInput.value = parseInt(qtyInput.value) + 1;
    };
    decBtn.onclick = () => {
      if (parseInt(qtyInput.value) > 1) qtyInput.value = parseInt(qtyInput.value) - 1;
    };
  }
});


function loadCartItems() {
  const cart = getCart();
  const tbody = document.getElementById('cartItems');
  const emptyMsg = document.getElementById('emptyCartMsg');

  if (!tbody) return; 

  if (!cart || cart.length === 0) {
    document.querySelector('table').style.display = 'none';
    if (emptyMsg) emptyMsg.style.display = 'block';
    return;
  }

  tbody.innerHTML = '';
  cart.forEach((item, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.name || 'Unnamed Product'}</td>
      <td>${item.color || 'Default'}</td>
      <td><input type="number" value="${item.qty || 1}" min="1" class="qty" data-index="${index}"></td>
      <td class="price">${parseFloat(item.price).toFixed(2)}</td>
      <td class="total">0.00</td>
      <td><button class="remove-btn" data-index="${index}">Remove</button></td>
    `;
    tbody.appendChild(row);
  });

  calculateTotals();


  document.querySelectorAll('.qty').forEach(input => {
    input.addEventListener('input', e => {
      const idx = e.target.getAttribute('data-index');
      const cart = getCart();
      cart[idx].qty = parseInt(e.target.value) || 1;
      saveCart(cart);
      calculateTotals();
      updateCartCount();
    });
  });

  
  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const idx = e.target.getAttribute('data-index');
      const cart = getCart();
      cart.splice(idx, 1);
      saveCart(cart);
      loadCartItems();
      updateCartCount();
    });
  });
}


function calculateTotals() {
  const rows = document.querySelectorAll('#cartItems tr');
  let subtotal = 0;

  rows.forEach(row => {
    const qty = parseFloat(row.querySelector('.qty').value) || 0;
    const price = parseFloat(row.querySelector('.price').textContent) || 0;
    const total = qty * price;
    row.querySelector('.total').textContent = total.toFixed(2);
    subtotal += total;
  });

  const shipping = 50;
  const tax = subtotal * 0.08;
  const grandTotal = subtotal + shipping + tax;

  if (document.getElementById('subtotal')) document.getElementById('subtotal').textContent = subtotal.toFixed(2);
  if (document.getElementById('shipping')) document.getElementById('shipping').textContent = shipping.toFixed(2);
  if (document.getElementById('tax')) document.getElementById('tax').textContent = tax.toFixed(2);
  if (document.getElementById('grandTotal')) document.getElementById('grandTotal').textContent = grandTotal.toFixed(2);
}

document.addEventListener('DOMContentLoaded', loadCartItems);
function clearCart() {
  localStorage.removeItem('cart');
}
