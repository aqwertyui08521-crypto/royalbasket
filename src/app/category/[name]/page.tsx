"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, ArrowLeft, Star, Truck, X, Tag } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

export default function CategoryPage({ params }: { params: Promise<{ name: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const categoryName = decodeURIComponent(resolvedParams.name);

  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      const supabaseUrl = "https://npzfzlkvdxweiaewnnem.supabase.co";
      const supabaseKey = "sb_publishable_it_SC_2dJQ8K4n7K4DqYjw_AaVk59xz";
      const supabase = createClient(supabaseUrl, supabaseKey);

      // ডেটাবেস থেকে শুধুমাত্র এই ক্যাটাগরির প্রোডাক্টগুলো নিয়ে আসবে
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("category", categoryName)
        .order("created_at", { ascending: true });

      if (data) setProducts(data);
      setLoading(false);
    };

    fetchCategoryProducts();
  }, [categoryName]);

  const updateCart = (e: React.MouseEvent, id: string, delta: number) => {
    e.stopPropagation();
    setCart((prev) => {
      const current = prev[id] || 0;
      const next = current + delta;
      if (next <= 0) {
        const newCart = { ...prev };
        delete newCart[id];
        if (Object.keys(newCart).length === 0) setIsCheckoutOpen(false);
        return newCart;
      }
      return { ...prev, [id]: next };
    });
    if (delta > 0) setIsCheckoutOpen(true);
  };

  const updateCartFromCheckout = (id: string, delta: number) => {
    setCart((prev) => {
      const current = prev[id] || 0;
      const next = current + delta;
      if (next <= 0) {
        const newCart = { ...prev };
        delete newCart[id];
        if (Object.keys(newCart).length === 0) setIsCheckoutOpen(false);
        return newCart;
      }
      return { ...prev, [id]: next };
    });
  };

  const totalCartItems = Object.values(cart).reduce((sum, count) => sum + count, 0);
  const totalAmount = products.reduce((sum, p) => sum + (p.price * (cart[p.id] || 0)), 0);
  const totalOldAmount = products.reduce((sum, p) => sum + ((p.old_price || p.price) * (cart[p.id] || 0)), 0);
  const totalSaved = totalOldAmount - totalAmount;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-800"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-20 font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/')} className="bg-gray-100 p-1.5 rounded-full active:scale-95 transition">
            <ArrowLeft className="h-5 w-5 text-gray-800" />
          </button>
          <h1 className="text-lg font-bold text-amber-800 tracking-tight">{categoryName}</h1>
        </div>
        
        <div onClick={() => totalCartItems > 0 && setIsCheckoutOpen(true)} className="relative bg-gray-100 p-2 rounded-full cursor-pointer">
          <ShoppingCart className="h-5 w-5 text-gray-700" />
          {totalCartItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold h-4 w-4 flex items-center justify-center rounded-full border border-white">
              {totalCartItems}
            </span>
          )}
        </div>
      </header>

      <main className="px-4 py-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-amber-600">⚡</span>
          <h3 className="font-bold text-gray-800">Showing all {categoryName}</h3>
        </div>

        {/* Product Grid - ঠিক হোমপেজের মতো ডিজাইন */}
        <div className="grid grid-cols-2 gap-3">
          {products.length > 0 ? (
            products.map((product) => {
              const inCartCount = cart[product.id] || 0;
              return (
                <div key={product.id} onClick={() => router.push(`/product/${product.id}`)} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col cursor-pointer active:scale-[0.98] transition-transform">
                  <div className="h-32 bg-gray-50 flex items-center justify-center relative">
                    <span className="absolute top-2 left-2 bg-red-50 text-red-600 text-[9px] font-bold px-1.5 py-0.5 rounded">{product.discount_tag}</span>
                    <div className="h-20 w-20 bg-amber-100 rounded-full flex items-center justify-center text-3xl">🌰</div>
                  </div>
                  
                  <div className="p-2.5 flex flex-col flex-1">
                    <div className="flex items-center gap-1 mb-1 bg-amber-50 w-fit px-1 rounded">
                      <span className="text-[10px] font-bold text-amber-800">{product.rating}</span>
                      <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                    </div>
                    <h4 className="text-xs font-semibold text-gray-800 line-clamp-2 leading-tight flex-1">{product.name}</h4>
                    <div className="mt-2 flex items-end gap-1.5">
                      <span className="text-sm font-bold text-gray-900">₹{product.price}</span>
                      <span className="text-[10px] text-gray-400 line-through">₹{product.old_price}</span>
                    </div>
                    <div className="mt-auto pt-3">
                      {inCartCount > 0 ? (
                        <div className="w-full bg-[#5C3A21] text-white font-bold py-1.5 rounded-lg flex items-center justify-between px-3 shadow-sm">
                          <button onClick={(e) => updateCart(e, product.id, -1)} className="text-xl leading-none px-2 active:scale-75 transition-transform">−</button>
                          <span className="text-xs">{inCartCount} in cart</span>
                          <button onClick={(e) => updateCart(e, product.id, 1)} className="text-xl leading-none px-2 active:scale-75 transition-transform">+</button>
                        </div>
                      ) : (
                        <button onClick={(e) => updateCart(e, product.id, 1)} className="w-full bg-white border border-[#5C3A21] text-[#5C3A21] font-bold py-1.5 rounded-lg text-xs flex items-center justify-center gap-1 hover:bg-amber-50 active:scale-95 transition-all">
                          ADD <span className="text-lg leading-none">+</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-2 text-center py-10">
              <div className="text-4xl mb-2">🛒</div>
              <p className="text-sm text-gray-500 font-medium">No products available in this category yet.</p>
              <p className="text-[10px] text-gray-400 mt-1">Admin will add them soon!</p>
            </div>
          )}
        </div>
      </main>

      {/* Checkout Bottom Sheet */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex flex-col justify-end backdrop-blur-sm transition-opacity">
          <div className="bg-[#f8f8f8] w-full rounded-t-[24px] max-h-[85vh] flex flex-col animate-[slideUp_0.3s_ease-out]">
            <div className="flex justify-between items-center px-5 py-4 bg-white rounded-t-[24px]">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">Checkout</h2>
                <p className="text-xs text-gray-500 font-medium mt-0.5">{totalCartItems} item{totalCartItems > 1 ? 's' : ''}</p>
              </div>
              <button onClick={() => setIsCheckoutOpen(false)} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition">
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            <div className="overflow-y-auto px-4 py-4 space-y-4">
              <div className="space-y-3">
                {products.filter(p => cart[p.id]).map(p => (
                  <div key={p.id} className="bg-white p-3.5 rounded-2xl flex items-center gap-4 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.1)]">
                    <div className="h-16 w-16 bg-gray-50 rounded-xl flex items-center justify-center text-3xl border border-gray-100">🌰</div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-gray-900 leading-tight pr-2">{p.name}</h4>
                      <div className="font-extrabold text-gray-900 mt-1 text-base">₹{p.price}</div>
                    </div>
                    <div className="bg-[#5C3A21] text-white rounded-xl flex items-center px-2.5 py-1.5 shadow-sm">
                       <button onClick={() => updateCartFromCheckout(p.id, -1)} className="text-lg font-medium px-2 active:scale-75 transition-transform">−</button>
                       <span className="font-bold text-sm min-w-[20px] text-center">{cart[p.id]}</span>
                       <button onClick={() => updateCartFromCheckout(p.id, 1)} className="text-lg font-medium px-2 active:scale-75 transition-transform">+</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-4 rounded-t-3xl shadow-[0_-8px_15px_-3px_rgba(0,0,0,0.08)] mt-auto pb-6">
              {totalSaved > 0 && (
                <div className="bg-[#F4EFE6] text-[#5C3A21] text-xs font-bold py-2.5 text-center rounded-xl mb-4 flex justify-center items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 fill-[#5C3A21]" /> You saved ₹{totalSaved} on this order
                </div>
              )}
              <div className="flex justify-between items-center mb-4 px-1">
                <span className="text-gray-600 text-sm font-medium">To Pay</span>
                <span className="text-2xl font-extrabold text-gray-900">₹{totalAmount}</span>
              </div>
              <button className="w-full bg-[#5C3A21] text-white font-bold py-4 rounded-2xl text-lg flex items-center justify-center gap-2 hover:bg-[#4a2e1a] active:scale-[0.98] transition-all shadow-md">
                Proceed <span className="text-2xl leading-none mb-0.5">›</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
