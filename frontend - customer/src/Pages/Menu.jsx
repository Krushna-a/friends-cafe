import { useEffect, useRef, useState } from "react";
import { useCart } from "../context/CartContext";
import { useSettings } from "../hooks/useSettings";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export default function Menu() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [remoteMenu, setRemoteMenu] = useState({});
  const [active, setActive] = useState("");

  const { addItem, cart, updateQty } = useCart();
  const { settings } = useSettings();
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

    // Account for sticky header height (approximately 140px)
    const yOffset = -140;
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
        // Account for sticky header height (approximately 140px)
        if (rect.top <= 160 && rect.bottom >= 160) {
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
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="text-amber-800">Loading menu...</div>
      </div>
    );
  }

 return (
    <div className="min-h-screen bg-orange-50">
      {/* Search Bar */}
      <div className="px-3 py-2 bg-white sticky top-12 z-10">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
            <svg
              className="h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            placeholder="Search item"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm bg-gray-100 rounded-full text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-20 sm:w-24 bg-white border-r border-gray-200 sticky top-[52px] h-[calc(100vh-52px)] overflow-y-auto">
          <div className="p-1 space-y-1">
            {categories.map((cat) => {
              const isActive = active === cat;
              const categoryItems = menuSource[cat] || [];
              const firstItemImage = categoryItems[0]?.image;

              return (
                <button
                  key={cat}
                  onClick={() => scrollToCategory(cat)}
                  className={`w-full p-1 rounded-lg transition-all ${
                    isActive
                      ? "bg-amber-800 text-white shadow"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  <div className="w-10 h-10 mx-auto mb-0.5 rounded-md overflow-hidden bg-gray-200">
                    {firstItemImage ? (
                      <img
                        src={firstItemImage}
                        alt={cat}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                        🍽️
                      </div>
                    )}
                  </div>
                  <div className="text-[13px] font-medium leading-tight">
                    {cat}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Content */}
        <div className="flex-1 px-3 pb-24">
          {categories.map((cat) => {
            const filteredItems = (menuSource[cat] || []).filter((item) =>
              item.name.toLowerCase().includes(search.toLowerCase()),
            );

            if (search && filteredItems.length === 0) return null;

            return (
              <div
                key={cat}
                ref={(el) => (sectionRefs.current[cat] = el)}
                className="mb-4"
              >
                {/* Category Header */}
                <div className="flex items-center gap-1 mb-2 mt-4">
                  <h2 className="text-sm font-semibold text-amber-900">
                    {cat} ({filteredItems.length})
                  </h2>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  {filteredItems.map((item) => {
                    const cartItem = cart.find(
                      (c) => c.name === item.name,
                    );

                    return (
                      <div
                        key={item.id}
                        className="bg-white rounded-xl p-3 shadow-sm border border-orange-100"
                      >
                        <div className="flex items-center justify-between">
                          {/* Info */}
                          <div className="flex-1 pr-2">
                            <h3 className="text-sm font-semibold text-gray-900 leading-tight">
                              {item.name}
                            </h3>
                            <p className="text-sm font-bold text-amber-800">
                              {settings.currencySymbol} {item.price}
                            </p>
                          </div>

                          {/* Image + Controls */}
                          <div className="relative">
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl">
                                  🍽️
                                </div>
                              )}
                            </div>

                            <div className="absolute -bottom-1 -right-1">
                              {cartItem ? (
                                <div className="flex items-center bg-amber-800 text-white rounded-full shadow">
                                  <button
                                    onClick={() =>
                                      updateQty(
                                        cartItem.name,
                                        cartItem.qty - 1,
                                      )
                                    }
                                    className="w-7 h-7 flex items-center justify-center rounded-full text-sm"
                                  >
                                    −
                                  </button>
                                  <span className="px-2 text-sm font-semibold min-w-[1.5rem] text-center">
                                    {cartItem.qty}
                                  </span>
                                  <button
                                    onClick={() =>
                                      updateQty(
                                        cartItem.name,
                                        cartItem.qty + 1,
                                      )
                                    }
                                    className="w-7 h-7 flex items-center justify-center rounded-full text-sm"
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
                                  className="w-7 h-7 bg-amber-800 text-white rounded-full flex items-center justify-center shadow text-sm"
                                >
                                  +
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
