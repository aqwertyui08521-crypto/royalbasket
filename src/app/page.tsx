"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Star, ChevronRight } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

export default function HomePage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient("https://npzfzlkvdxweiaewnnem.supabase.co", "sb_publishable_it_SC_2dJQ8K4n7K4DqYjw_AaVk59xz");
      const { data: prods } = await supabase.from("products").select("*").limit(10);
      const { data: bans } = await supabase.from("banners").select("*");
      if (prods) setProducts(prods);
      if (bans) setBanners(bans);
      setLoading(false);
    };
    fetchData();
  }, []);

  // ব্যানার অটো স্লাইডার ম্যাজিক (২ সেকেন্ড পর পর)
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

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5C3A21]"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans">
      <header className="bg-white px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-40">
         <div className="flex items-center gap-2"><div className="h-8 w-8 bg-[#F4EFE6] rounded-full flex items-center justify-center text-lg">🌰</div><h1 className="text-xl font-black text-gray-900 tracking-tight">Royal Basket</h1></div>
         <button onClick={() => router.push('/admin')} className="text-[10px] font-bold text-gray-400">Admin</button>
      </header>

      <main>
         {/* Dynamic Auto-Sliding Banners */}
         {banners.length > 0 && (
           <div className="p-4">
             <div ref={sliderRef} className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-4 rounded-2xl">
               {banners.map((b) => (
                 <div key={b.id} className="min-w-full snap-center bg-gradient-to-r from-[#5C3A21] to-[#8B5A2B] rounded-2xl p-6 text-white shadow-md flex items-center justify-between relative overflow-hidden">
                    <div className="z-10 relative">
                       <h2 className="text-xl font-black mb-1">{b.title}</h2>
                       <p className="text-xs font-bold opacity-80">{b.subtitle}</p>
                    </div>
                    {b.image_url.length < 5 ? <div className="text-5xl z-10">{b.image_url}</div> : <img src={b.image_url} className="h-16 w-16 object-contain z-10" alt="Banner" />}
                    <div className="absolute -right-6 -top-6 h-32 w-32 bg-white/10 rounded-full blur-2xl"></div>
                 </div>
               ))}
             </div>
           </div>
         )}

         {/* Dynamic Products */}
         <div className="px-4 mt-2">
            <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-black text-gray-900">Premium Range</h3><span onClick={() => router.push('/products')} className="text-xs font-bold text-[#5C3A21] cursor-pointer">View All</span></div>
            <div className="grid grid-cols-2 gap-3">
               {products.map(p => (
                 <div key={p.id} onClick={() => router.push(`/product/${p.id}`)} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col cursor-pointer active:scale-95 transition">
                    <div className="h-28 bg-gray-50 rounded-xl flex items-center justify-center text-4xl mb-2">🌰</div>
                    <div className="flex items-center gap-1 bg-amber-50 w-fit px-1 rounded mb-1"><span className="text-[10px] font-bold text-amber-800">{p.rating}</span><Star className="h-2 w-2 fill-amber-500 text-amber-500"/></div>
                    <h4 className="text-xs font-bold text-gray-900 leading-tight mb-1 line-clamp-1">{p.name}</h4>
                    <div className="mt-auto flex justify-between items-end">
                       <div><span className="text-sm font-black text-[#5C3A21]">₹{p.price}</span></div>
                       <button className="bg-[#5C3A21] text-white h-6 w-6 rounded-lg flex items-center justify-center font-bold">+</button>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </main>
    </div>
  );
}
