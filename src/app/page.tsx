"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Star, Bell, Plus } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

export default function HomePage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<Record<string, number>>({});
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient("https://npzfzlkvdxweiaewnnem.supabase.co", "sb_publishable_it_SC_2dJQ8K4n7K4DqYjw_AaVk59xz");
      const { data: prods } = await supabase.from("products").select("*").limit(10);
      const { data: bans } = await supabase.from("banners").select("*").order("created_at", { ascending: false });
      if (prods) setProducts(prods);
      if (bans) setBanners(bans);
      
      const savedCart = localStorage.getItem("royal_cart");
      if (savedCart) setCart(JSON.parse(savedCart));
      
      setLoading(false);
    };
    fetchData();
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

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      if (sliderRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          sliderRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          sliderRef.current.scrollBy({ left: clientWidth, behavior: "smooth" });
        }
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [banners]);

  if (loading) return <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5C3A21]"></div></div>;

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-28 font-sans">
      {/* Header - No Admin Text! */}
      <header className="bg-white px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-40">
         <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-[#F4EFE6] rounded-full flex items-center justify-center text-lg">🌰</div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">Royal Basket</h1>
         </div>
         <div className="bg-gray-50 p-2 rounded-full border border-gray-100">
            <Bell className="h-5 w-5 text-gray-600" />
         </div>
      </header>

      {/* Search Bar */}
      <div className="bg-white px-4 py-3 shadow-sm border-b border-gray-100 mb-3">
         <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search premium dry fruits..." className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-9 pr-4 text-sm font-medium focus:outline-none focus:border-[#5C3A21] transition" />
         </div>
      </div>

      <main>
         {/* Banners */}
         {banners.length > 0 && (
           <div className="px-4 mb-5">
             <div ref={sliderRef} className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-4 rounded-2xl">
               {banners.map((b) => (
                 <div key={b.id} className="min-w-full snap-center bg-[#5C3A21] rounded-2xl p-6 text-white shadow-md flex items-center justify-between relative overflow-hidden shrink-0">
                    <div className="z-10 relative">
                       <h2 className="text-xl font-black mb-1">{b.title}</h2>
                       <p className="text-xs font-bold text-gray-200 mb-3">{b.subtitle}</p>
                       <button className="bg-white text-[#5C3A21] text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider">Shop Now</button>
                    </div>
                    {b.image_url.length < 5 ? <div className="text-6xl z-10">{b.image_url}</div> : <img src={b.image_url} className="h-20 w-20 object-contain z-10 drop-shadow-lg" alt="Banner" />}
                    <div className="absolute -right-6 -top-6 h-32 w-32 bg-white/10 rounded-full blur-2xl"></div>
                 </div>
               ))}
             </div>
           </div>
         )}

         {/* Categories */}
         <div className="mb-6">
            <h3 className="text-sm font-black text-gray-900 px-4 mb-3 uppercase tracking-wider">Shop by Category</h3>
            <div className="flex overflow-x-auto gap-4 px-4 pb-2 hide-scrollbar">
               {[
                 { name: "Almonds", emoji: "🌰", color: "bg-amber-50" },
                 { name: "Cashews", emoji: "🥜", color: "bg-orange-50" },
                 { name: "Raisins", emoji: "🍇", color: "bg-purple-50" },
                 { name: "Walnuts", emoji: "🧠", color: "bg-yellow-50" },
                 { name: "Dates", emoji: "🌴", color: "bg-red-50" },
                 { name: "Pistachios", emoji: "🟢", color: "bg-green-50" }
               ].map((cat, idx) => (
                 <div key={idx} onClick={() => router.push('/products')} className="flex flex-col items-center gap-1.5 cursor-pointer">
                    <div className={`h-16 w-16 ${cat.color} border border-white shadow-sm rounded-full flex items-center justify-center text-3xl`}>{cat.emoji}</div>
                    <span className="text-[10px] font-bold text-gray-700">{cat.name}</span>
                 </div>
               ))}
            </div>
         </div>

         {/* Premium Range */}
         <div className="px-4">
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Premium Range</h3>
               <span onClick={() => router.push('/products')} className="text-xs font-bold text-[#5C3A21] cursor-pointer">View All</span>
            </div>
            
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
                           <div className="bg-[#5C3A21] text-white rounded-lg flex items-center px-1.5 py-1 shadow-sm h-8">
                             <button onClick={(e) => updateCart(e, p.id, -1)} className="text-lg font-black px-1.5 active:scale-75 transition">−</button>
                             <span className="font-black text-[10px] min-w-[14px] text-center">{inCart}</span>
                             <button onClick={(e) => updateCart(e, p.id, 1)} className="text-lg font-black px-1.5 active:scale-75 transition">+</button>
                           </div>
                         ) : (
                           <button onClick={(e) => updateCart(e, p.id, 1)} className="bg-white border border-[#5C3A21] text-[#5C3A21] h-8 w-8 rounded-lg flex items-center justify-center shadow-sm active:scale-95 transition">
                              <Plus className="h-4 w-4 stroke-[3]" />
                           </button>
                         )}
                      </div>
                   </div>
                 );
               })}
            </div>
         </div>
      </main>
    </div>
  );
}
