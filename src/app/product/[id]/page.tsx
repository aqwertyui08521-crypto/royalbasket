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

  // Touch slide states
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      const { data } = await supabase.from("products").select("*").eq("id", id).single();
      if (data) {
        setProduct(data);
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-black">Loading...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center font-bold text-black">Product not found</div>;

  const mrp = Number(product.price) || 0;
  const sale = Number(product.sale_price) || mrp;
  const savings = mrp > sale ? mrp - sale : 0;

  const images = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image_url];

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50 && activeImg < images.length - 1) setActiveImg(activeImg + 1);
    if (distance < -50 && activeImg > 0) setActiveImg(activeImg - 1);
    setTouchStart(0);
    setTouchEnd(0);
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
    <div className="min-h-screen bg-white font-sans text-black pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-white z-40 border-b p-4 flex items-center gap-4">
        <button onClick={() => router.back()} className="text-black text-xl font-bold">←</button>
        <h1 className="text-lg font-extrabold text-black">Product Details</h1>
      </div>

      {/* Image Slider with Swipe Support */}
      <div className="w-full bg-white relative pt-4 px-4 flex flex-col items-center">
        <div 
          className="w-full max-w-sm h-72 relative rounded-xl overflow-hidden border flex items-center justify-center bg-white"
          onTouchStart={(e) => setTouchStart(e.targetTouches[0].clientX)}
          onTouchMove={(e) => setTouchEnd(e.targetTouches[0].clientX)}
          onTouchEnd={handleTouchEnd}
        >
          <img src={images[activeImg]} alt={product.name} className="max-h-full max-w-full object-contain" />
        </div>
        
        {/* Dots */}
        {images.length > 1 && (
          <div className="flex gap-2 mt-4">
            {images.map((_: any, i: number) => (
              <div 
                key={i} 
                onClick={() => setActiveImg(i)} 
                className={`w-3 h-1.5 rounded-full transition-all ${activeImg === i ? 'bg-[#5C3A21] w-5' : 'bg-gray-300'}`} 
              />
            ))}
          </div>
        )}
      </div>

      {/* Title & Ratings */}
      <div className="px-4 mt-5 space-y-1">
        <p className="text-xs font-bold text-[#5C3A21] uppercase tracking-wider">{product.brand || "ROYAL BASKET NO.1"}</p>
        <h2 className="text-2xl font-black text-gray-900 leading-tight">{product.name}</h2>
        <div className="flex items-center gap-2 mt-1">
          <span className="bg-[#15803d] text-white text-xs font-bold px-2 py-0.5 rounded flex items-center gap-0.5">
            {product.rating || "4.4"} ★
          </span>
          <span className="text-xs text-gray-500 font-semibold">{product.reviews_count || "38"} Ratings & Reviews</span>
        </div>
      </div>

      {/* Price Section */}
      <div className="mx-4 mt-5 p-4 bg-gray-50 rounded-2xl border border-gray-100">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-gray-950">₹{sale}</span>
          {mrp > sale && <span className="text-sm text-gray-400 line-through font-medium">₹{mrp}</span>}
        </div>
        {savings > 0 && (
          <div className="mt-2 inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full border border-green-100">
            You save ₹{savings} on this item
          </div>
        )}
      </div>

      {/* Description */}
      <div className="px-4 mt-6 space-y-2">
        <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wider">Product Description</h3>
        <p className="text-sm text-gray-600 leading-relaxed font-medium">{product.description || "No description available."}</p>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex gap-3 z-50 shadow-lg max-w-md mx-auto">
        <button onClick={addToCart} className="flex-1 border border-[#5C3A21] text-[#5C3A21] py-3.5 rounded-xl font-bold text-sm active:scale-95 transition-transform">
          Add to Cart
        </button>
        <button onClick={buyNow} className="flex-1 bg-[#5C3A21] text-white py-3.5 rounded-xl font-bold text-sm active:scale-95 transition-transform flex items-center justify-center gap-1">
          Buy Now <span>❯</span>
            </button>
          </div>
        </div>
      );
    }
