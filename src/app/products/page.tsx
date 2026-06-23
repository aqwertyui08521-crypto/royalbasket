"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Star } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchProducts = async () => {
      const supabase = createClient("https://npzfzlkvdxweiaewnnem.supabase.co", "sb_publishable_it_SC_2dJQ8K4n7K4DqYjw_AaVk59xz");
      let query = supabase.from("products").select("*").order("created_at", { ascending: false });
      
      if (categoryParam) {
         query = query.ilike("category", `%${categoryParam}%`);
      }
      
      const { data } = await query;
      if (data) setProducts(data);
      
      const savedCart = localStorage.getItem("royal_cart");
      if (savedCart) setCart(JSON.parse(savedCart));
      
      setLoading(false);
    };
    fetchProducts();
  }, [categoryParam]);

  const updateCart = (e: React.MouseEvent, id: string, delta: number) => {
    e.preventDefault();
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

  const handleAddAndCheckout = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setCart((prev) => {
      const newCart = { ...prev, [id]: (prev[id] || 0) + 1 };
      localStorage.setItem("royal_cart", JSON.stringify(newCart));
      window.dispatchEvent(new Event("storage"));
      return newCart;
    });
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-28 font-sans">
      <header className="bg-white px-4 h-14 flex items-center gap-3 shadow-sm sticky top-0 z-40 border-b border-gray-100">
         <button onClick={() => router.back()} className="bg-gray-100 p-2 rounded-full active:scale-95 transition"><ArrowLeft className="h-5 w-5 text-gray-800" /></button>
         <h1 className="text-lg font-black text-gray-900 tracking-tight">{categoryParam ? `${categoryParam}` : 'All Products'}</h1>
      </header>

      <main className="p-4">
         {loading ? (
            <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5C3A21]"></div></div>
         ) : products.length === 0 ? (
            <div className="text-center py-10 text-gray-500 font-bold">No products found for this category.</div>
         ) : (
            <div className="grid grid-cols-2 gap-3">
               {products.map(p => {
                 const inCart = cart[p.id] || 0;
                 return (
                   <div key={p.id} onClick={() => router.push(`/product/${p.id}`)} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col cursor-pointer active:scale-[0.98] transition">
                      <div className="h-28 bg-[#FAFAFA] rounded-xl flex items-center justify-center text-4xl mb-3 border border-gray-50 relative">
                         {p.old_price && <span className="absolute top-2 left-2 bg-red-50 text-red-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">Sale</span>}
                         🌰
                      </div>
                      <div className="flex items-center gap-1 bg-amber-50 w-fit px-1.5 rounded mb-1.5 border border-amber-100"><span className="text-[10px] font-black text-amber-800">{p.rating}</span><Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500"/></div>
                      <h4 className="text-xs font-bold text-gray-900 leading-tight mb-1 line-clamp-1">{p.name}</h4>
                      <p className="text-[9px] text-gray-400 font-medium mb-2">{p.weight}</p>
                      
                      <div className="mt-auto flex justify-between items-end gap-1">
                         <div>
                            {p.old_price && <span className="text-[10px] text-gray-400 line-through block leading-none mb-0.5">₹{p.old_price}</span>}
                            <span className="text-sm font-black text-gray-900 leading-none block">₹{p.price}</span>
                         </div>
                         
                         {inCart > 0 ? (
                           <div className="bg-[#5C3A21] text-white rounded-lg flex items-center px-1.5 py-1 shadow-sm h-8" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                             <button onClick={(e) => updateCart(e, p.id, -1)} className="text-lg font-black px-1.5 active:scale-75 transition">−</button>
                             <span className="font-black text-[10px] min-w-[14px] text-center">{inCart}</span>
                             <button onClick={(e) => updateCart(e, p.id, 1)} className="text-lg font-black px-1.5 active:scale-75 transition">+</button>
                           </div>
                         ) : (
                           <button onClick={(e) => handleAddAndCheckout(e, p.id)} className="bg-[#5C3A21] text-white h-8 px-4 rounded-lg flex items-center justify-center shadow-sm active:scale-95 transition text-[10px] font-black tracking-widest uppercase">
                              ADD
                           </button>
                         )}
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

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5C3A21]"></div></div>}>
      <ProductsContent />
    </Suspense>
  );
}
