"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, Star } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchProducts = async () => {
      const supabaseUrl = "https://npzfzlkvdxweiaewnnem.supabase.co";
      const supabaseKey = "sb_publishable_it_SC_2dJQ8K4n7K4DqYjw_AaVk59xz";
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data } = await supabase.from("products").select("*").order("created_at", { ascending: true });
      if (data) setProducts(data);
      setLoading(false);
    };
    fetchProducts();
    const savedCart = localStorage.getItem("royal_cart");
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  const updateCart = (e: React.MouseEvent, id: string, delta: number) => {
    e.stopPropagation();
    setCart((prev) => {
      const next = (prev[id] || 0) + delta;
      const newCart = { ...prev };
      if (next <= 0) delete newCart[id];
      else newCart[id] = next;
      localStorage.setItem("royal_cart", JSON.stringify(newCart));
      window.dispatchEvent(new Event("storage"));
      return newCart;
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-24 font-sans">
      <header className="bg-white shadow-sm sticky top-0 z-40 px-4 h-14 flex items-center gap-3 border-b border-gray-100">
         <button onClick={() => router.back()} className="bg-gray-100 p-1.5 rounded-full active:scale-95 transition"><ArrowLeft className="h-5 w-5 text-gray-800" /></button>
         <h1 className="text-lg font-bold text-gray-900 tracking-tight">All Products</h1>
      </header>

      <div className="bg-white px-4 py-3 border-b border-gray-100 shadow-sm mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input type="text" placeholder="Search premium dry fruits..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-amber-600 font-medium" />
        </div>
      </div>

      <main className="px-4">
        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-800"></div></div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {products.map((product) => {
              const inCartCount = cart[product.id] || 0;
              return (
                <div key={product.id} onClick={() => router.push(`/product/${product.id}`)} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col cursor-pointer active:scale-[0.98] transition-transform">
                  <div className="h-32 bg-gray-50 flex items-center justify-center relative">
                    <span className="absolute top-2 left-2 bg-red-50 text-red-600 text-[9px] font-bold px-1.5 py-0.5 rounded">{product.discount_tag || "PREMIUM"}</span>
                    <div className="h-20 w-20 bg-amber-100 rounded-full flex items-center justify-center text-3xl">🌰</div>
                  </div>
                  <div className="p-2.5 flex flex-col flex-1">
                    <div className="flex items-center gap-1 mb-1 bg-amber-50 w-fit px-1 rounded"><span className="text-[10px] font-bold text-amber-800">{product.rating}</span><Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" /></div>
                    <h4 className="text-xs font-semibold text-gray-800 line-clamp-2 leading-tight flex-1">{product.name}</h4>
                    <div className="mt-2 flex items-end gap-1.5"><span className="text-sm font-bold text-gray-900">₹{product.price}</span>{product.old_price && <span className="text-[10px] text-gray-400 line-through">₹{product.old_price}</span>}</div>
                    <div className="mt-auto pt-3">
                      {inCartCount > 0 ? (
                        <div className="w-full bg-[#5C3A21] text-white font-bold py-1.5 rounded-lg flex items-center justify-between px-3 shadow-sm"><button onClick={(e) => updateCart(e, product.id, -1)} className="text-xl leading-none px-2 active:scale-75 transition-transform">−</button><span className="text-xs">{inCartCount} in cart</span><button onClick={(e) => updateCart(e, product.id, 1)} className="text-xl leading-none px-2 active:scale-75 transition-transform">+</button></div>
                      ) : (
                        <button onClick={(e) => updateCart(e, product.id, 1)} className="w-full bg-white border border-[#5C3A21] text-[#5C3A21] font-bold py-1.5 rounded-lg text-xs flex items-center justify-center gap-1 hover:bg-amber-50 active:scale-95 transition-all">ADD <span className="text-lg leading-none">+</span></button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
