import { useEffect, useRef, useState } from "react";
import { useCart } from "../context/CartContext";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export default function Menu() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [remoteMenu, setRemoteMenu] = useState({});
  const [active, setActive] = useState("");

  const { addItem, cart, updateQty } = useCart(); // tableNumber
  const sectionRefs = useRef({});

  const categories = Object.keys(remoteMenu);
  const menuSource = remoteMenu;

  // Fetch menu from backend
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    (async () => {
      try {
        const r = await fetch(`${API_BASE}/api/products`);
        const j = await r.json();

        if (r.ok && j.products && mounted) {
          const byCat = {};

          for (const p of j.products) {
            const cat = p.category || "Other";
            if (!byCat[cat]) byCat[cat] = [];

            byCat[cat].push({
              id: p._id,
              name: p.name || p.title,
              price: p.price,
              image: p.image || null,
            });
          }

          setRemoteMenu(byCat);
          const firstCat = Object.keys(byCat)[0];
          if (firstCat) setActive(firstCat);
        }
      } catch (e) {
        console.error("Failed to fetch products:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => (mounted = false);
  }, []);

  // Scroll to category
  const scrollToCategory = (category) => {
    setActive(category);
    const section = sectionRefs.current[category];
    if (!section) return;

    const yOffset = -160;
    const y =
      section.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  // Active category on scroll
  useEffect(() => {
    const handleScroll = () => {
      for (const cat of categories) {
        const section = sectionRefs.current[cat];
        if (!section) continue;

        const rect = section.getBoundingClientRect();
        if (rect.top <= 180 && rect.bottom >= 180) {
          setActive(cat);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [categories]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">Loading menu...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-3 sm:px-6 max-w-7xl mx-auto">
      {/* Table Number Indicator
      {tableNumber && (
        <div className="mb-4 bg-orange-100 border border-orange-200 rounded-lg p-3">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2">
              <span className="text-orange-800 font-medium">
                🪑 Table {tableNumber}
              </span>
              <span className="text-orange-600 text-sm">
                • Ordering for this table
              </span>
            </div>
          </div>
        </div>
      )} */}

      {/* Sticky Search + Category Bar */}
      <div className="sticky top-0 z-5 bg-white border-b">
        {/* Search */}
        <div className="p-3">
          <input
            placeholder="Search item"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border px-4 py-2 text-lg shadow-sm outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-4 overflow-x-auto px-3 pb-3 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => scrollToCategory(cat)}
              className={`flex flex-col items-center shrink-0 ${
                active === cat ? "text-orange-500" : "text-gray-600"
              }`}
            >
              <div
                className={`h-14 w-14 rounded-xl overflow-hidden border ${
                  active === cat ? "border-orange-500" : "border-gray-200"
                }`}
              >
                <img
                  src={
                    menuSource[cat]?.[0]?.image ||
                    "https://via.placeholder.com/60"
                  }
                  alt={cat}
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="mt-1 text-md font-medium whitespace-nowrap">
                {cat}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Menu Sections */}
      <div className="px-3 py-4 space-y-12">
        {categories.map((cat) => {
          const filteredItems = (menuSource[cat] || []).filter((item) =>
            item.name.toLowerCase().includes(search.toLowerCase())
          );

          if (search && filteredItems.length === 0) return null;

          return (
            <div key={cat} ref={(el) => (sectionRefs.current[cat] = el)}>
              {/* Category Title */}
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                {cat} ({filteredItems.length})
              </h2>

              {/* Items */}
              <div className="divide-y">
                {filteredItems.map((item) => {
                  const cartItem = cart.find((c) => c.name === item.name);

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-4"
                    >
                      {/* Left Info */}
                      <div className="flex-1 pr-3">
                        <p className="text-lg font-semibold text-gray-900">
                          {item.name}
                        </p>
                        <p className="text-lg text-gray-700 mt-1">
                          ₹ {item.price}.00
                        </p>
                      </div>

                      {/* Right Image + Action */}
                      <div className="relative flex flex-col items-center">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-20 w-20 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="h-20 w-20 rounded-xl bg-gray-200 flex items-center justify-center text-gray-400 text-sm">
                            No Image
                          </div>
                        )}

                        {/* Cart Controls */}
                        {cartItem ? (
                          <div className="absolute -bottom-3 flex items-center gap-2 bg-white rounded-lg border px-2 py-1 shadow">
                            <button
                              onClick={() =>
                                updateQty(cartItem.name, cartItem.qty - 1)
                              }
                              className="px-2 text-lg font-bold"
                            >
                              –
                            </button>
                            <div className="px-2 text-lg font-semibold">
                              {cartItem.qty}
                            </div>
                            <button
                              onClick={() =>
                                updateQty(cartItem.name, cartItem.qty + 1)
                              }
                              className="px-2 text-lg font-bold"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() =>
                              addItem({
                                name: item.name,
                                price: item.price,
                                image: item.image,
                                qty: 1,
                              })
                            }
                            className="absolute -bottom-3 rounded-lg border border-orange-500 bg-white px-4 py-1 text-sm font-semibold text-orange-500 shadow-sm hover:bg-orange-50 transition"
                          >
                            + Add
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Spacing for Cart Bar */}
      <div className="h-24" />
    </div>
  );
}
