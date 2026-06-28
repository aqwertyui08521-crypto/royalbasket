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
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      const { data, error } = await supabase.from("products").select("*").eq("id", id).single();
      if (data) {
        setProduct(data);
        const { data: similar } = await supabase.from("products").select("*").eq("category", data.category).neq("id", id).limit(10);
        if (similar) setSimilarProducts(similar);
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-900">Loading...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center font-bold text-red-500">Product not found</div>;

  const mrp = Number(product.price) || 0;
  const sale = Number(product.sale_price) || mrp;
  const savings = mrp > sale ? mrp - sale : 0;
  const images = product.gallery?.length > 0 ? product.gallery : (product.image_url ? [product.image_url] : []);

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    if (distance > 50 && activeImg < images.length - 1) setActiveImg(activeImg + 1);
    if (distance < -50 && activeImg > 0) setActiveImg(activeImg - 1);
    setTouchStartX(0);
    setTouchEndX(0);
  };

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
      <div className="sticky top-0 bg-white z-40 p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-xl font-bold">←</button>
          <h1 className="text-lg font-extrabold">Product Details</h1>
        </div>
        <button onClick={() => router.push('/cart')} className="relative">
          <span className="text-2xl">🛒</span>
        </button>
      </div>

      {/* Image Slider */}
      <div 
        className="w-full bg-white relative pt-4 pb-4 flex flex-col items-center"
        onTouchStart={(e) => setTouchStartX(e.targetTouches[0].clientX)}
        onTouchMove={(e) => setTouchEndX(e.targetTouches[0].clientX)}
        onTouchEnd={handleTouchEnd}
      >
        <img src={images[activeImg]} alt={product.name} className="w-64 h-64 object-contain mix-blend-multiply" />
        {images.length > 1 && (
          <div className="flex gap-2 mt-6">
            {images.map((_: any, i: number) => (
              <div key={i} onClick={() => setActiveImg(i)} className={`w-3 h-1.5 rounded-full transition-all ${activeImg === i ? 'bg-[#5C3A21] w-5' : 'bg-gray-300'}`} />
            ))}
          </div>
        )}
      </div>

      <div className="px-4 mt-5 space-y-6">
        <div>
          <p className="text-[10px] font-extrabold text-[#5C3A21] uppercase tracking-wider mb-1">ROYAL BASKET NO.1</p>
          <h1 className="text-xl font-black leading-tight text-gray-950">{product.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <div className="bg-[#198754] text-white flex items-center px-2 py-0.5 rounded text-xs font-bold gap-1">
              {product.rating || 4.5} <span className="text-[10px]">★</span>
            </div>
            <span className="text-xs text-gray-500 font-medium">{product.reviews_count || 38} Ratings & Reviews</span>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-gray-950">₹{sale}</span>
            {mrp > sale && <span className="text-sm text-gray-400 line-through font-bold">₹{mrp}</span>}
          </div>
          {savings > 0 && (
            <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full border border-green-100 mt-2">
              <span className="text-xs">🏷️</span>You save ₹{savings} on this item
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-extrabold text-gray-900 mb-3">Select Unit</h3>
          <div className="inline-block border-2 border-[#5C3A21] bg-[#5C3A21]/5 text-[#5C3A21] font-bold px-4 py-2 rounded-xl">
            {product.weight}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="border border-gray-200 rounded-xl p-3 flex flex-col items-center justify-center text-center gap-1">
            <span className="text-xl">🚚</span>
            <span className="text-[10px] font-extrabold text-gray-600">Free Delivery</span>
          </div>
          <div className="border border-gray-200 rounded-xl p-3 flex flex-col items-center justify-center text-center gap-1">
            <span className="text-xl">📦</span>
            <span className="text-[10px] font-extrabold text-gray-600">Easy Return</span>
          </div>
          <div className="border border-gray-200 rounded-xl p-3 flex flex-col items-center justify-center text-center gap-1">
            <span className="text-xl">🛡️</span>
            <span className="text-[10px] font-extrabold text-gray-600">100% Safe</span>
          </div>
        </div>

        <div className="bg-[#fdf8f5] rounded-2xl p-4 border border-[#f5e6de]">
          <h3 className="font-extrabold text-sm text-[#5C3A21] mb-3 flex items-center gap-2"><span>🏷️</span> Available Offers</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-black text-gray-900 mb-1">Bank Offer</h4>
              <p className="text-[10px] text-gray-600 font-medium leading-relaxed">5% Unlimited Cashback on Flipkart Axis Bank Credit Card</p>
            </div>
            <div>
              <h4 className="text-xs font-black text-gray-900 mb-1">Special Price</h4>
              <p className="text-[10px] text-gray-600 font-medium leading-relaxed">Get extra 10% off (price inclusive of cashback/coupon)</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50/80 rounded-2xl p-4 flex gap-3 border border-gray-100">
          <span className="text-[#5C3A21] text-xl mt-0.5">🔄</span>
          <div>
            <h4 className="text-xs font-black text-gray-900 mb-1">7 Days Return Policy</h4>
            <p className="text-[10px] text-gray-500 font-medium leading-relaxed">Wrong, missing or damaged item guarantee</p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-extrabold text-gray-900 mb-2">Product Description</h3>
          <p className="text-xs text-gray-600 font-medium leading-relaxed whitespace-pre-wrap">
            {product.description || "No description available."}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col gap-1">
            <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider">Weight</span>
            <p className="text-sm font-black text-gray-900">{product.weight}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col gap-1">
            <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider">Category</span>
            <p className="text-sm font-black text-gray-900">{product.category}</p>
          </div>
        </div>
      </div>

      {similarProducts.length > 0 && (
        <div className="pt-4 border-t border-gray-100 mt-6 bg-gray-50/50 pb-6">
          <div className="flex justify-between items-center px-4 mb-4">
            <h3 className="text-sm font-extrabold text-gray-900">Similar Products</h3>
            <span className="text-[10px] font-extrabold text-[#5C3A21] bg-[#5C3A21]/10 px-2 py-1 rounded-md">View All</span>
          </div>
          <div className="flex gap-4 overflow-x-auto px-4 pb-4 no-scrollbar">
            {similarProducts.map((p) => {
              const simImg = p.image_url || (p.gallery?.[0] || "");
              return (
                <div key={p.id} onClick={() => router.push(`/product/${p.id}`)} className="min-w-[140px] bg-white border border-gray-100 rounded-xl p-3 flex flex-col gap-2 shadow-sm active:scale-95 transition-transform">
                  <img src={simImg} alt={p.name} className="w-full h-24 object-contain" />
                  <h4 className="text-[10px] font-extrabold text-gray-900 line-clamp-2">{p.name}</h4>
                  <div className="mt-auto">
                    <span className="font-black text-sm text-[#5C3A21]">₹{p.sale_price || p.price}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-gray-100 mt-2 px-4 mb-6">
        <h3 className="text-sm font-extrabold mb-4 text-gray-900">Ratings & Reviews</h3>
        <div className="flex items-center gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
          <div className="flex flex-col items-center">
            <span className="text-4xl font-black text-gray-900">{product.rating || 4.5}</span>
            <span className="text-[10px] text-[#198754] font-bold mt-1">★ ★ ★ ★ ☆</span>
            <span className="text-[9px] text-gray-400 font-extrabold mt-1 uppercase tracking-wider">{product.reviews_count || 38} Ratings</span>
          </div>
          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((star, i) => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-gray-500 w-2">{star}</span>
                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full ${i === 0 ? 'w-[70%] bg-[#198754]' : i === 1 ? 'w-[20%] bg-[#198754]' : i === 2 ? 'w-[5%] bg-yellow-400' : 'w-0 bg-red-500'}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs text-center text-gray-400 font-bold mb-4">Secured by Royal Basket</p>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 flex gap-3 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.08)]">
        <button onClick={addToCart} className="flex-1 bg-white border-2 border-[#5C3A21] text-[#5C3A21] py-3 rounded-xl font-black text-sm active:scale-95 transition-transform">
          Add to Cart
        </button>
        <button onClick={buyNow} className="flex-1 bg-[#5C3A21] text-white py-3 rounded-xl font-black text-sm active:scale-95 transition-transform flex items-center justify-center gap-2">
          Buy Now <span className="text-lg leading-none">›</span>
        </button>
      </div>
    </div>
  );
}
