"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient("https://npzfzlkvdxweiaewnnem.supabase.co", "sb_publishable_it_SC_2dJQ8K4n7K4DqYjw_AaVk59xz");

export default function ProductDetails() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      // আসল প্রোডাক্টের ডেটা আনা হচ্ছে
      const { data, error } = await supabase.from("products").select("*").eq("id", id).single();
      if (data) {
        setProduct(data);
        // নিচে দেখানোর জন্য একই ক্যাটাগরির অন্য প্রোডাক্ট আনা হচ্ছে
        const { data: similar } = await supabase.from("products").select("*").eq("is_active", true).neq("id", id).limit(4);
        if (similar) setSimilarProducts(similar);
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">Loading details...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center font-bold text-red-500">Product not found</div>;

  // দাম এবং ডিসকাউন্টের হিসাব
  const mrp = Number(product.price) || 0;
  const sale = Number(product.sale_price) || mrp;
  const savings = mrp > sale ? mrp - sale : 0;

  // ছবির গ্যালারি সেটআপ (মাল্টিপল ছবি থাকলে স্লাইডার হবে)
  const images = product.gallery?.length > 0 ? product.gallery : (product.image_url ? [product.image_url] : ["https://placehold.co/400x400/eeeeee/999999?text=No+Image"]);

  const addToCart = () => {
    let savedCart = JSON.parse(localStorage.getItem("royal_cart") || "{}");
    savedCart[product.id] = (savedCart[product.id] || 0) + 1;
    localStorage.setItem("royal_cart", JSON.stringify(savedCart));
    window.dispatchEvent(new Event("storage"));
    alert("Added to Cart! 🛒");
  };

  const buyNow = () => {
    addToCart();
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-white z-40 px-4 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-xl font-bold">←</button>
          <h1 className="text-lg font-extrabold">Product Details</h1>
        </div>
        <button onClick={() => router.push('/cart')} className="relative">
          <span className="text-2xl">🛒</span>
        </button>
      </div>

      {/* Image Slider (গ্যালারি থেকে আসা ছবিগুলো স্লাইড হবে) */}
      <div className="w-full bg-white relative pt-4 pb-8 flex flex-col items-center border-b border-gray-100">
        <img src={images[activeImg]} alt={product.name} className="w-64 h-64 object-contain mix-blend-multiply transition-all duration-300" />
        {images.length > 1 && (
          <div className="flex gap-2 mt-6">
            {images.map((_: any, i: number) => (
              <div key={i} onClick={() => setActiveImg(i)} className={`w-2 h-2 rounded-full cursor-pointer transition-all ${i === activeImg ? 'bg-[#5C3A21] w-4' : 'bg-gray-300'}`} />
            ))}
          </div>
        )}
      </div>

      <div className="px-4 mt-5 space-y-6">
        {/* Title & Ratings */}
        <div>
          <p className="text-[10px] font-extrabold text-[#7A401A] tracking-wider uppercase mb-1">ROYAL BASKET NO.1</p>
          <h1 className="text-xl font-black leading-tight text-gray-800 mb-3">{product.name}</h1>
          <div className="flex items-center gap-2">
            <div className="bg-[#198754] text-white flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold shadow-sm">
              {product.rating || 4.5} <span className="text-[10px]">★</span>
            </div>
            <span className="text-xs text-gray-500 font-medium">{product.reviews_count || 10} Ratings & Reviews</span>
          </div>
        </div>

        {/* Pricing Area */}
        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-black text-gray-900">₹{sale}</span>
            {mrp > sale && <span className="text-sm text-gray-400 line-through font-bold">₹{mrp}</span>}
          </div>
          {savings > 0 && (
            <div className="inline-flex items-center gap-1 bg-[#E8F5E9] text-[#2E7D32] px-2.5 py-1 rounded-lg text-[10px] font-extrabold shadow-sm">
              <span className="text-xs">🏷️</span> You save ₹{savings} on this item
            </div>
          )}
        </div>

        {/* Select Unit */}
        <div>
          <h3 className="text-sm font-extrabold mb-3 text-gray-800">Select Unit</h3>
          <div className="inline-block border-2 border-[#5C3A21] rounded-xl px-5 py-2 bg-[#Fdf8f5] text-[#5C3A21] font-bold text-sm shadow-sm">
            {product.weight}
          </div>
        </div>

        {/* Features (Delivery, Return, Safe) */}
        <div className="grid grid-cols-3 gap-3">
          <div className="border border-gray-200 rounded-xl p-3 flex flex-col items-center justify-center text-center gap-2 bg-white shadow-sm">
            <span className="text-xl">🚚</span>
            <span className="text-[10px] font-extrabold text-gray-700">Delivery<br/>info</span>
          </div>
          <div className="border border-gray-200 rounded-xl p-3 flex flex-col items-center justify-center text-center gap-2 bg-white shadow-sm">
            <span className="text-xl">🔄</span>
            <span className="text-[10px] font-extrabold text-gray-700">Return<br/>policy</span>
          </div>
          <div className="border border-gray-200 rounded-xl p-3 flex flex-col items-center justify-center text-center gap-2 bg-white shadow-sm">
            <span className="text-xl">🛡️</span>
            <span className="text-[10px] font-extrabold text-gray-700">Safe pack</span>
          </div>
        </div>

        {/* Offers */}
        <div className="bg-[#Fdf8f5] rounded-2xl p-4 border border-[#F0E5DB] shadow-sm">
          <h3 className="font-extrabold text-sm flex items-center gap-2 mb-4 text-gray-800"><span>🏷️</span> Available offers</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-black text-gray-800">BUY 3 GET 1 FREE</h4>
              <p className="text-[10px] text-gray-500 font-medium">Add 3 items to your cart to avail this offer.</p>
            </div>
            <div>
              <h4 className="text-xs font-black text-gray-800">BUY 5 GET 2 FREE</h4>
              <p className="text-[10px] text-gray-500 font-medium">Add 5 items to your cart to avail this offer.</p>
            </div>
          </div>
        </div>

        {/* Return Support */}
        <div className="bg-gray-50/80 rounded-2xl p-4 flex gap-3 border border-gray-100 shadow-sm">
          <span className="text-[#5C3A21] text-lg bg-white w-8 h-8 rounded-full flex items-center justify-center shadow-sm">🛡️</span>
          <div>
            <h4 className="text-xs font-black text-gray-800 mb-1">Return & refund support</h4>
            <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
              Wrong, missing or damaged item got replacement/refund support available. Delivery in 24 hours to your contact address.
            </p>
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-sm font-extrabold mb-3 text-gray-800">Product Description</h3>
          <p className="text-xs text-gray-600 font-medium leading-relaxed bg-gray-50 p-4 rounded-2xl shadow-sm border border-gray-100 whitespace-pre-wrap">
            {product.description || "No description available for this product."}
          </p>
        </div>

        {/* Weight & Category Details */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
            <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">WEIGHT</p>
            <p className="text-sm font-black text-gray-800">{product.weight}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
            <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">CATEGORY</p>
            <p className="text-sm font-black text-gray-800">{product.category}</p>
          </div>
        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <div className="pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-extrabold text-gray-800">Similar products</h3>
              <span className="text-[10px] font-extrabold text-[#7A401A] uppercase tracking-wide">View all</span>
            </div>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
              {similarProducts.map((p) => {
                const simImg = p.image_url || (p.gallery && p.gallery.length > 0 ? p.gallery[0] : "https://placehold.co/100x100/eeeeee/999999?text=No+Image");
                return (
                  <div key={p.id} onClick={() => router.push(`/product/${p.id}`)} className="min-w-[130px] bg-white rounded-2xl p-3 border border-gray-100 shadow-sm flex flex-col cursor-pointer active:scale-95 transition-transform">
                    <img src={simImg} alt={p.name} className="w-full h-20 object-contain mb-2 bg-[#F8F9FA] rounded-xl p-1" />
                    <h4 className="text-[10px] font-extrabold text-gray-800 leading-tight line-clamp-2 mb-2">{p.name}</h4>
                    <div className="mt-auto">
                       <span className="font-black text-sm text-gray-900">₹{p.sale_price || p.price}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Ratings Review (Static Placeholder as per design) */}
        <div className="pt-4 border-t border-gray-100 pb-10">
           <h3 className="text-sm font-extrabold mb-4 text-gray-800">Ratings & Reviews</h3>
           <div className="flex items-center gap-6 bg-gray-50 p-5 rounded-2xl border border-gray-100 shadow-sm">
             <div className="flex flex-col items-center">
               <span className="text-4xl font-black text-gray-800">{product.rating || 4.5}</span>
               <span className="text-[10px] text-[#198754] font-black tracking-widest mt-1">★★★★★</span>
               <span className="text-[9px] text-gray-500 font-bold mt-1">{product.reviews_count || 10} Ratings</span>
             </div>
             <div className="flex-1 space-y-2">
               {[5,4,3,2,1].map((star, i) => (
                 <div key={star} className="flex items-center gap-2">
                   <span className="text-[9px] font-extrabold text-gray-500 w-2">{star}</span>
                   <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                     <div className={`h-full ${i === 0 ? 'bg-[#198754] w-[80%]' : i === 1 ? 'bg-[#198754] w-[40%]' : i === 2 ? 'bg-[#ffc107] w-[15%]' : 'bg-[#dc3545] w-[5%]'}`}></div>
                   </div>
                 </div>
               ))}
             </div>
           </div>
           <p className="text-xs text-center text-gray-400 font-bold mt-6">More reviews coming soon.</p>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-3 px-4 flex gap-3 z-50 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
        <button onClick={addToCart} className="flex-1 border-2 border-[#5C3A21] text-[#5C3A21] font-black rounded-xl py-3.5 text-sm active:bg-gray-50 transition-colors">
          Add to Cart
        </button>
        <button onClick={buyNow} className="flex-1 bg-[#5C3A21] text-white font-black rounded-xl py-3.5 text-sm flex justify-center items-center gap-2 shadow-lg shadow-[#5C3A21]/30 active:scale-95 transition-transform">
          Buy Now <span className="text-lg leading-none">›</span>
        </button>
      </div>
    </div>
  );
}
