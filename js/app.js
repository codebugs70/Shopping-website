const productContainer = document.querySelector(".product-container");
const productDropdown = document.querySelector("#product-dropdown");
const searchBar = document.querySelector("#search-product");
const cartProduct = document.querySelector(".cart-product");
const modal = document.querySelector(".modal");
const cartIcon = document.querySelector(".cart-icon");
const productCount = document.querySelector(".product-count");
const cartTotal = document.querySelector(".cart-total");
const checkoutBtn = document.querySelector(".checkout-btn");

// ! Config API
// ? Tất cả các API đều có điểm chung là "https://fakestoreapi.com/products"
// ? --> Tạo thành 1 biến STORE_API để tiện sử dụng
const STORE_API = "https://fakestoreapi.com/products";
// ! API lọc sản phâm theo category:  https://fakestoreapi.com/products/category/jewelery
// ! API lấy ra categoy của sản phẩm:  https://fakestoreapi.com/products/categories
// ! API lọc sản phẩm theo chữ cái (A -> Z, Z -> A):  https://fakestoreapi.com/products?sort=desc

let productsData = [];

// TODO: Fetch API products
async function fetchProductsData(category = "all") {
  // ! Sử dụng async function (async - await và try - catch)
  try {
    let response; // ! Set response là global
    if (category === "all") {
      response = await fetch(STORE_API);
    } else if (category === "asc" || category === "desc") {
      response = await fetch(`${STORE_API}?sort=${category}`);
    } else {
      response = await fetch(`${STORE_API}/category/${category}`);
    }
    const data = await response.json();
    productsData = data;
    renderProducts(productsData);
  } catch (error) {
    console.log(error);
  }
}
fetchProductsData();

// TODO: Fetch API products categories
async function fetchCatgoriesData() {
  try {
    const res = await fetch(`${STORE_API}/categories`);
    const data = await res.json();
    const newCategories = ["all", "asc", "desc", ...data];
    renderCategories(newCategories);
  } catch (error) {
    console.log(error);
  }
}
fetchCatgoriesData();

// TODO: Filter products
productDropdown.addEventListener("change", handleFilterProducts);
function handleFilterProducts() {
  const dropdowVal = productDropdown.value;
  fetchProductsData(dropdowVal);
}

// TODO: Search products
searchBar.addEventListener("input", handleSearchProducts);
function handleSearchProducts(e) {
  let searchQuery = e.target.value;
  const filteredProducts = productsData.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );
  renderProducts(filteredProducts);
}

// TODO: Render products
function renderProducts(products) {
  if (!products) return;
  productContainer.innerHTML = "";
  products.forEach((item, index) => {
    const template = `<div class="product">
    <div class="product-img">
      <img
        src="${item.image}"
        alt=""
      />
    </div>
    <div class="product-content">
      <div class="product-top">
        <span class="product-category">${item.category}</span>
        <h1 class="product-title">${item.title}</h1>
        <p class="product-desc">${item.description}</p>
        <span class="product-price">${item.price}$</span>
      </div>
      <div class="product-bottom">
        <div class="product-meta">
          <div class="group">
            <span class="product-rating">${item?.rating?.rate}</span>
            <span><i class="fa-solid fa-star"></i></span>
          </div>
          <div class="group">
            <span class="product-count">${item?.rating?.count}</span>
            <span><i class="fa-solid fa-user"></i></span>
          </div>
        </div>
        <button onClick="handleAddProduct(${index})" class="add-btn">Add to cart</button>
      </div>
    </div>
  </div>`;
    productContainer.insertAdjacentHTML("beforeend", template);
  });
}

// TODO: Render categories dropdown
function renderCategories(categories) {
  if (!categories) return;
  categories.map((category) => {
    const template = `<option value="${category}">${category}</option>`;
    productDropdown.insertAdjacentHTML("beforeend", template);
  });
}

// TODO: Handle add product
let cart = [];
function handleAddProduct(index) {
  const producItem = productsData[index];
  const isExistedProduct = cart.find((item) => item.id === producItem.id);
  if (isExistedProduct) {
    isExistedProduct.quantity += 1;
  } else {
    producItem.quantity = 1;
    cart.push(producItem);
  }

  productCount.textContent = cart.length;
  renderCartItem();
}

// TODO: Handle increase products
function handleIncrease(productIndex) {
  cart = cart.map((item, index) =>
    index === productIndex ? { ...item, quantity: item.quantity + 1 } : item
  );
  renderCartItem();
}

// TODO: Handle decrease products
function handleDecrease(productIndex) {
  const producItem = cart[productIndex];
  if (producItem.quantity === 1) {
    cart = cart.filter((item) => item.id !== producItem.id);
  } else {
    cart = cart.map((item, index) =>
      index === productIndex ? { ...item, quantity: item.quantity - 1 } : item
    );
  }
  renderCartItem();
}

// TODO: Calculate total and format money (US dola)
function calculateMoney() {
  const total = cart.reduce((acc, item) => {
    return acc + item.price * item.quantity;
  }, 0);
  return total.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// TODO: Check out button -> simple clear cart
checkoutBtn.addEventListener("click", function () {
  cart = [];
  modal.classList.remove("show");
});

// TODO: Add product to cart
function renderCartItem() {
  cartProduct.innerHTML = "";
  cart.forEach((item, index) => {
    const template = `<li class="cart-product-item">
  <div class="cart-product-item-info">
    <div class="cart-image">
      <img src="${item.image}" alt="" />
    </div>
    <div class="col">
      <h1>${item.title}</h1>
      <span>${item.price}$</span>
    </div>
  </div>
  <div class="cart-product-item-action">
    <span onClick="handleIncrease(${index})" class="icon">+</span>
    <span class="quantity">${item.quantity}</span>
    <span onClick="handleDecrease(${index})" class="icon">-</span>
  </div>
</li>`;
    cartProduct.insertAdjacentHTML("beforeend", template);
  });

  // TODO: Display total money in bill
  const total = calculateMoney();
  if (cart.length > 0) {
    cartTotal.textContent = total;
  } else {
    cartTotal.textContent = "0$";
  }
}
/* ==================================================================== */
// TODO: Open modal
cartIcon.addEventListener("click", function () {
  modal.classList.add("show");
});

// TODO: Close modal
document.addEventListener("click", function (e) {
  if (e.target.matches(".modal-close") || e.target.matches(".overlay")) {
    modal.classList.remove("show");
  }
});
