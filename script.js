/* =========================================================
   NV — Traditional Menswear
   Frontend logic + Supabase backend integration

   Requires the UMD Supabase client to be loaded before this file
   (see index.html <script> tag for @supabase/supabase-js).

   SETUP: replace SUPABASE_URL and SUPABASE_ANON_KEY below with
   your own project's values (Project Settings → API in Supabase).
   Then run supabase-schema.sql in the Supabase SQL editor.
   ========================================================= */

const SUPABASE_URL="https://blgqrqmajndxgwvhrcpp.supabase.co"; // e.g. https://xxxxx.supabase.co
const SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsZ3FycW1ham5keGd3dmhyY3BwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxMTk0NjAsImV4cCI6MjEwMjY5NTQ2MH0.X1pRCHHiHRVFKZz2lk-Q16yYH5A_z8skvnJn47G2R5g";

let supabase = null;
try {
  if (window.supabase && SUPABASE_URL.startsWith("http")) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
} catch (err) {
  console.warn("Supabase client could not be created:", err);
}

/* ---------------------------------------------------------
   Fallback demo data — used automatically if Supabase isn't
   configured yet, so the site is browsable out of the box.
   Menswear only.
   --------------------------------------------------------- */
const DEMO_PRODUCTS = [
  { id: "d1", title: "Bandhgala Jacket Set — Charcoal", slug: "bandhgala-charcoal", category: "sherwani", fabric: "Jacquard Silk Blend", color: "Charcoal", price: 8900, compare_at_price: null, description: "Structured bandhgala jacket with matching trousers — tailored fit, festive occasions.", sizes: ["38","40","42","44","46"], image_url: null, is_featured: true },
  { id: "d2", title: "Handloom Cotton Kurta — Rust", slug: "mens-kurta-rust", category: "kurta", fabric: "Handloom Cotton", color: "Rust", price: 2400, compare_at_price: 2900, description: "Straight-fit handloom cotton kurta, breathable and lightly starched for structure.", sizes: ["S","M","L","XL","XXL"], image_url: null, is_featured: false },
  { id: "d3", title: "Silk Sherwani — Ivory Gold", slug: "sherwani-ivory-gold", category: "sherwani", fabric: "Raw Silk with Zari Border", color: "Ivory", price: 24500, compare_at_price: 29000, description: "Hand-finished wedding sherwani with a zari border and matching churidar. Made to order.", sizes: ["38","40","42","44","46","48"], image_url: null, is_featured: true },
  { id: "d4", title: "Chikankari Kurta Set — Ivory", slug: "chikankari-kurta-mens", category: "kurta-set", fabric: "Cotton Chikankari", color: "Ivory", price: 4200, compare_at_price: 5000, description: "Lucknowi chikankari hand-embroidery on breathable cotton, paired with a matching pyjama.", sizes: ["S","M","L","XL","XXL"], image_url: null, is_featured: true },
  { id: "d5", title: "Ajrakh Print Kurta Set — Indigo", slug: "ajrakh-indigo-mens", category: "kurta-set", fabric: "Ajrakh Block Print Cotton", color: "Indigo", price: 3800, compare_at_price: null, description: "Natural indigo-dyed Ajrakh block print from Kutch, tailored as a straight kurta with pyjama.", sizes: ["S","M","L","XL"], image_url: null, is_featured: false },
  { id: "d6", title: "Nehru Jacket — Bottle Green Velvet", slug: "nehru-jacket-green", category: "nehru-jacket", fabric: "Velvet", color: "Bottle Green", price: 5200, compare_at_price: null, description: "Fitted velvet Nehru jacket with mandarin collar, layers over any kurta.", sizes: ["S","M","L","XL"], image_url: null, is_featured: true },
  { id: "d7", title: "Nehru Jacket — Turmeric Silk", slug: "nehru-jacket-turmeric", category: "nehru-jacket", fabric: "Silk Blend", color: "Turmeric Yellow", price: 4600, compare_at_price: 5400, description: "Lightweight silk-blend Nehru jacket with self-jaal weave, festive-ready.", sizes: ["S","M","L","XL","XXL"], image_url: null, is_featured: false },
  { id: "d8", title: "Dhoti & Angavastram Set — Cream", slug: "dhoti-set-cream", category: "dhoti", fabric: "Handloom Cotton", color: "Cream", price: 2100, compare_at_price: null, description: "Traditional dhoti with a gold-bordered angavastram, ready to drape.", sizes: ["Free Size"], image_url: null, is_featured: false },
  { id: "d9", title: "Silk Pyjama Set — Slate Blue", slug: "silk-pyjama-slate", category: "dhoti", fabric: "Pure Silk", color: "Slate Blue", price: 3200, compare_at_price: null, description: "Relaxed silk pyjama with a matching short kurta, ideal for evening functions.", sizes: ["S","M","L","XL"], image_url: null, is_featured: false },
  { id: "d10", title: "Banarasi Silk Kurta — Maroon", slug: "banarasi-kurta-maroon", category: "kurta", fabric: "Banarasi Silk", color: "Maroon", price: 6800, compare_at_price: null, description: "Banarasi silk kurta with a self-jaal pattern and a gold-trimmed placket.", sizes: ["S","M","L","XL","XXL"], image_url: null, is_featured: false },
  { id: "d11", title: "Groom's Sherwani — Maroon Zardozi", slug: "grooms-sherwani-maroon", category: "wedding", fabric: "Velvet with Zardozi embroidery", color: "Maroon", price: 42000, compare_at_price: 52000, description: "Heavy hand-embroidered groom's sherwani with matching stole and churidar. Made to order.", sizes: ["38","40","42","44","46","48"], image_url: null, is_featured: true },
  { id: "d12", title: "Groom's Bandhgala — Ivory Gold", slug: "grooms-bandhgala-ivory", category: "wedding", fabric: "Silk Blend with Handwork", color: "Ivory Gold", price: 31500, compare_at_price: null, description: "Regal bandhgala with hand-finished buttons and subtle gold thread work, tailored for the mandap.", sizes: ["38","40","42","44","46"], image_url: null, is_featured: false },
];

const CATEGORY_LABELS = {
  "kurta": "Kurta",
  "kurta-set": "Kurta Set",
  "sherwani": "Sherwani",
  "nehru-jacket": "Nehru Jacket",
  "dhoti": "Dhoti / Pyjama",
  "wedding": "Groom's Edit"
};

/* ---------------------------------------------------------
   State
   --------------------------------------------------------- */
const state = {
  products: [],
  filtered: [],
  activeFilter: "all",
  searchTerm: "",
  visibleCount: 8,
  pageSize: 8,
  cart: loadCart(),
  currentUser: null,
  quickViewProduct: null,
  quickViewQty: 1,
  quickViewSize: null,
  listingImageFile: null,
};

/* ---------------------------------------------------------
   Init
   --------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  // Each setup step runs in its own try/catch so that a problem in one
  // (e.g. a missing element, a blocked API) can't silently prevent the
  // others from wiring up their buttons.
  const steps = [
    ["bindHeaderEvents", bindHeaderEvents],
    ["bindDrawerEvents", bindDrawerEvents],
    ["bindQuickViewEvents", bindQuickViewEvents],
    ["bindAuthEvents", bindAuthEvents],
    ["bindListingEvents", bindListingEvents],
    ["bindFilterEvents", bindFilterEvents],
    ["bindNewsletterEvents", bindNewsletterEvents],
    ["setupScrollReveal", setupScrollReveal],
    ["renderCart", renderCart],
    ["loadProducts", loadProducts],
    ["loadCurrentUser", loadCurrentUser],
  ];

  steps.forEach(([name, fn]) => {
    try {
      fn();
    } catch (err) {
      console.error(`NV site: "${name}" failed to initialize —`, err);
    }
  });
});

/* ---------------------------------------------------------
   PRODUCTS: fetch + render
   --------------------------------------------------------- */
async function loadProducts() {
  const gridStatus = document.getElementById("gridStatus");
  if (gridStatus) gridStatus.textContent = "Loading the edit…";

  if (supabase) {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase product fetch failed, showing demo products:", error.message);
      state.products = DEMO_PRODUCTS;
    } else {
      state.products = (data && data.length) ? data : DEMO_PRODUCTS;
    }
  } else {
    state.products = DEMO_PRODUCTS;
  }

  applyFilters();
}

function applyFilters() {
  const term = state.searchTerm.trim().toLowerCase();
  state.filtered = state.products.filter((p) => {
    const matchesCategory = state.activeFilter === "all" || p.category === state.activeFilter;
    const matchesSearch = !term ||
      p.title.toLowerCase().includes(term) ||
      (p.fabric || "").toLowerCase().includes(term) ||
      (p.color || "").toLowerCase().includes(term) ||
      (p.category || "").toLowerCase().includes(term);
    return matchesCategory && matchesSearch;
  });
  state.visibleCount = state.pageSize;
  renderProductGrid();
}

function renderProductGrid() {
  const grid = document.getElementById("productGrid");
  const loadMoreBtn = document.getElementById("loadMoreBtn");
  if (!grid) return;

  grid.innerHTML = "";

  if (state.filtered.length === 0) {
    grid.innerHTML = `<div class="grid-status">Nothing here yet — try a different filter or search term.</div>`;
    if (loadMoreBtn) loadMoreBtn.hidden = true;
    return;
  }

  const visible = state.filtered.slice(0, state.visibleCount);

  visible.forEach((product, i) => {
    grid.appendChild(buildProductCard(product, i));
  });

  if (loadMoreBtn) {
    loadMoreBtn.hidden = state.visibleCount >= state.filtered.length;
  }
}

function buildProductCard(product, index) {
  const card = document.createElement("article");
  card.className = "product-card";
  card.style.animationDelay = `${Math.min(index, 8) * 0.05}s`;

  const onSale = product.compare_at_price && product.compare_at_price > product.price;

  card.innerHTML = `
    <div class="product-media" data-id="${product.id}">
      ${product.image_url
        ? `<img src="${escapeAttr(product.image_url)}" alt="${escapeAttr(product.title)}" loading="lazy">`
        : `<div class="product-monogram">${escapeHtml((product.title || "NV")[0])}</div>`}
      ${product.is_featured ? `<span class="product-badge">Featured</span>` : ""}
      <div class="product-quickadd">Quick View</div>
    </div>
    <h3 class="product-title">${escapeHtml(product.title)}</h3>
    <p class="product-fabric">${escapeHtml(product.fabric || CATEGORY_LABELS[product.category] || "")}</p>
    <p class="product-price">
      ${onSale ? `<span class="strike">${formatPrice(product.compare_at_price)}</span>` : ""}
      ${formatPrice(product.price)}
    </p>
  `;

  card.querySelector(".product-media").addEventListener("click", () => openQuickView(product));
  return card;
}

function formatPrice(value) {
  const num = Number(value || 0);
  return "₹" + num.toLocaleString("en-IN");
}

/* ---------------------------------------------------------
   FILTER CHIPS + CATEGORY RAIL + NAV LINKS
   --------------------------------------------------------- */
function bindFilterEvents() {
  document.getElementById("filterChips").addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    setActiveFilter(chip.dataset.filter);
  });

  document.querySelectorAll("[data-filter]").forEach((el) => {
    if (el.classList.contains("chip")) return;
    el.addEventListener("click", () => setActiveFilter(el.dataset.filter));
  });

  document.getElementById("loadMoreBtn").addEventListener("click", () => {
    state.visibleCount += state.pageSize;
    renderProductGrid();
  });
}

function setActiveFilter(filter) {
  state.activeFilter = filter;
  document.querySelectorAll(".chip").forEach((c) => {
    c.classList.toggle("is-active", c.dataset.filter === filter);
  });
  applyFilters();
  closeMobileNav();
}

/* ---------------------------------------------------------
   HEADER: search, mobile menu
   --------------------------------------------------------- */
function bindHeaderEvents() {
  const searchToggle = document.getElementById("searchToggle");
  const searchPanel = document.getElementById("searchPanel");
  const searchClose = document.getElementById("searchClose");
  const searchInput = document.getElementById("searchInput");

  searchToggle.addEventListener("click", () => {
    const isOpen = searchPanel.classList.toggle("open");
    searchToggle.setAttribute("aria-expanded", String(isOpen));
    if (isOpen) setTimeout(() => searchInput.focus(), 150);
  });
  searchClose.addEventListener("click", () => {
    searchPanel.classList.remove("open");
    searchToggle.setAttribute("aria-expanded", "false");
  });
  searchInput.addEventListener("input", (e) => {
    state.searchTerm = e.target.value;
    applyFilters();
  });
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      document.getElementById("featured").scrollIntoView({ behavior: "smooth" });
    }
  });

  const mobileMenuToggle = document.getElementById("mobileMenuToggle");
  const mobileNav = document.getElementById("mobileNav");
  const scrim = document.getElementById("scrim");
  mobileMenuToggle.addEventListener("click", () => {
    const isOpen = mobileNav.classList.toggle("open");
    scrim.classList.toggle("open", isOpen);
    mobileMenuToggle.setAttribute("aria-expanded", String(isOpen));
  });
  scrim.addEventListener("click", closeMobileNav);

  document.getElementById("accountToggle").addEventListener("click", openAuthModal);
}

function closeMobileNav() {
  document.getElementById("mobileNav").classList.remove("open");
  document.getElementById("scrim").classList.remove("open");
  document.getElementById("mobileMenuToggle").setAttribute("aria-expanded", "false");
}

/* ---------------------------------------------------------
   CART: storage, drawer, rendering
   --------------------------------------------------------- */
function loadCart() {
  try {
    return JSON.parse(localStorage.getItem("nv_cart")) || [];
  } catch {
    // localStorage can be unavailable (sandboxed preview, private browsing,
    // blocked storage). Fall back to an empty in-memory cart instead of
    // letting this throw and break the rest of the page's scripts.
    return [];
  }
}
function saveCart() {
  try {
    localStorage.setItem("nv_cart", JSON.stringify(state.cart));
  } catch {
    // Same as above — cart just won't persist across reloads in that case.
  }
}

/**
 * Saves the cart to localStorage always (fast, works offline/guest),
 * and mirrors it into Supabase's cart_items table when the shopper is
 * signed in, so their bag survives across devices and sessions.
 */
async function persistCart() {
  saveCart();
  if (!supabase || !state.currentUser) return;

  try {
    await supabase.from("cart_items").delete().eq("user_id", state.currentUser.id);
    if (state.cart.length > 0) {
      const rows = state.cart.map((i) => ({
        user_id: state.currentUser.id,
        product_id: typeof i.id === "string" && i.id.startsWith("d") ? null : i.id,
        title: i.title,
        price: i.price,
        image_url: i.image_url || null,
        size: i.size,
        quantity: i.qty,
      }));
      await supabase.from("cart_items").insert(rows);
    }
  } catch (err) {
    console.warn("Could not sync cart to Supabase:", err.message);
  }
}

/**
 * On sign-in, pulls the shopper's saved cart from Supabase and merges it
 * with whatever is currently in the local (guest) cart, so nothing is lost.
 */
async function syncCartOnSignIn() {
  if (!supabase || !state.currentUser) return;

  const { data, error } = await supabase
    .from("cart_items")
    .select("*")
    .eq("user_id", state.currentUser.id);

  if (error) {
    console.warn("Could not load saved cart:", error.message);
    return;
  }

  (data || []).forEach((row) => {
    const existing = state.cart.find((i) => (i.id === row.product_id || i.title === row.title) && i.size === row.size);
    if (existing) {
      existing.qty = Math.max(existing.qty, row.quantity);
    } else {
      state.cart.push({
        id: row.product_id || `remote-${row.id}`,
        title: row.title,
        price: row.price,
        image_url: row.image_url,
        size: row.size,
        qty: row.quantity,
      });
    }
  });

  renderCart();
  await persistCart();
}

function addToCart(product, qty, size) {
  const existing = state.cart.find((i) => i.id === product.id && i.size === size);
  if (existing) {
    existing.qty += qty;
  } else {
    state.cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      image_url: product.image_url,
      size: size || (product.sizes && product.sizes[0]) || "Free Size",
      qty,
    });
  }
  persistCart();
  renderCart();
  showToast(`Added "${product.title}" to your bag`);
  openCartDrawer();
}

function removeFromCart(id, size) {
  state.cart = state.cart.filter((i) => !(i.id === id && i.size === size));
  persistCart();
  renderCart();
}

function updateCartQty(id, size, delta) {
  const item = state.cart.find((i) => i.id === id && i.size === size);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(id, size);
  } else {
    persistCart();
    renderCart();
  }
}

function renderCart() {
  const body = document.getElementById("cartBody");
  const footer = document.getElementById("cartFooter");
  const countEl = document.getElementById("cartCount");
  const subtotalEl = document.getElementById("cartSubtotal");

  const totalQty = state.cart.reduce((sum, i) => sum + i.qty, 0);
  countEl.textContent = totalQty;
  countEl.classList.toggle("show", totalQty > 0);

  if (state.cart.length === 0) {
    body.innerHTML = `<p class="empty-state">Your bag is empty. Time to go weave some magic in. ✦</p>`;
    footer.hidden = true;
    return;
  }

  footer.hidden = false;
  body.innerHTML = "";
  let subtotal = 0;

  state.cart.forEach((item) => {
    subtotal += item.price * item.qty;
    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <div class="cart-item-media">
        ${item.image_url
          ? `<img src="${escapeAttr(item.image_url)}" alt="${escapeAttr(item.title)}">`
          : `<div class="product-monogram" style="font-size:1.6rem;">${escapeHtml(item.title[0])}</div>`}
      </div>
      <div class="cart-item-info">
        <h4>${escapeHtml(item.title)}</h4>
        <p class="cart-item-meta">Size: ${escapeHtml(item.size)} · ${formatPrice(item.price)}</p>
        <div class="cart-item-row">
          <div class="qty-stepper" data-id="${item.id}" data-size="${escapeAttr(item.size)}">
            <button type="button" class="qty-minus" aria-label="Decrease quantity">&minus;</button>
            <span>${item.qty}</span>
            <button type="button" class="qty-plus" aria-label="Increase quantity">+</button>
          </div>
          <button class="cart-item-remove" data-id="${item.id}" data-size="${escapeAttr(item.size)}">Remove</button>
        </div>
      </div>
    `;
    body.appendChild(row);
  });

  subtotalEl.textContent = formatPrice(subtotal);

  body.querySelectorAll(".qty-minus").forEach((btn) => {
    btn.addEventListener("click", () => {
      const wrap = btn.closest(".qty-stepper");
      updateCartQty(wrap.dataset.id, wrap.dataset.size, -1);
    });
  });
  body.querySelectorAll(".qty-plus").forEach((btn) => {
    btn.addEventListener("click", () => {
      const wrap = btn.closest(".qty-stepper");
      updateCartQty(wrap.dataset.id, wrap.dataset.size, 1);
    });
  });
  body.querySelectorAll(".cart-item-remove").forEach((btn) => {
    btn.addEventListener("click", () => removeFromCart(btn.dataset.id, btn.dataset.size));
  });
}

function bindDrawerEvents() {
  document.getElementById("cartToggle").addEventListener("click", openCartDrawer);
  document.getElementById("cartClose").addEventListener("click", closeCartDrawer);
  document.getElementById("cartScrim").addEventListener("click", closeCartDrawer);
  document.getElementById("checkoutBtn").addEventListener("click", handleCheckout);
}
function openCartDrawer() {
  document.getElementById("cartDrawer").classList.add("open");
  document.getElementById("cartScrim").classList.add("open");
}
function closeCartDrawer() {
  document.getElementById("cartDrawer").classList.remove("open");
  document.getElementById("cartScrim").classList.remove("open");
}

/* ---------------------------------------------------------
   CHECKOUT — writes an order + order_items into Supabase.
   Requires the shopper to be signed in.
   --------------------------------------------------------- */
async function handleCheckout() {
  if (state.cart.length === 0) return;

  if (!supabase) {
    showToast("Connect Supabase to enable checkout — see script.js setup notes.");
    return;
  }
  if (!state.currentUser) {
    showToast("Please sign in to checkout");
    closeCartDrawer();
    openAuthModal();
    return;
  }

  const subtotal = state.cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({ user_id: state.currentUser.id, status: "pending", total: subtotal })
    .select()
    .single();

  if (orderError) {
    showToast("Checkout failed: " + orderError.message);
    return;
  }

  const orderItems = state.cart.map((i) => ({
    order_id: order.id,
    product_id: typeof i.id === "string" && i.id.startsWith("d") ? null : i.id, // skip demo ids
    title: i.title,
    price: i.price,
    quantity: i.qty,
    size: i.size,
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

  if (itemsError) {
    showToast("Checkout failed: " + itemsError.message);
    return;
  }

  state.cart = [];
  saveCart();
  renderCart();
  closeCartDrawer();
  showToast("Order placed! We'll email you a confirmation.");
}

/* ---------------------------------------------------------
   QUICK VIEW MODAL
   --------------------------------------------------------- */
function bindQuickViewEvents() {
  document.getElementById("quickViewClose").addEventListener("click", closeQuickView);
  document.getElementById("quickViewScrim").addEventListener("click", closeQuickView);
  document.getElementById("qvQtyMinus").addEventListener("click", () => {
    state.quickViewQty = Math.max(1, state.quickViewQty - 1);
    document.getElementById("qvQty").textContent = state.quickViewQty;
  });
  document.getElementById("qvQtyPlus").addEventListener("click", () => {
    state.quickViewQty += 1;
    document.getElementById("qvQty").textContent = state.quickViewQty;
  });
  document.getElementById("qvAddToBag").addEventListener("click", () => {
    if (!state.quickViewProduct) return;
    addToCart(state.quickViewProduct, state.quickViewQty, state.quickViewSize);
    closeQuickView();
  });
}

function openQuickView(product) {
  state.quickViewProduct = product;
  state.quickViewQty = 1;
  state.quickViewSize = (product.sizes && product.sizes[0]) || "Free Size";

  document.getElementById("qvCategory").textContent = CATEGORY_LABELS[product.category] || product.category || "";
  document.getElementById("qvTitle").textContent = product.title;
  document.getElementById("qvPrice").textContent = formatPrice(product.price) +
    (product.compare_at_price ? "  " : "");
  document.getElementById("qvDesc").textContent = product.description || "";
  document.getElementById("qvQty").textContent = "1";

  document.getElementById("qvMedia").innerHTML = product.image_url
    ? `<img src="${escapeAttr(product.image_url)}" alt="${escapeAttr(product.title)}">`
    : `<div class="product-monogram">${escapeHtml((product.title || "NV")[0])}</div>`;

  document.getElementById("qvMeta").innerHTML = `
    <span>Fabric: ${escapeHtml(product.fabric || "—")}</span>
    <span>Colour: ${escapeHtml(product.color || "—")}</span>
  `;

  const sizesWrap = document.getElementById("qvSizes");
  sizesWrap.innerHTML = "";
  (product.sizes || ["Free Size"]).forEach((size) => {
    const pill = document.createElement("button");
    pill.type = "button";
    pill.className = "size-pill" + (size === state.quickViewSize ? " is-active" : "");
    pill.textContent = size;
    pill.addEventListener("click", () => {
      state.quickViewSize = size;
      sizesWrap.querySelectorAll(".size-pill").forEach((p) => p.classList.remove("is-active"));
      pill.classList.add("is-active");
    });
    sizesWrap.appendChild(pill);
  });

  document.getElementById("quickViewModal").classList.add("open");
  document.getElementById("quickViewModal").setAttribute("aria-hidden", "false");
  document.getElementById("quickViewScrim").classList.add("open");
}

function closeQuickView() {
  document.getElementById("quickViewModal").classList.remove("open");
  document.getElementById("quickViewModal").setAttribute("aria-hidden", "true");
  document.getElementById("quickViewScrim").classList.remove("open");
}

/* ---------------------------------------------------------
   AUTH — Supabase email/password.

   Any signed-in account can list products (see LISTING below) —
   there's no separate "admin" flag to configure. If you want to
   restrict listing to only yourself, re-introduce a profiles.is_admin
   check in checkListingAccess() below.
   --------------------------------------------------------- */
function bindAuthEvents() {
  document.getElementById("authClose").addEventListener("click", closeAuthModal);
  document.getElementById("authScrim").addEventListener("click", closeAuthModal);

  document.querySelectorAll(".auth-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".auth-tab").forEach((t) => t.classList.remove("is-active"));
      tab.classList.add("is-active");
      const isSignin = tab.dataset.tab === "signin";
      document.getElementById("signinForm").hidden = !isSignin;
      document.getElementById("signupForm").hidden = isSignin;
    });
  });

  document.getElementById("signinForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById("signinError");
    errorEl.textContent = "";
    if (!supabase) { errorEl.textContent = "Connect Supabase to enable sign in."; return; }

    const form = new FormData(e.target);
    const { error } = await supabase.auth.signInWithPassword({
      email: form.get("email"),
      password: form.get("password"),
    });
    if (error) { errorEl.textContent = error.message; return; }
    await loadCurrentUser();
    closeAuthModal();
    showToast("Welcome back!");
  });

  document.getElementById("signupForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById("signupError");
    errorEl.textContent = "";
    if (!supabase) { errorEl.textContent = "Connect Supabase to enable sign up."; return; }

    const form = new FormData(e.target);
    const { data, error } = await supabase.auth.signUp({
      email: form.get("email"),
      password: form.get("password"),
      options: { data: { full_name: form.get("fullName") } },
    });
    if (error) { errorEl.textContent = error.message; return; }

    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        full_name: form.get("fullName"),
      });
    }
    await loadCurrentUser();
    closeAuthModal();
    showToast("Account created — welcome to NV!");
  });

  document.getElementById("signOutBtn").addEventListener("click", async () => {
    if (supabase) await supabase.auth.signOut();
    state.currentUser = null;
    document.getElementById("listProductToggle").hidden = true;
    renderAuthState();
    showToast("Signed out");
  });
}

async function loadCurrentUser() {
  if (!supabase) return;
  const { data } = await supabase.auth.getUser();
  state.currentUser = data && data.user ? data.user : null;
  renderAuthState();

  // Listing is available to any signed-in account.
  document.getElementById("listProductToggle").hidden = !state.currentUser;

  if (state.currentUser) {
    await syncCartOnSignIn();
  }
}

function renderAuthState() {
  const signedOut = document.getElementById("authSignedOut");
  const signedIn = document.getElementById("authSignedIn");
  if (state.currentUser) {
    signedOut.hidden = true;
    signedIn.hidden = false;
    const name = state.currentUser.user_metadata && state.currentUser.user_metadata.full_name;
    document.getElementById("authUserName").textContent = name || state.currentUser.email || "there";
  } else {
    signedOut.hidden = false;
    signedIn.hidden = true;
  }
}

function openAuthModal() {
  document.getElementById("authModal").classList.add("open");
  document.getElementById("authModal").setAttribute("aria-hidden", "false");
  document.getElementById("authScrim").classList.add("open");
}
function closeAuthModal() {
  document.getElementById("authModal").classList.remove("open");
  document.getElementById("authModal").setAttribute("aria-hidden", "true");
  document.getElementById("authScrim").classList.remove("open");
}

/* ---------------------------------------------------------
   LISTING — "add a product" form, open to any signed-in shopper.
   Uploads the photo to Supabase Storage (bucket: product-images),
   then inserts a row into the products table.
   --------------------------------------------------------- */
function bindListingEvents() {
  document.getElementById("listProductToggle").addEventListener("click", openListingModal);
  document.getElementById("listingClose").addEventListener("click", closeListingModal);
  document.getElementById("listScrim").addEventListener("click", closeListingModal);

  document.getElementById("listingImage").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    state.listingImageFile = file;
    const preview = document.getElementById("uploadPreview");
    const placeholder = document.getElementById("uploadPlaceholder");
    preview.src = URL.createObjectURL(file);
    preview.hidden = false;
    placeholder.hidden = true;
  });

  document.getElementById("listingForm").addEventListener("submit", handleListingSubmit);
}

function openListingModal() {
  if (!state.currentUser) {
    showToast("Sign in first to list a product");
    openAuthModal();
    return;
  }
  document.getElementById("listingModal").classList.add("open");
  document.getElementById("listingModal").setAttribute("aria-hidden", "false");
  document.getElementById("listScrim").classList.add("open");
}
function closeListingModal() {
  document.getElementById("listingModal").classList.remove("open");
  document.getElementById("listingModal").setAttribute("aria-hidden", "true");
  document.getElementById("listScrim").classList.remove("open");
}

async function handleListingSubmit(e) {
  e.preventDefault();
  const errorEl = document.getElementById("listingError");
  const submitBtn = document.getElementById("listingSubmitBtn");
  errorEl.textContent = "";

  if (!supabase) { errorEl.textContent = "Connect Supabase to publish listings."; return; }
  if (!state.currentUser) { errorEl.textContent = "Please sign in to list a product."; return; }

  const form = new FormData(e.target);
  const sizes = Array.from(document.querySelectorAll('#sizeCheckGroup input:checked')).map((c) => c.value);
  if (sizes.length === 0) { errorEl.textContent = "Pick at least one available size."; return; }

  const title = form.get("title").trim();
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now().toString(36);

  submitBtn.disabled = true;
  submitBtn.textContent = "Publishing…";

  try {
    let imageUrl = null;
    if (state.listingImageFile) {
      const file = state.listingImageFile;
      const path = `${slug}-${file.name}`.replace(/\s+/g, "-");
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(path, file, { upsert: false });
      if (uploadError) throw new Error("Image upload failed: " + uploadError.message);

      const { data: publicUrlData } = supabase.storage.from("product-images").getPublicUrl(path);
      imageUrl = publicUrlData.publicUrl;
    }

    const newProduct = {
      title,
      slug,
      description: form.get("description") || "",
      category: form.get("category"),
      fabric: form.get("fabric") || "",
      color: form.get("color") || "",
      price: Number(form.get("price")),
      compare_at_price: form.get("compareAtPrice") ? Number(form.get("compareAtPrice")) : null,
      sizes,
      stock: Number(form.get("stock")) || 0,
      is_featured: form.get("isFeatured") === "on",
      image_url: imageUrl,
    };

    const { data: inserted, error: insertError } = await supabase
      .from("products")
      .insert(newProduct)
      .select()
      .single();

    if (insertError) throw new Error(insertError.message);

    state.products.unshift(inserted);
    applyFilters();
    closeListingModal();
    e.target.reset();
    document.getElementById("uploadPreview").hidden = true;
    document.getElementById("uploadPlaceholder").hidden = false;
    state.listingImageFile = null;
    showToast(`"${title}" is now live on the storefront`);
  } catch (err) {
    errorEl.textContent = err.message;
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Publish Listing";
  }
}

/* ---------------------------------------------------------
   NEWSLETTER — writes to a `subscribers` table
   --------------------------------------------------------- */
function bindNewsletterEvents() {
  document.getElementById("newsletterForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("newsletterEmail").value.trim();
    const note = document.getElementById("newsletterNote");
    if (!email) return;

    if (!supabase) {
      note.textContent = "Connect Supabase to store subscribers.";
      return;
    }
    const { error } = await supabase.from("subscribers").insert({ email });
    note.textContent = error
      ? (error.code === "23505" ? "You're already on the list ✦" : "Something went wrong — try again.")
      : "You're on the list ✦";
    if (!error) document.getElementById("newsletterForm").reset();
  });
}

/* ---------------------------------------------------------
   TOASTS
   --------------------------------------------------------- */
function showToast(message) {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}

/* ---------------------------------------------------------
   SCROLL REVEAL
   --------------------------------------------------------- */
function setupScrollReveal() {
  document.querySelectorAll(".category-rail, .craft, .newsletter").forEach((el) => el.classList.add("reveal"));
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}

/* ---------------------------------------------------------
   Utilities
   --------------------------------------------------------- */
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function escapeAttr(str) {
  return escapeHtml(str);
}
