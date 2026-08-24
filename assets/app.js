const cfg = window.NV_CONFIG || {};
const configured = cfg.SUPABASE_URL && !cfg.SUPABASE_URL.includes("YOUR_PROJECT") &&
                   cfg.SUPABASE_ANON_KEY && !cfg.SUPABASE_ANON_KEY.includes("YOUR_SUPABASE");
const sb = configured ? supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY) : null;

let products = [];
let cart = JSON.parse(localStorage.getItem("nv_cart") || "[]");
let currentCategory = "";

const $ = s => document.querySelector(s);
const money = n => `₹${Number(n).toLocaleString("en-IN")}`;

function toast(msg, error=false) {
  const el = $("#toast"); el.textContent = msg; el.className = error ? "show error" : "show";
  setTimeout(() => el.className = "", 2800);
}
function saveCart(){ localStorage.setItem("nv_cart", JSON.stringify(cart)); updateCartCount(); }
function updateCartCount(){ $("#cartCount").textContent = cart.reduce((a,x)=>a+x.qty,0); }

function imageUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${cfg.SUPABASE_URL}/storage/v1/object/public/product-images/${path}`;
}

async function loadProducts() {
  if (!sb) {
    $("#products").innerHTML = `<div class="setup"><h3>Connect Supabase to load products.</h3><p>Edit <b>assets/config.js</b> with your Supabase URL and anon/publishable key.</p></div>`;
    return;
  }
  const {data, error} = await sb.from("products").select("*").eq("active", true).order("created_at", {ascending:false});
  if (error) { $("#products").innerHTML = `<div class="setup">Could not load products. Check your Supabase tables and RLS policies.</div>`; console.error(error); return; }
  products = data || [];
  buildCategories();
  renderProducts();
}

function buildCategories() {
  const cats = [...new Set(products.map(p=>p.category).filter(Boolean))];
  $("#categories").innerHTML = `<button class="${currentCategory===""?"active":""}" data-category="">All</button>` +
    cats.map(c=>`<button class="${currentCategory===c?"active":""}" data-category="${escapeHtml(c)}">${escapeHtml(c)}</button>`).join("");
  $("#categories").querySelectorAll("button").forEach(b=>b.onclick=()=>{currentCategory=b.dataset.category;buildCategories();renderProducts();});
}

function renderProducts() {
  const list = currentCategory ? products.filter(p=>p.category===currentCategory) : products;
  if (!list.length) { $("#products").innerHTML="<div class='setup'>No products in this category yet.</div>"; return; }
  $("#products").innerHTML = list.map(p => `
    <article class="product">
      <button class="product-image" data-view="${p.id}">
        ${p.image_url ? `<img src="${imageUrl(p.image_url)}" alt="${escapeHtml(p.name)}">` : `<span>${escapeHtml(p.category||"NV")}</span>`}
      </button>
      <div class="product-body">
        <p class="muted">${escapeHtml(p.category||"Traditional wear")}</p>
        <h3>${escapeHtml(p.name)}</h3>
        <div class="product-bottom"><strong>${money(p.price)}</strong><span>${p.stock>0?p.stock+" available":"Sold out"}</span></div>
        <button class="button small" data-add="${p.id}" ${p.stock<=0?"disabled":""}>${p.stock>0?"Add to cart":"Sold out"}</button>
      </div>
    </article>`).join("");
  $("#products").querySelectorAll("[data-add]").forEach(b=>b.onclick=()=>addToCart(Number(b.dataset.add)));
  $("#products").querySelectorAll("[data-view]").forEach(b=>b.onclick=()=>showProduct(Number(b.dataset.view)));
}

function addToCart(id) {
  const p=products.find(x=>x.id===id); if(!p || p.stock<1)return;
  const item=cart.find(x=>x.id===id);
  if(item) item.qty=Math.min(item.qty+1,p.stock); else cart.push({id,qty:1});
  saveCart(); toast("Added to cart");
}

function cartItems(){ return cart.map(x=>({...x, product:products.find(p=>p.id===x.id)})).filter(x=>x.product); }

function openDrawer(html){ $("#drawerContent").innerHTML=html; $("#drawer").classList.add("open"); }
function closeOverlays(){ $("#drawer").classList.remove("open"); $("#modal").classList.remove("open"); }
document.querySelectorAll("[data-close]").forEach(x=>x.onclick=closeOverlays);

function showCart() {
  const items=cartItems(), total=items.reduce((a,x)=>a+x.product.price*x.qty,0);
  openDrawer(`<p class="eyebrow">YOUR SELECTION</p><h2>Your cart</h2>
    ${items.length ? items.map(x=>`<div class="cart-item">
      <div class="mini">${x.product.image_url?`<img src="${imageUrl(x.product.image_url)}">`:x.product.category}</div>
      <div><h3>${escapeHtml(x.product.name)}</h3><p>${money(x.product.price)}</p>
      <div class="qty"><button data-minus="${x.id}">−</button><span>${x.qty}</span><button data-plus="${x.id}">+</button></div></div>
      <strong>${money(x.product.price*x.qty)}</strong></div>`).join("")+
      `<div class="cart-total"><span>Total</span><strong>${money(total)}</strong></div>
       <button class="button full" id="checkoutBtn">Checkout</button>`
      : `<div class="empty"><h3>Your cart is empty.</h3><p>Add something from the NV collection.</p></div>`}`);
  $("#drawerContent").querySelectorAll("[data-minus]").forEach(b=>b.onclick=()=>changeQty(Number(b.dataset.minus),-1));
  $("#drawerContent").querySelectorAll("[data-plus]").forEach(b=>b.onclick=()=>changeQty(Number(b.dataset.plus),1));
  const checkout=$("#checkoutBtn"); if(checkout) checkout.onclick=checkoutFlow;
}

function changeQty(id,delta){
  const item=cart.find(x=>x.id===id), p=products.find(x=>x.id===id); if(!item)return;
  item.qty+=delta; if(item.qty<=0)cart=cart.filter(x=>x.id!==id); else item.qty=Math.min(item.qty,p.stock);
  saveCart(); showCart();
}

async function checkoutFlow(){
  if(!sb){toast("Connect Supabase first.",true);return;}
  const {data:{user}}=await sb.auth.getUser();
  if(!user){closeOverlays();showAuth("login","Please sign in before checkout.");return;}
  if(!cart.length)return;
  const items=cartItems();
  const orderRows=items.map(x=>({user_id:user.id,product_id:x.id,quantity:x.qty,unit_price:x.product.price}));
  const {error}=await sb.from("order_items").insert(orderRows);
  if(error){toast("Checkout setup error. See Supabase policies.",true);console.error(error);return;}
  cart=[];saveCart();closeOverlays();toast("Order placed successfully.");
}

function showProduct(id){
  const p=products.find(x=>x.id===id); if(!p)return;
  $("#modalContent").innerHTML=`<div class="detail">
    <div class="detail-img">${p.image_url?`<img src="${imageUrl(p.image_url)}">`:`<span>${escapeHtml(p.category||"NV")}</span>`}</div>
    <div><p class="eyebrow">${escapeHtml(p.category||"Traditional wear")}</p><h2>${escapeHtml(p.name)}</h2><div class="detail-price">${money(p.price)}</div>
    <p>${escapeHtml(p.description||"A refined NV traditional menswear piece.")}</p>
    <p class="muted">Sizes: ${escapeHtml(p.sizes||"S, M, L, XL, XXL")}</p>
    <button class="button" onclick="addToCart(${p.id});closeOverlays()">Add to cart</button></div></div>`;
  $("#modal").classList.add("open");
}

function showAuth(mode="login", message=""){
  $("#modalContent").innerHTML=`<div class="auth"><p class="eyebrow">NV ACCOUNT</p><h2>${mode==="login"?"Welcome back":"Create your account"}</h2>${message?`<p class="notice">${escapeHtml(message)}</p>`:""}
  <form id="authForm"><input name="email" type="email" placeholder="Email" required><input name="password" type="password" placeholder="Password" minlength="6" required>
  ${mode==="signup"?`<input name="name" placeholder="Full name" required>`:""}<button class="button full">${mode==="login"?"Sign in":"Create account"}</button></form>
  <button class="text-button" id="switchAuth">${mode==="login"?"New to NV? Create an account":"Already have an account? Sign in"}</button></div>`;
  $("#modal").classList.add("open");
  $("#switchAuth").onclick=()=>showAuth(mode==="login"?"signup":"login");
  $("#authForm").onsubmit=async e=>{e.preventDefault(); const f=new FormData(e.target); 
    if(mode==="login"){const {error}=await sb.auth.signInWithPassword({email:f.get("email"),password:f.get("password")});if(error)toast(error.message,true);else{closeOverlays();toast("Signed in.");}}
    else {const {data,error}=await sb.auth.signUp({email:f.get("email"),password:f.get("password"),options:{data:{full_name:f.get("name")}}});if(error)toast(error.message,true);else{closeOverlays();toast("Account created. Check your email if confirmation is enabled.");}}
  };
}

async function account(){
  if(!sb){showAuth("login","Supabase is not configured.");return;}
  const {data:{user}}=await sb.auth.getUser();
  if(user){
    const isAdmin=cfg.ADMIN_EMAIL && user.email.toLowerCase()===cfg.ADMIN_EMAIL.toLowerCase();
    openDrawer(`<p class="eyebrow">ACCOUNT</p><h2>${escapeHtml(user.user_metadata?.full_name||"NV Customer")}</h2><p>${escapeHtml(user.email)}</p>
      ${isAdmin?`<button class="button full" id="adminBtn">Open admin panel</button>`:""}
      <button class="button secondary full" id="signout">Sign out</button>`);
    $("#signout").onclick=async()=>{await sb.auth.signOut();closeOverlays();toast("Signed out.");};
    if(isAdmin)$("#adminBtn").onclick=showAdmin;
  } else showAuth();
}

async function showAdmin(){
  const {data:{user}}=await sb.auth.getUser();
  if(!user || user.email.toLowerCase()!==String(cfg.ADMIN_EMAIL).toLowerCase()){toast("Admin access denied.",true);return;}
  openDrawer(`<p class="eyebrow">NV ADMIN</p><h2>Add product</h2>
    <form id="productForm" class="admin-form">
      <input name="name" placeholder="Product name" required><input name="category" placeholder="Category" required>
      <textarea name="description" placeholder="Description"></textarea>
      <div class="two"><input name="price" type="number" min="0" step=".01" placeholder="Price" required><input name="stock" type="number" min="0" placeholder="Stock" required></div>
      <input name="sizes" value="S,M,L,XL,XXL" placeholder="Sizes">
      <input name="image" type="file" accept="image/png,image/jpeg,image/webp" required>
      <button class="button full">Publish product</button>
    </form>
    <p class="muted">Products published here become visible in the public collection.</p>`);
  $("#productForm").onsubmit=publishProduct;
}

async function publishProduct(e){
  e.preventDefault(); const f=new FormData(e.target), file=f.get("image");
  const filename=`${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g,"")}`;
  const up=await sb.storage.from("product-images").upload(filename,file,{upsert:false});
  if(up.error){toast(up.error.message,true);return;}
  const {error}=await sb.from("products").insert({name:f.get("name"),category:f.get("category"),description:f.get("description"),price:Number(f.get("price")),stock:Number(f.get("stock")),sizes:f.get("sizes"),image_url:filename,active:true});
  if(error){await sb.storage.from("product-images").remove([filename]);toast(error.message,true);return;}
  toast("Product published."); e.target.reset(); await loadProducts();
}

function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}

$("#cartBtn").onclick=showCart;
$("#accountBtn").onclick=account;
updateCartCount();
loadProducts();
