"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient("https://npzfzlkvdxweiaewnnem.supabase.co", "sb_publishable_it_SC_2dJQ8K4n7K4DqYjw_AaVk59xz");

export default function HomePage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase.from("products").select("*").eq("is_active", true).order("id", { ascending: false });
      if (data) setProducts(data);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const calculateDiscount = (mrp: number, sale: number) => {
    if (!mrp || !sale || mrp <= sale) return 0;
    return Math.round(((mrp - sale) / mrp) * 100);
  };

  const handleOpenBottomSheet = (p: any) => {
    setSelectedProduct(p);
    setQty(1);
  };

  const handleCheckout = () => {
    if (!selectedProduct) return;
    let savedCart = JSON.parse(localStorage.getItem("royal_cart") || "{}");
    savedCart[selectedProduct.id] = (savedCart[selectedProduct.id] || 0) + qty;
    localStorage.setItem("royal_cart", JSON.stringify(savedCart));
    window.dispatchEvent(new Event("storage"));
    
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-gray-900 pb-20 relative">
      <div className="bg-[#Fdf8f5] p-4 rounded-b-[2.5rem] shadow-sm pb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#EAD9C9] rounded-full blur-3xl opacity-50 -mr-10 -mt-10"></div>
        <div className="flex justify-between items-center mb-4 relative z-10">
          <h1 className="text-2xl font-black text-[#4A2C11] tracking-tight">ROYAL BASKET</h1>
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-lg">🔍</div>
        </div>
        
        <div className="bg-gradient-to-r from-[#5C3A21] to-[#8c5e3c] rounded-2xl p-5 text-white relative z-10 shadow-lg shadow-[#5C3A21]/30">
          <p className="text-[10px] font-bold tracking-widest text-[#EAD9C9] uppercase mb-1">Premium Dry Fruits</p>
          <h2 className="text-xl font-black mb-1">Mega Dryfruit Sale</h2>
          <p className="text-xs font-medium opacity-90 flex items-center gap-1"><span className="text-lg">🚚</span> Free Delivery on all orders</p>
        </div>
      </div>

      <div className="px-4 -mt-4 relative z-20">
        <div className="bg-white p-3 rounded-2xl shadow-sm flex gap-4 overflow-x-auto scrollbar-hide border border-gray-100 items-center">
           <span className="font-extrabold text-sm ml-2 flex items-center gap-1"><span>⚡</span> Available Products</span>
        </div>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="w-8 h-8 border-4 border-[#5C3A21] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {products.map((p) => {
              const discount = calculateDiscount(p.price, p.sale_price);
              // Smart Image Fallback Logic for Homepage
              const displayImg = p.image_url || (p.gallery && p.gallery.length > 0 ? p.gallery[0] : "https://placehold.co/150x150/eeeeee/999999?text=No+Image");

              return (
                <div key={p.id} className="bg-white rounded-2xl p-3 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-gray-50 flex flex-col relative">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-1 text-[8px] font-extrabold text-gray-700 bg-gray-50 px-1.5 py-0.5 rounded">
                      <span>🚚</span> FREE DELIVERY
                    </div>
                    {discount > 0 && <span className="text-[9px] font-black text-[#FF4B4B] bg-[#FFF0F0] px-1.5 py-0.5 rounded">{discount}% OFF</span>}
                  </div>

                  <div className="w-full aspect-square bg-[#F8F9FA] rounded-xl mb-2 p-2 flex items-center justify-center">
                     <img src={displayImg} alt={p.name} className="w-full h-full object-cover mix-blend-multiply" />
                  </div>

                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center gap-1 mb-1">
                       <span className="bg-[#6B4423] text-white text-[8px] font-bold px-1 py-0.5 rounded flex items-center gap-0.5">
                         4.9 <span className="text-[6px]">★</span>
                       </span>
                    </div>
                    <h3 className="font-bold text-[11px] text-gray-800 leading-tight line-clamp-2 mb-0.5">{p.name}</h3>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-2">{p.weight}</p>
                    
                    <div className="mt-auto">
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="font-black text-sm text-gray-900">₹{p.sale_price || p.price}</span>
                        {p.sale_price && p.sale_price < p.price && <span className="text-[10px] text-gray-400 line-through font-bold">₹{p.price}</span>}
                      </div>
                      <button 
                        onClick={() => handleOpenBottomSheet(p)}
                        className="w-full border-2 border-[#5C3A21] text-[#5C3A21] py-1.5 rounded-lg text-[10px] font-extrabold flex items-center justify-center gap-1 hover:bg-[#5C3A21] hover:text-white transition-colors active:scale-95"
                      >
                        ADD TO CART <span className="text-sm leading-none">+</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center py-2 pb-safe shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] z-40">
        <div className="flex flex-col items-center p-2 text-[#5C3A21]">
          <span className="text-xl">🏠</span>
          <span className="text-[10px] font-bold mt-0.5">Home</span>
        </div>
        <div className="flex flex-col items-center p-2 text-gray-400">
          <span className="text-xl">📦</span>
          <span className="text-[10px] font-bold mt-0.5">Products</span>
        </div>
        <div onClick={() => router.push('/cart')} className="flex flex-col items-center p-2 text-gray-400 cursor-pointer">
          <span className="text-xl">🛒</span>
          <span className="text-[10px] font-bold mt-0.5">Cart</span>
        </div>
        <div className="flex flex-col items-center p-2 text-gray-400">
          <span className="text-xl">🎧</span>
          <span className="text-[10px] font-bold mt-0.5">Support</span>
        </div>
      </div>

      {selectedProduct && (
        <>
          <div className="fixed inset-0 bg-black/60 z-50 transition-opacity" onClick={() => setSelectedProduct(null)}></div>
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 p-5 pb-8 animate-[slideUp_0.3s_ease-out]">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-5"></div>
            
            <div className="flex gap-4">
              <img 
                src={selectedProduct.image_url || (selectedProduct.gallery && selectedProduct.gallery.length > 0 ? selectedProduct.gallery[0] : "https://placehold.co/150x150/eeeeee/999999?text=No+Image")} 
                alt="img" 
                className="w-24 h-24 object-cover rounded-2xl border border-gray-100 bg-gray-50" 
              />
              <div className="flex-1">
                <h3 className="font-extrabold text-gray-800 text-sm leading-tight mb-1">{selectedProduct.name}</h3>
                <p className="text-[10px] text-gray-500 font-bold mb-2">{selectedProduct.weight} • {selectedProduct.category}</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-[#5C3A21]">₹{selectedProduct.sale_price || selectedProduct.price}</span>
                  {selectedProduct.sale_price && selectedProduct.sale_price < selectedProduct.price && (
                    <span className="text-xs text-gray-400 line-through font-bold">₹{selectedProduct.price}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-2xl mt-5 border border-gray-100">
              <span className="text-xs font-bold text-gray-700">Select Quantity</span>
              <div className="flex items-center gap-4 bg-white border border-gray-200 rounded-lg px-2 py-1 shadow-sm">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-6 h-6 flex items-center justify-center font-bold text-[#5C3A21]">-</button>
                <span className="text-sm font-extrabold w-4 text-center">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="w-6 h-6 flex items-center justify-center font-bold text-[#5C3A21]">+</button>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setSelectedProduct(null)} className="w-1/3 border-2 border-gray-200 text-gray-600 font-bold rounded-xl text-sm">Cancel</button>
              <button onClick={handleCheckout} className="w-2/3 bg-[#5C3A21] text-white py-3.5 rounded-xl font-extrabold text-sm shadow-lg shadow-[#5C3A21]/30 flex justify-center items-center gap-2 active:scale-95 transition-transform">
                Proceed to Checkout <span className="text-lg leading-none">›</span>
              </button>
            </div>
          </div>
        </>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
