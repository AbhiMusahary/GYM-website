import React, { useState, useMemo } from "react";
import {
  Dumbbell, ShoppingCart, Search, Plus, Minus, Trash2, X,
  LayoutDashboard, Package, ClipboardList, DollarSign, Boxes,
  Clock, CheckCircle2, Store, ShieldCheck, MapPin, Phone,
  User, Banknote, AlertTriangle, LogOut, Lock, Mail, Shirt, Upload,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  NOTE ON PERSISTENCE                                                */
/*  Claude.ai artifacts run in a sandbox that blocks localStorage /     */
/*  sessionStorage, so this build keeps everything (products, cart,    */
/*  orders, customer accounts, login sessions) in React state. Data    */
/*  survives perfectly while you use the app, but resets on a full     */
/*  page refresh inside this preview.                                  */
/*                                                                      */
/*  To get real cross-refresh persistence, copy this component into    */
/*  your own project (Vite / CRA / Next) and wrap each useState in a   */
/*  read-on-load + save-on-change pair, e.g.:                          */
/*                                                                      */
/*  const [products, setProducts] = useState(() => {                   */
/*    const saved = localStorage.getItem("gym_products");              */
/*    return saved ? JSON.parse(saved) : DEFAULT_PRODUCTS;              */
/*  });                                                                 */
/*  useEffect(() => {                                                   */
/*    localStorage.setItem("gym_products", JSON.stringify(products));   */
/*  }, [products]);                                                     */
/*  (repeat for cart, orders, customers, currentCustomer)               */
/*                                                                      */
/*  SECURITY NOTE                                                       */
/*  The admin credential and customer passwords below live in plain    */
/*  client-side state/constants for demo purposes only. Anyone with    */
/*  browser dev tools can read them. A real deployment needs a real    */
/*  backend: hashed passwords, server-side sessions, and an API that   */
/*  actually enforces who can see admin data — client-side checks can  */
/*  always be bypassed.                                                */
/* ------------------------------------------------------------------ */

const CATEGORIES = ["Clothes", "Protein Supplements", "Gym Equipment"];

const ADMIN_CREDENTIALS = { username: "admin", password: "admin123" };

const DEFAULT_CUSTOMERS = [
  {
    id: "cust-1",
    name: "Alex Rivera",
    email: "demo@ironpulse.test",
    password: "demo1234",
    phone: "+1 555 010 2020",
  },
];

// Product photos are real, freely-licensed stock photos hotlinked from Pexels
// (images.pexels.com — free to use under the Pexels License, no attribution
// required). Swap any `image` URL for your own product photography later.
const DEFAULT_PRODUCTS = [
  // ---- Protein Supplements ----
  {
    id: "prod-1",
    name: "Whey Protein Powder (Chocolate, 2kg)",
    category: "Protein Supplements",
    price: 3499,
    description: "Fast-absorbing 24g protein per scoop to fuel recovery after every session.",
    image: "https://images.pexels.com/photos/13779116/pexels-photo-13779116.jpeg?auto=compress&cs=tinysrgb&w=800",
    stock: 42,
  },
  {
    id: "prod-2",
    name: "Energy Protein Bars (Box of 12)",
    category: "Protein Supplements",
    price: 899,
    description: "Chewy, high-protein bars with 20g protein and zero added sugar for on-the-go fuel.",
    image: "https://images.pexels.com/photos/17763560/pexels-photo-17763560.jpeg?auto=compress&cs=tinysrgb&w=800",
    stock: 65,
  },
  {
    id: "prod-7",
    name: "Creatine Monohydrate (300g)",
    category: "Protein Supplements",
    price: 1299,
    description: "Pure micronized creatine to support strength, power, and muscle recovery.",
    image: "https://images.pexels.com/photos/13779103/pexels-photo-13779103.jpeg?auto=compress&cs=tinysrgb&w=800",
    stock: 38,
  },
  {
    id: "prod-8",
    name: "BCAA Energy Powder (Watermelon)",
    category: "Protein Supplements",
    price: 1599,
    description: "Branched-chain aminos plus a light caffeine kick for recovery and focus.",
    image: "https://images.pexels.com/photos/13787643/pexels-photo-13787643.jpeg?auto=compress&cs=tinysrgb&w=800",
    stock: 6,
  },
  {
    id: "prod-9",
    name: "Pre-Workout Igniter (30 Servings)",
    category: "Protein Supplements",
    price: 1999,
    description: "Explosive energy and pump formula built for max-intensity training.",
    image: "https://images.pexels.com/photos/13779108/pexels-photo-13779108.jpeg?auto=compress&cs=tinysrgb&w=800",
    stock: 0,
  },
  // ---- Clothes ----
  {
    id: "prod-3",
    name: "Performance Training Tee",
    category: "Clothes",
    price: 799,
    description: "Moisture-wicking fabric that keeps you cool through the toughest sets.",
    image: "https://images.pexels.com/photos/4162591/pexels-photo-4162591.jpeg?auto=compress&cs=tinysrgb&w=800",
    stock: 30,
  },
  {
    id: "prod-10",
    name: "Compression Leggings",
    category: "Clothes",
    price: 1499,
    description: "Second-skin compression fit with four-way stretch for full range of motion.",
    image: "https://images.pexels.com/photos/3844000/pexels-photo-3844000.jpeg?auto=compress&cs=tinysrgb&w=800",
    stock: 22,
  },
  {
    id: "prod-11",
    name: "Seamless Sports Bra",
    category: "Clothes",
    price: 999,
    description: "Breathable, high-support seamless knit built for high-intensity training.",
    image: "https://images.pexels.com/photos/3927383/pexels-photo-3927383.jpeg?auto=compress&cs=tinysrgb&w=800",
    stock: 18,
  },
  {
    id: "prod-12",
    name: "Training Shorts",
    category: "Clothes",
    price: 699,
    description: "Quick-dry shorts with a built-in liner for lifting and cardio days.",
    image: "https://images.pexels.com/photos/4004222/pexels-photo-4004222.jpeg?auto=compress&cs=tinysrgb&w=800",
    stock: 27,
  },
  // ---- Gym Equipment ----
  {
    id: "prod-4",
    name: "Shaker Bottle 700ml",
    category: "Gym Equipment",
    price: 349,
    description: "Leak-proof shaker with a built-in mixer ball for smooth blends on the go.",
    image: "https://images.pexels.com/photos/28455336/pexels-photo-28455336.jpeg?auto=compress&cs=tinysrgb&w=800",
    stock: 8,
  },
  {
    id: "prod-5",
    name: "Adjustable Dumbbell Pair (5–25 lb)",
    category: "Gym Equipment",
    price: 6999,
    description: "Space-saving dumbbells that adjust in seconds for any exercise.",
    image: "https://images.pexels.com/photos/4162451/pexels-photo-4162451.jpeg?auto=compress&cs=tinysrgb&w=800",
    stock: 15,
  },
  {
    id: "prod-13",
    name: "Hex Dumbbell Set (Pair)",
    category: "Gym Equipment",
    price: 2999,
    description: "Rubber-coated hex dumbbells that won't roll or damage your floor.",
    image: "https://images.pexels.com/photos/16513597/pexels-photo-16513597.jpeg?auto=compress&cs=tinysrgb&w=800",
    stock: 20,
  },
  {
    id: "prod-6",
    name: "Resistance Bands Set (5pc)",
    category: "Gym Equipment",
    price: 799,
    description: "Five resistance levels for strength, mobility, and warm-ups anywhere.",
    image: "https://images.pexels.com/photos/16695681/pexels-photo-16695681.jpeg?auto=compress&cs=tinysrgb&w=800",
    stock: 40,
  },
  {
    id: "prod-14",
    name: "Yoga & Exercise Mat",
    category: "Gym Equipment",
    price: 899,
    description: "Extra-thick non-slip mat built for lifting, stretching, and floor work.",
    image: "https://images.pexels.com/photos/4793328/pexels-photo-4793328.jpeg?auto=compress&cs=tinysrgb&w=800",
    stock: 33,
  },
];

const CATEGORY_ICONS = { Clothes: Shirt, "Protein Supplements": Package, "Gym Equipment": Dumbbell };

const formatPrice = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
const genId = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

export default function GymFitnessApp() {
  const [view, setView] = useState("customer"); // "customer" | "admin"
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [cart, setCart] = useState([]); // [{ productId, qty }]
  const [orders, setOrders] = useState([]);
  const [toast, setToast] = useState(null);

  // customer accounts
  const [customers, setCustomers] = useState(DEFAULT_CUSTOMERS);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [customerAuthMode, setCustomerAuthMode] = useState("login"); // "login" | "signup"
  const [customerAuthForm, setCustomerAuthForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [customerAuthError, setCustomerAuthError] = useState("");
  const [customerTab, setCustomerTab] = useState("shop"); // "shop" | "orders"

  // customer shopping UI state
  const [search, setSearch] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    name: "", phone: "", address: "", payment: "Cash on Delivery",
  });

  // admin auth + UI state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminAuthForm, setAdminAuthForm] = useState({ username: "", password: "" });
  const [adminAuthError, setAdminAuthError] = useState("");
  const [adminTab, setAdminTab] = useState("dashboard"); // dashboard | products | orders
  const [productForm, setProductForm] = useState({
    name: "", category: CATEGORIES[0], price: "", image: "", stock: "", description: "",
  });

  function showToast(message) {
    setToast({ message });
    setTimeout(() => setToast(null), 2800);
  }

  /* ---------- derived data ---------- */
  const productMap = useMemo(
    () => Object.fromEntries(products.map((p) => [p.id, p])),
    [products]
  );

  const searchedProducts = useMemo(
    () => products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())),
    [products, search]
  );
  const productsByCategory = useMemo(() => {
    const map = {};
    for (const cat of CATEGORIES) map[cat] = searchedProducts.filter((p) => p.category === cat);
    return map;
  }, [searchedProducts]);

  const cartDetailed = useMemo(
    () => cart.map((i) => ({ ...i, product: productMap[i.productId] })).filter((i) => i.product),
    [cart, productMap]
  );
  const cartTotal = useMemo(
    () => cartDetailed.reduce((sum, i) => sum + i.product.price * i.qty, 0),
    [cartDetailed]
  );
  const cartCount = useMemo(() => cart.reduce((sum, i) => sum + i.qty, 0), [cart]);

  const totalSales = useMemo(() => orders.reduce((sum, o) => sum + o.total, 0), [orders]);
  const totalOrders = orders.length;
  const activeInventoryCount = useMemo(
    () => products.filter((p) => p.stock > 0).length,
    [products]
  );
  const pendingOrdersCount = useMemo(
    () => orders.filter((o) => o.status === "Pending").length,
    [orders]
  );

  const myOrders = useMemo(
    () => (currentCustomer ? orders.filter((o) => o.customerEmail === currentCustomer.email) : []),
    [orders, currentCustomer]
  );

  /* ---------- customer auth actions ---------- */
  function handleCustomerSignup(e) {
    e.preventDefault();
    const { name, email, password, phone } = customerAuthForm;
    if (!name.trim() || !email.trim() || !password || !phone.trim()) {
      setCustomerAuthError("Please fill in all fields.");
      return;
    }
    const emailLower = email.trim().toLowerCase();
    if (customers.some((c) => c.email.toLowerCase() === emailLower)) {
      setCustomerAuthError("An account with this email already exists — log in instead.");
      return;
    }
    const newCustomer = {
      id: genId("cust"),
      name: name.trim(),
      email: email.trim(),
      password,
      phone: phone.trim(),
    };
    setCustomers((prev) => [...prev, newCustomer]);
    setCurrentCustomer(newCustomer);
    setCheckoutForm({ name: newCustomer.name, phone: newCustomer.phone, address: "", payment: "Cash on Delivery" });
    setCustomerAuthForm({ name: "", email: "", password: "", phone: "" });
    setCustomerAuthError("");
  }

  function handleCustomerLogin(e) {
    e.preventDefault();
    const { email, password } = customerAuthForm;
    const found = customers.find(
      (c) => c.email.toLowerCase() === email.trim().toLowerCase() && c.password === password
    );
    if (!found) {
      setCustomerAuthError("Invalid email or password.");
      return;
    }
    setCurrentCustomer(found);
    setCheckoutForm({ name: found.name, phone: found.phone, address: "", payment: "Cash on Delivery" });
    setCustomerAuthForm({ name: "", email: "", password: "", phone: "" });
    setCustomerAuthError("");
  }

  function handleCustomerLogout() {
    setCurrentCustomer(null);
    setCart([]);
    setCustomerTab("shop");
    setCustomerAuthMode("login");
    setCustomerAuthForm({ name: "", email: "", password: "", phone: "" });
    setCustomerAuthError("");
  }

  /* ---------- admin auth actions ---------- */
  function handleAdminLogin(e) {
    e.preventDefault();
    if (
      adminAuthForm.username === ADMIN_CREDENTIALS.username &&
      adminAuthForm.password === ADMIN_CREDENTIALS.password
    ) {
      setIsAdminAuthenticated(true);
      setAdminAuthForm({ username: "", password: "" });
      setAdminAuthError("");
    } else {
      setAdminAuthError("Invalid username or password.");
    }
  }

  function handleAdminLogout() {
    setIsAdminAuthenticated(false);
    setAdminAuthForm({ username: "", password: "" });
    setAdminTab("dashboard");
  }

  /* ---------- cart actions ---------- */
  function addToCart(productId) {
    const product = productMap[productId];
    if (!product || product.stock <= 0) return;
    const existing = cart.find((i) => i.productId === productId);
    const currentQty = existing ? existing.qty : 0;

    if (currentQty >= product.stock) {
      showToast(`Only ${product.stock} in stock`);
      return;
    }
    setCart((prev) => {
      const ex = prev.find((i) => i.productId === productId);
      if (ex) return prev.map((i) => (i.productId === productId ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { productId, qty: 1 }];
    });
    showToast(`${product.name} added to cart`);
  }

  function updateQty(productId, delta) {
    setCart((prev) =>
      prev.map((i) => {
        if (i.productId !== productId) return i;
        const product = productMap[productId];
        const newQty = Math.min(product.stock, Math.max(1, i.qty + delta));
        return { ...i, qty: newQty };
      })
    );
  }

  function removeFromCart(productId) {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  }

  function submitOrder(e) {
    e.preventDefault();
    if (!currentCustomer) return;
    if (!checkoutForm.name.trim() || !checkoutForm.phone.trim() || !checkoutForm.address.trim()) return;
    if (cartDetailed.length === 0) return;

    const orderId = `ORD-${1000 + orders.length + 1}`;
    const items = cartDetailed.map((i) => ({
      productId: i.productId,
      name: i.product.name,
      price: i.product.price,
      qty: i.qty,
    }));

    const newOrder = {
      id: orderId,
      customerEmail: currentCustomer.email,
      customerName: checkoutForm.name.trim(),
      phone: checkoutForm.phone.trim(),
      address: checkoutForm.address.trim(),
      payment: checkoutForm.payment,
      items,
      total: cartTotal,
      status: "Pending",
      createdAt: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);
    setProducts((prev) =>
      prev.map((p) => {
        const found = items.find((i) => i.productId === p.id);
        return found ? { ...p, stock: Math.max(0, p.stock - found.qty) } : p;
      })
    );

    setCart([]);
    setCheckoutForm({ name: currentCustomer.name, phone: currentCustomer.phone, address: "", payment: "Cash on Delivery" });
    setCheckoutOpen(false);
    setCartOpen(false);
    showToast(`Order ${orderId} placed successfully!`);
  }

  /* ---------- admin actions ---------- */
  function handleImageUpload(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setProductForm((prev) => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
    e.target.value = ""; // allow re-selecting the same file later
  }

  function addProduct(e) {
    e.preventDefault();
    if (!productForm.name.trim() || productForm.price === "" || productForm.stock === "") return;
    const newProduct = {
      id: genId("prod"),
      name: productForm.name.trim(),
      category: productForm.category,
      price: parseFloat(productForm.price),
      description: productForm.description.trim(),
      image:
        productForm.image.trim() ||
        `https://placehold.co/400x400/18181b/a3e635?text=${encodeURIComponent(productForm.name.trim())}`,
      stock: parseInt(productForm.stock, 10),
    };
    setProducts((prev) => [newProduct, ...prev]);
    setProductForm({ name: "", category: CATEGORIES[0], price: "", image: "", stock: "", description: "" });
  }

  function updateStock(productId, newStock) {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: Math.max(0, newStock) } : p))
    );
  }

  function deleteProduct(productId) {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  }

  function updateOrderStatus(orderId, status) {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
  }

  /* ------------------------------------------------------------------ */

  return (
    <div className="font-body min-h-screen bg-zinc-950 text-zinc-100">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700;800;900&display=swap');
        .font-body { font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif; }
        .font-display { font-family: 'Bebas Neue', ui-sans-serif, system-ui, sans-serif; letter-spacing: 0.03em; }
        .hazard-stripe {
          background-image: repeating-linear-gradient(135deg, #f97316 0px, #f97316 10px, #18181b 10px, #18181b 20px);
        }
      `}</style>

      {/* ---------------- NAV ---------------- */}
      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-lime-400">
              <Dumbbell className="h-5 w-5 text-zinc-950" strokeWidth={2.5} />
            </div>
            <span className="font-display text-2xl leading-none tracking-wide">
              IRON<span className="text-lime-400">PULSE</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-full border border-zinc-800 bg-zinc-900 p-1">
              <button
                onClick={() => setView("customer")}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                  view === "customer" ? "bg-lime-400 text-zinc-950" : "text-zinc-400 hover:text-zinc-100"
                }`}
              >
                <Store className="h-4 w-4" /> <span className="hidden sm:inline">Storefront</span>
              </button>
              <button
                onClick={() => setView("admin")}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                  view === "admin" ? "bg-lime-400 text-zinc-950" : "text-zinc-400 hover:text-zinc-100"
                }`}
              >
                <ShieldCheck className="h-4 w-4" /> <span className="hidden sm:inline">Admin Portal</span>
              </button>
            </div>

            {view === "customer" && currentCustomer && (
              <button
                onClick={() => setCartOpen(true)}
                className="relative flex h-9 w-9 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 hover:border-lime-400"
              >
                <ShoppingCart className="h-4 w-4" />
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ---------------- MAIN ---------------- */}
      <main className="mx-auto max-w-7xl px-4 py-6">
        {view === "customer" ? (
          !currentCustomer ? (
            <CustomerAuthScreen
              mode={customerAuthMode}
              setMode={setCustomerAuthMode}
              form={customerAuthForm}
              setForm={setCustomerAuthForm}
              error={customerAuthError}
              onLogin={handleCustomerLogin}
              onSignup={handleCustomerSignup}
            />
          ) : (
            <section>
              <div className="mb-6 flex flex-col gap-3 border-b border-zinc-800 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={() => setCustomerTab("shop")}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                      customerTab === "shop" ? "bg-lime-400 text-zinc-950" : "border border-zinc-800 text-zinc-400 hover:text-zinc-100"
                    }`}
                  >
                    <Store className="h-4 w-4" /> Shop
                  </button>
                  <button
                    onClick={() => setCustomerTab("orders")}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                      customerTab === "orders" ? "bg-lime-400 text-zinc-950" : "border border-zinc-800 text-zinc-400 hover:text-zinc-100"
                    }`}
                  >
                    <ClipboardList className="h-4 w-4" /> My Orders{myOrders.length > 0 ? ` (${myOrders.length})` : ""}
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-zinc-400">
                    Hi, <span className="font-semibold text-zinc-100">{currentCustomer.name.split(" ")[0]}</span>
                  </span>
                  <button
                    onClick={handleCustomerLogout}
                    className="flex items-center gap-1.5 rounded-full border border-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-400 hover:border-red-400 hover:text-red-400"
                  >
                    <LogOut className="h-3.5 w-3.5" /> Logout
                  </button>
                </div>
              </div>

              {customerTab === "shop" && (
                <>
                  <div className="mb-6 overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950">
                    <div className="hazard-stripe h-1.5 w-full" />
                    <div className="p-6 sm:p-8">
                      <p className="text-xs font-bold uppercase tracking-widest text-orange-400">
                        This Week's Restock
                      </p>
                      <h1 className="font-display mt-1 text-4xl tracking-wide sm:text-5xl">
                        Fuel The <span className="text-lime-400">Grind.</span>
                      </h1>
                      <p className="mt-2 max-w-md text-sm text-zinc-400">
                        Clothes, protein supplements, and gym equipment — delivered to your door.
                      </p>
                    </div>
                  </div>

                  <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative w-full sm:max-w-xs">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search products..."
                        className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-2 pl-9 pr-3 text-sm outline-none focus:border-lime-400"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map((cat) => (
                        <a
                          key={cat}
                          href={`#section-${cat.toLowerCase().replace(/\s+/g, "-")}`}
                          className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition hover:border-lime-400 hover:text-lime-400"
                        >
                          {cat}
                        </a>
                      ))}
                    </div>
                  </div>

                  {searchedProducts.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-zinc-800 py-16 text-center text-zinc-500">
                      No matches. Try a different search term.
                    </div>
                  ) : (
                    CATEGORIES.map((cat) => {
                      const items = productsByCategory[cat];
                      if (!items || items.length === 0) return null;
                      const Icon = CATEGORY_ICONS[cat] || Package;
                      return (
                        <section
                          key={cat}
                          id={`section-${cat.toLowerCase().replace(/\s+/g, "-")}`}
                          className="mb-10 scroll-mt-20"
                        >
                          <div className="mb-4 flex items-center gap-2 border-b border-zinc-800 pb-3">
                            <Icon className="h-5 w-5 text-lime-400" />
                            <h2 className="font-display text-2xl tracking-wide">{cat}</h2>
                            <span className="text-xs text-zinc-500">({items.length})</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                            {items.map((p) => (
                              <ProductCard key={p.id} product={p} onAdd={() => addToCart(p.id)} />
                            ))}
                          </div>
                        </section>
                      );
                    })
                  )}
                </>
              )}

              {customerTab === "orders" && (
                <div className="flex flex-col gap-3">
                  {myOrders.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-zinc-800 py-16 text-center text-zinc-500">
                      You haven't placed any orders yet — head to Shop to get started.
                    </div>
                  ) : (
                    myOrders.map((o) => (
                      <div key={o.id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-mono text-xs font-bold text-lime-400">{o.id}</p>
                            <p className="mt-1 text-xs text-zinc-500">{new Date(o.createdAt).toLocaleString()}</p>
                          </div>
                          <span
                            className={`rounded-full border px-2 py-1 text-xs font-bold ${
                              o.status === "Completed"
                                ? "border-lime-400 bg-lime-400/10 text-lime-400"
                                : "border-orange-400 bg-orange-400/10 text-orange-400"
                            }`}
                          >
                            {o.status}
                          </span>
                        </div>
                        <ul className="mt-3 space-y-0.5 text-sm text-zinc-400">
                          {o.items.map((it) => (
                            <li key={it.productId}>
                              {it.name} <span className="text-zinc-600">×{it.qty}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-3 flex items-center justify-between border-t border-zinc-800 pt-2">
                          <span className="text-xs text-zinc-500">{o.payment}</span>
                          <span className="font-display text-xl text-lime-400">{formatPrice(o.total)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </section>
          )
        ) : !isAdminAuthenticated ? (
          <AdminLoginScreen
            form={adminAuthForm}
            setForm={setAdminAuthForm}
            error={adminAuthError}
            onSubmit={handleAdminLogin}
          />
        ) : (
          <section>
            <div className="mb-6 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
              <div className="hazard-stripe h-1.5 w-full" />
              <div className="flex items-center justify-between p-5">
                <div>
                  <h1 className="font-display text-3xl tracking-wide">
                    Admin <span className="text-lime-400">Portal</span>
                  </h1>
                  <p className="mt-1 text-sm text-zinc-500">
                    Manage inventory and monitor customer orders in real time.
                  </p>
                </div>
                <button
                  onClick={handleAdminLogout}
                  className="flex shrink-0 items-center gap-1.5 rounded-full border border-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-400 hover:border-red-400 hover:text-red-400"
                >
                  <LogOut className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>

            <div className="mb-6 flex gap-2 border-b border-zinc-800">
              {[
                { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
                { key: "products", label: "Products", icon: Package },
                { key: "orders", label: "Orders", icon: ClipboardList },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setAdminTab(tab.key)}
                  className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-semibold transition ${
                    adminTab === tab.key
                      ? "border-lime-400 text-lime-400"
                      : "border-transparent text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <tab.icon className="h-4 w-4" /> {tab.label}
                </button>
              ))}
            </div>

            {adminTab === "dashboard" && (
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  <SummaryCard icon={DollarSign} label="Total Sales" value={formatPrice(totalSales)} accent="bg-lime-400" />
                  <SummaryCard icon={ClipboardList} label="Total Orders" value={totalOrders} accent="bg-orange-400" />
                  <SummaryCard icon={Boxes} label="Active Inventory" value={activeInventoryCount} accent="bg-lime-400" />
                  <SummaryCard icon={Clock} label="Pending Orders" value={pendingOrdersCount} accent="bg-orange-400" />
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                  <h3 className="mb-3 text-sm font-black uppercase tracking-wide text-zinc-300">
                    Recent Orders
                  </h3>
                  {orders.length === 0 ? (
                    <p className="text-sm text-zinc-500">
                      No orders placed yet. They'll appear here the moment a customer checks out.
                    </p>
                  ) : (
                    <div className="flex flex-col divide-y divide-zinc-800">
                      {orders.slice(0, 5).map((o) => (
                        <div key={o.id} className="flex items-center justify-between py-2 text-sm">
                          <div>
                            <p className="font-semibold">{o.customerName}</p>
                            <p className="text-xs text-zinc-500">{o.id}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-display text-lg text-lime-400">{formatPrice(o.total)}</p>
                            <span className={`text-xs font-bold ${o.status === "Completed" ? "text-lime-400" : "text-orange-400"}`}>
                              {o.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {adminTab === "products" && (
              <div className="flex flex-col gap-6">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                  <h3 className="mb-3 text-sm font-black uppercase tracking-wide text-zinc-300">
                    Add New Product
                  </h3>
                  <form onSubmit={addProduct} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    <input
                      required
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      placeholder="Product Name"
                      className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-lime-400 lg:col-span-2"
                    />
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-lime-400"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <input
                      required
                      type="number"
                      min="0"
                      step="1"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      placeholder="Price (₹)"
                      className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-lime-400"
                    />
                    <input
                      required
                      type="number"
                      min="0"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                      placeholder="Stock Qty"
                      className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-lime-400"
                    />
                    <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-2">
                      <input
                        value={productForm.image.startsWith("data:") ? "" : productForm.image}
                        onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                        placeholder="Image URL (optional)"
                        className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-lime-400"
                      />
                      <label className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs font-semibold text-zinc-300 transition hover:border-lime-400 hover:text-lime-400">
                        <Upload className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Upload</span>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                      {productForm.image && (
                        <img src={productForm.image} alt="Preview" className="h-9 w-9 shrink-0 rounded-md border border-zinc-700 object-cover" />
                      )}
                    </div>
                    <input
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      placeholder="Short description (optional)"
                      className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-lime-400 sm:col-span-2 lg:col-span-2"
                    />
                    <button
                      type="submit"
                      className="flex items-center justify-center gap-1.5 rounded-lg bg-lime-400 px-3 py-2 text-sm font-bold text-zinc-950 hover:bg-lime-300"
                    >
                      <Plus className="h-4 w-4" /> Add Product
                    </button>
                  </form>
                </div>

                <div className="overflow-x-auto rounded-xl border border-zinc-800">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-900 text-xs uppercase tracking-wide text-zinc-500">
                      <tr>
                        <th className="px-4 py-3">Product</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Price</th>
                        <th className="px-4 py-3">Stock</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {products.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-10 text-center text-zinc-500">
                            No products yet. Add your first one above.
                          </td>
                        </tr>
                      ) : (
                        products.map((p) => (
                          <ProductRow key={p.id} product={p} onUpdateStock={updateStock} onDelete={deleteProduct} />
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {adminTab === "orders" && (
              <div className="overflow-x-auto rounded-xl border border-zinc-800">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-900 text-xs uppercase tracking-wide text-zinc-500">
                    <tr>
                      <th className="px-4 py-3">Order ID</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Phone</th>
                      <th className="px-4 py-3">Address</th>
                      <th className="px-4 py-3">Items</th>
                      <th className="px-4 py-3">Total</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-10 text-center text-zinc-500">
                          No orders yet — place one from the Storefront to see it here.
                        </td>
                      </tr>
                    ) : (
                      orders.map((o) => (
                        <tr key={o.id} className="align-top hover:bg-zinc-900/60">
                          <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-bold text-lime-400">{o.id}</td>
                          <td className="whitespace-nowrap px-4 py-3 font-medium">{o.customerName}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-zinc-400">{o.customerEmail}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-zinc-400">{o.phone}</td>
                          <td className="max-w-xs px-4 py-3 text-zinc-400">{o.address}</td>
                          <td className="px-4 py-3 text-zinc-400">
                            <ul className="space-y-0.5">
                              {o.items.map((it) => (
                                <li key={it.productId}>
                                  {it.name} <span className="text-zinc-600">×{it.qty}</span>
                                </li>
                              ))}
                            </ul>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <span className="font-display text-lg text-lime-400">{formatPrice(o.total)}</span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <select
                              value={o.status}
                              onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                              className={`rounded-full border px-2 py-1 text-xs font-bold outline-none ${
                                o.status === "Completed"
                                  ? "border-lime-400 bg-lime-400/10 text-lime-400"
                                  : "border-orange-400 bg-orange-400/10 text-orange-400"
                              }`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Completed">Completed</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="mx-auto max-w-7xl px-4 pb-6 pt-2 text-center text-xs text-zinc-600">
        IronPulse prototype — data resets on page refresh (in-memory demo store).
      </footer>

      {/* ---------------- CUSTOMER OVERLAYS ---------------- */}
      {view === "customer" && currentCustomer && (
        <>
          <CartDrawer
            open={cartOpen}
            onClose={() => setCartOpen(false)}
            items={cartDetailed}
            onQtyChange={updateQty}
            onRemove={removeFromCart}
            total={cartTotal}
            onCheckout={() => setCheckoutOpen(true)}
          />
          <CheckoutModal
            open={checkoutOpen}
            onClose={() => setCheckoutOpen(false)}
            form={checkoutForm}
            setForm={setCheckoutForm}
            onSubmit={submitOrder}
            total={cartTotal}
          />
        </>
      )}

      {/* ---------------- TOAST ---------------- */}
      {toast && (
        <div className="fixed bottom-4 left-1/2 z-[70] -translate-x-1/2 rounded-lg border border-lime-400/40 bg-zinc-900 px-4 py-3 shadow-lg">
          <div className="flex items-center gap-2 text-sm font-medium">
            <CheckCircle2 className="h-4 w-4 text-lime-400" />
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function CustomerAuthScreen({ mode, setMode, form, setForm, error, onLogin, onSignup }) {
  return (
    <div className="mx-auto max-w-sm py-10">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-lime-400">
          <User className="h-6 w-6 text-zinc-950" />
        </div>
        <h1 className="font-display text-3xl tracking-wide">
          {mode === "login" ? "Welcome Back" : "Join IronPulse"}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          {mode === "login" ? "Log in to shop and track your orders." : "Create an account to start shopping."}
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <div className="mb-4 flex rounded-full border border-zinc-800 bg-zinc-950 p-1">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 rounded-full py-1.5 text-sm font-semibold transition ${mode === "login" ? "bg-lime-400 text-zinc-950" : "text-zinc-400"}`}
          >
            Log In
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-full py-1.5 text-sm font-semibold transition ${mode === "signup" ? "bg-lime-400 text-zinc-950" : "text-zinc-400"}`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={mode === "login" ? onLogin : onSignup} className="flex flex-col gap-3">
          {mode === "signup" && (
            <div>
              <label className="mb-1 flex items-center gap-1 text-xs font-semibold text-zinc-400">
                <User className="h-3.5 w-3.5" /> Full Name
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-lime-400"
                placeholder="Jordan Lee"
              />
            </div>
          )}
          <div>
            <label className="mb-1 flex items-center gap-1 text-xs font-semibold text-zinc-400">
              <Mail className="h-3.5 w-3.5" /> Email
            </label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-lime-400"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="mb-1 flex items-center gap-1 text-xs font-semibold text-zinc-400">
              <Lock className="h-3.5 w-3.5" /> Password
            </label>
            <input
              required
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-lime-400"
              placeholder="••••••••"
            />
          </div>
          {mode === "signup" && (
            <div>
              <label className="mb-1 flex items-center gap-1 text-xs font-semibold text-zinc-400">
                <Phone className="h-3.5 w-3.5" /> Phone Number
              </label>
              <input
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-lime-400"
                placeholder="+1 555 123 4567"
              />
            </div>
          )}

          {error && <p className="text-xs font-medium text-red-400">{error}</p>}

          <button
            type="submit"
            className="mt-1 w-full rounded-lg bg-lime-400 py-2.5 text-sm font-bold uppercase tracking-wide text-zinc-950 hover:bg-lime-300"
          >
            {mode === "login" ? "Log In" : "Create Account"}
          </button>
        </form>
      </div>

      <p className="mt-4 text-center text-xs text-zinc-600">
        Demo account — demo@ironpulse.test / demo1234
      </p>
    </div>
  );
}

function AdminLoginScreen({ form, setForm, error, onSubmit }) {
  return (
    <div className="mx-auto max-w-sm py-10">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500">
          <ShieldCheck className="h-6 w-6 text-white" />
        </div>
        <h1 className="font-display text-3xl tracking-wide">Admin Login</h1>
        <p className="mt-1 text-sm text-zinc-500">Restricted access — staff only.</p>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <div>
            <label className="mb-1 flex items-center gap-1 text-xs font-semibold text-zinc-400">
              <User className="h-3.5 w-3.5" /> Username
            </label>
            <input
              required
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-orange-400"
              placeholder="admin"
            />
          </div>
          <div>
            <label className="mb-1 flex items-center gap-1 text-xs font-semibold text-zinc-400">
              <Lock className="h-3.5 w-3.5" /> Password
            </label>
            <input
              required
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-orange-400"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-xs font-medium text-red-400">{error}</p>}

          <button
            type="submit"
            className="mt-1 w-full rounded-lg bg-orange-500 py-2.5 text-sm font-bold uppercase tracking-wide text-white hover:bg-orange-400"
          >
            Log In
          </button>
        </form>
      </div>

      <p className="mt-4 text-center text-xs text-zinc-600">Demo credentials — admin / admin123</p>
    </div>
  );
}

function ProductCard({ product, onAdd }) {
  const isOut = product.stock <= 0;
  const isLow = product.stock > 0 && product.stock < 10;

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 transition hover:border-zinc-700">
      <div className="relative aspect-square overflow-hidden bg-zinc-800">
        <img src={product.image} alt={product.name} className="h-full w-full object-cover transition group-hover:scale-105" />
        <span className="absolute left-2 top-2 rounded-full bg-zinc-950/80 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-lime-400">
          {product.category}
        </span>
        {isOut && (
          <span className="absolute inset-0 flex items-center justify-center bg-zinc-950/70 text-xs font-bold uppercase tracking-widest text-zinc-300">
            Out of Stock
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="text-sm font-semibold leading-snug text-zinc-100">{product.name}</h3>
        {product.description && (
          <p className="line-clamp-2 text-xs leading-snug text-zinc-500">{product.description}</p>
        )}
        {isLow && !isOut && (
          <p className="flex items-center gap-1 text-xs font-medium text-orange-400">
            <AlertTriangle className="h-3 w-3" /> Only {product.stock} left
          </p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-display text-xl text-lime-400">{formatPrice(product.price)}</span>
          <button
            onClick={onAdd}
            disabled={isOut}
            className="rounded-lg bg-lime-400 px-3 py-1.5 text-xs font-bold text-zinc-950 transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
          >
            {isOut ? "Sold Out" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductRow({ product, onUpdateStock, onDelete }) {
  const [stockValue, setStockValue] = useState(product.stock);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const dirty = Number(stockValue) !== product.stock;

  return (
    <tr className="bg-zinc-950/40 hover:bg-zinc-900/60">
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-2">
          <img src={product.image} alt="" className="h-9 w-9 rounded-md object-cover" />
          <span className="font-medium">{product.name}</span>
        </div>
      </td>
      <td className="px-4 py-2.5 text-zinc-400">{product.category}</td>
      <td className="px-4 py-2.5">
        <span className="font-display text-lg text-lime-400">{formatPrice(product.price)}</span>
      </td>
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            value={stockValue}
            onChange={(e) => setStockValue(e.target.value)}
            className="w-16 rounded-md border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm outline-none focus:border-lime-400"
          />
          {dirty && (
            <button
              onClick={() => onUpdateStock(product.id, Number(stockValue))}
              className="rounded-md bg-lime-400 px-2 py-1 text-xs font-bold text-zinc-950"
            >
              Save
            </button>
          )}
          {product.stock === 0 && <span className="text-xs font-bold uppercase text-red-400">Out</span>}
          {product.stock > 0 && product.stock < 10 && (
            <span className="text-xs font-bold uppercase text-orange-400">Low</span>
          )}
        </div>
      </td>
      <td className="px-4 py-2.5 text-right">
        {confirmDelete ? (
          <span className="inline-flex items-center gap-1.5 text-xs">
            Delete?
            <button onClick={() => onDelete(product.id)} className="rounded bg-red-500 px-2 py-1 font-bold text-white">
              Yes
            </button>
            <button onClick={() => setConfirmDelete(false)} className="rounded bg-zinc-700 px-2 py-1 font-bold">
              No
            </button>
          </span>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="rounded-md p-1.5 text-zinc-500 hover:bg-red-500/10 hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </td>
    </tr>
  );
}

function SummaryCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${accent}`}>
        <Icon className="h-5 w-5 text-zinc-950" />
      </div>
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="font-display mt-1 text-3xl">{value}</p>
    </div>
  );
}

function CartDrawer({ open, onClose, items, onQtyChange, onRemove, total, onCheckout }) {
  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-zinc-950/70 transition-opacity ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col border-l border-zinc-800 bg-zinc-950 transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-zinc-800 p-4">
          <h2 className="font-display text-2xl tracking-wide">Your Cart</h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-zinc-900">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-zinc-500">
              <ShoppingCart className="h-10 w-10" />
              <p className="text-sm">Your cart is empty — add some gear to get started.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {items.map((i) => (
                <div key={i.productId} className="flex gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-2">
                  <img src={i.product.image} alt={i.product.name} className="h-16 w-16 rounded-md object-cover" />
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold leading-tight">{i.product.name}</p>
                      <button onClick={() => onRemove(i.productId)} className="shrink-0 text-zinc-500 hover:text-red-400">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-xs text-zinc-500">{formatPrice(i.product.price)} each</p>
                    <div className="mt-auto flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1 rounded-full border border-zinc-700 px-1">
                        <button onClick={() => onQtyChange(i.productId, -1)} className="p-1 text-zinc-300 hover:text-lime-400">
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-bold">{i.qty}</span>
                        <button onClick={() => onQtyChange(i.productId, 1)} className="p-1 text-zinc-300 hover:text-lime-400">
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="font-display text-lg text-lime-400">{formatPrice(i.product.price * i.qty)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-zinc-800 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-zinc-400">Total</span>
            <span className="font-display text-3xl text-lime-400">{formatPrice(total)}</span>
          </div>
          <button
            onClick={onCheckout}
            disabled={items.length === 0}
            className="w-full rounded-lg bg-lime-400 py-3 text-sm font-bold uppercase tracking-wide text-zinc-950 transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-500"
          >
            Proceed to Checkout
          </button>
        </div>
      </aside>
    </>
  );
}

function CheckoutModal({ open, onClose, form, setForm, onSubmit, total }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-zinc-950/80 p-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl tracking-wide">Delivery Details</h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-zinc-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <div>
            <label className="mb-1 flex items-center gap-1 text-xs font-semibold text-zinc-400">
              <User className="h-3.5 w-3.5" /> Full Name
            </label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-lime-400"
              placeholder="John Carter"
            />
          </div>
          <div>
            <label className="mb-1 flex items-center gap-1 text-xs font-semibold text-zinc-400">
              <Phone className="h-3.5 w-3.5" /> Phone Number
            </label>
            <input
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-lime-400"
              placeholder="+1 555 123 4567"
            />
          </div>
          <div>
            <label className="mb-1 flex items-center gap-1 text-xs font-semibold text-zinc-400">
              <MapPin className="h-3.5 w-3.5" /> Delivery Address
            </label>
            <textarea
              required
              rows={2}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-lime-400"
              placeholder="123 Fitness Ave, Apt 4B, Springfield"
            />
          </div>
          <div>
            <label className="mb-2 flex items-center gap-1 text-xs font-semibold text-zinc-400">
              <Banknote className="h-3.5 w-3.5" /> Payment Method
            </label>
            <div className="flex gap-2">
              {["Cash on Delivery", "Card on Delivery"].map((opt) => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => setForm({ ...form, payment: opt })}
                  className={`flex-1 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                    form.payment === opt ? "border-lime-400 bg-lime-400/10 text-lime-400" : "border-zinc-700 text-zinc-400"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between border-t border-zinc-800 pt-3">
            <span className="text-sm text-zinc-400">Order Total</span>
            <span className="font-display text-2xl text-lime-400">{formatPrice(total)}</span>
          </div>

          <button
            type="submit"
            className="mt-1 w-full rounded-lg bg-orange-500 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-orange-400"
          >
            Place Order
          </button>
        </form>
      </div>
    </div>
  );
}