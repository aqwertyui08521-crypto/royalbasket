"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, ArrowLeft, Star, ShieldCheck, Tag, ChevronRight, CheckCircle2, RotateCcw, Truck } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

export default function ProductDetails({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const productId = resolvedParams.id;

  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inCartCount, setInCartCount] = useState(0);

  useEffect(() => {
    const savedCart = localStorage.getItem("royal_cart");
    if (savedCart) {
      const parsed = JSON.parse(savedCart);
      if (parsed[productId]) setInCartCount(parsed[productId]);
    }
  }, [productId]);

  useEffect(() => {
    const fetchProductDetails = async () => {
      const supabaseUrl = "https://npzfzlkvdxweiaewnnem.supabase.co";
      const supabaseKey = "sb_publishable_it_SC_2dJQ8K4n7K4DqYjw_AaVk59xz";
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data: pData } = await supabase.from("products").select("*").eq("id", productId).single();
      if (pData) setProduct(pData);

      const { data: rData } = await supabase.from("product_reviews").select("*").eq("product_id", productId);
      if (rData) setReviews(rData);

      // Similar Products ফেচ করা হচ্ছে
      const { data: relData } = await supabase.from("products").select("*").neq("id", productId).limit(6);
      if (relData) setRelatedProducts(relData);

      setLoading(false);
    };

    fetchProductDetails();
  }, [productId]);

  const handleUpdateCart = (delta: number) => {
    const next = inCartCount + delta;
    if (next >= 0) {
      setInCartCount(next);
      const savedCart = localStorage.getItem("royal_cart");
      let parsed = savedCart ? JSON.parse(savedCart) : {};
      if (next === 0) delete parsed[productId];
      else parsed[productId] = next;
      localStorage.setItem("royal_cart", JSON.stringify(parsed));
      localStorage.setItem("cartTotal", ((product?.price || 0) * (next > 0 ? next : 1)).toString());
    }
    return;
    // Old code below is ignored by early return
    const next = inCartCount + delta;
    if (next >= 0) {
      setInCartCount(next);
      localStorage.setItem("cartTotal", ((product?.price || 0) * (next > 0 ? next : 1)).toString());
    }
  };

  const handleProceed = () => {
    const hasAddress = localStorage.getItem("deliveryAddress");
    router.push(hasAddress ? "/payment" : "/address");
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5C3A21]"></div></div>;
  if (!product) return <div className="p-10 text-center text-gray-700 text-xs">Product not found!</div>;

  const imagesList = product.images && product.images.length > 0 ? product.images : [product.image_url || "https://via.placeholder.com/400"];

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 px-4 h-14 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/')} className="active:scale-95 transition">
            <ArrowLeft className="h-6 w-6 text-gray-800" />
          </button>
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">Product Details</h1>
        </div>
        <div onClick={() => router.push('/')} className="relative p-2 cursor-pointer bg-gray-50 rounded-full">
          <ShoppingCart className="h-5 w-5 text-gray-800" />
          {inCartCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border border-white">{inCartCount}</span>}
        </div>
      </header>

      {/* Image Slider */}
      <div className="bg-white relative">
        <div className="w-full flex overflow-x-auto snap-x snap-mandatory hide-scrollbar">
          {imagesList.map((_: string, idx: number) => (
             <div key={idx} className="min-w-full snap-center h-72 bg-white flex justify-center items-center relative">
                <div className="text-8xl">🌰</div>
             </div>
          ))}
        </div>
        <div className="flex justify-center gap-1.5 pb-4 bg-white">
          <div className="h-1.5 w-4 rounded-full bg-[#5C3A21]"></div>
          <div className="h-1.5 w-1.5 rounded-full bg-gray-300"></div>
          <div className="h-1.5 w-1.5 rounded-full bg-gray-300"></div>
        </div>
      </div>

      {/* Product Basic Info */}
      <div className="bg-white px-4 py-4 mb-2">
        <div className="flex items-center gap-1 text-xs text-[#5C3A21] font-bold mb-1 uppercase tracking-widest">
          Royal Basket No.1
        </div>
        <h1 className="text-xl font-bold text-gray-900 leading-tight mb-2">{product.name}</h1>
        
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1 bg-green-700 text-white px-1.5 py-0.5 rounded text-[11px] font-bold">
            {product.rating} <Star className="h-3 w-3 fill-white" />
          </div>
          <span className="text-xs text-gray-500 font-medium">{product.reviews_count} Ratings & Reviews</span>
        </div>

        <div className="bg-[#F8F9FA] rounded-2xl p-4 mb-4 border border-gray-100 relative">
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-gray-900 leading-none">₹{product.price}</span>
            {product.old_price && <span className="text-sm text-gray-400 line-through font-medium mb-0.5">₹{product.old_price}</span>}
          </div>
          {product.old_price > product.price && (
            <div className="text-xs text-green-700 font-bold mt-2 flex items-center gap-1">
              <Tag className="h-4 w-4" /> You save ₹{product.old_price - product.price} on this item
            </div>
          )}
          <div className="text-[10px] text-gray-500 mt-1">Inclusive of all taxes</div>
        </div>
      </div>

      {/* Trust & Delivery Badges */}
      <div className="flex gap-2 px-4 py-4 bg-white mb-2 overflow-x-auto hide-scrollbar">
         <div className="flex flex-col items-center justify-center p-3 border border-gray-100 rounded-2xl min-w-[100px] bg-gray-50">
            <Truck className="h-6 w-6 text-[#5C3A21] mb-1" />
            <span className="text-[10px] font-bold text-center leading-tight">Free<br/>Delivery</span>
         </div>
         <div className="flex flex-col items-center justify-center p-3 border border-gray-100 rounded-2xl min-w-[100px] bg-gray-50">
            <RotateCcw className="h-6 w-6 text-[#5C3A21] mb-1" />
            <span className="text-[10px] font-bold text-center leading-tight">Easy<br/>Returns</span>
         </div>
         <div className="flex flex-col items-center justify-center p-3 border border-gray-100 rounded-2xl min-w-[100px] bg-gray-50">
            <ShieldCheck className="h-6 w-6 text-[#5C3A21] mb-1" />
            <span className="text-[10px] font-bold text-center leading-tight">Secure<br/>Packaging</span>
         </div>
      </div>

      {/* Available Offers Section */}
      <div className="bg-[#F8F6F2] p-4 mb-2">
        <div className="flex items-center gap-2 mb-3">
          <Tag className="h-5 w-5 text-[#5C3A21]" />
          <h3 className="text-sm font-extrabold text-gray-900">Available offers</h3>
        </div>
        <div className="space-y-3">
          <div><h4 className="text-xs font-bold text-[#5C3A21]">BUY 3 GET 1 FREE</h4><p className="text-xs text-gray-600 mt-0.5">Add 4 items to your cart to avail this offer.</p></div>
          <div><h4 className="text-xs font-bold text-[#5C3A21]">BUY 5 GET 2 FREE</h4><p className="text-xs text-gray-600 mt-0.5">Add 7 items to your cart to avail this offer.</p></div>
        </div>
      </div>

      {/* Return & Refund Support */}
      <div className="bg-white p-4 mb-2">
        <div className="bg-[#F8F9FA] border border-gray-100 p-4 rounded-2xl flex gap-3 items-start">
           <div className="bg-[#F4EFE6] p-2 rounded-full shrink-0"><ShieldCheck className="h-5 w-5 text-[#5C3A21]" /></div>
           <div>
             <h3 className="text-sm font-bold text-gray-900 mb-1">Return & refund support</h3>
             <p className="text-xs text-gray-600 leading-relaxed">Wrong, missing or damaged item par replacement/refund support available hai. Delivery ke 24 hours ke andar order details ke saath support ko contact karein.</p>
           </div>
        </div>
      </div>

      {/* Product Description & Composition */}
      <div className="bg-white px-4 py-5 mb-2">
        <h3 className="text-base font-extrabold text-gray-900 mb-3 border-b border-gray-100 pb-2">Product Description</h3>
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line mb-6">
          {product.description || "Enjoy the perfect balance of taste, nutrition, and quality with our Premium Dry Fruits. Handpicked from the best farms."}
          {product.benefits && `\n\nBenefits:\n${product.benefits}`}
        </p>

        {/* Video's specific grid layout for composition */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
             <p className="text-[10px] text-gray-500 font-bold uppercase mb-0.5">Weight</p>
             <p className="text-sm font-extrabold text-gray-900">{product.weight || '1 Kg'}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
             <p className="text-[10px] text-gray-500 font-bold uppercase mb-0.5">Category</p>
             <p className="text-sm font-extrabold text-gray-900">{product.category || 'Premium'}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
             <p className="text-[10px] text-gray-500 font-bold uppercase mb-0.5">Seller</p>
             <p className="text-sm font-extrabold text-gray-900">Royal Basket</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
             <p className="text-[10px] text-gray-500 font-bold uppercase mb-0.5">Delivery</p>
             <p className="text-sm font-extrabold text-gray-900">Free delivery</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
           <span className="bg-[#F4EFE6] text-[#5C3A21] px-3 py-1 rounded-full text-xs font-bold">#Dryfruit</span>
           <span className="bg-[#F4EFE6] text-[#5C3A21] px-3 py-1 rounded-full text-xs font-bold">#Premium</span>
           <span className="bg-[#F4EFE6] text-[#5C3A21] px-3 py-1 rounded-full text-xs font-bold">#{product.category}</span>
        </div>
      </div>

      {/* Similar Products (From Video) */}
      <div className="bg-[#F8F9FA] px-4 py-5 mb-2">
        <div className="flex justify-between items-end mb-1">
          <h3 className="text-lg font-black text-gray-900">Similar products</h3>
          <span className="text-xs font-bold text-[#5C3A21] cursor-pointer">View all</span>
        </div>
        <p className="text-[10px] text-gray-500 mb-4 font-medium">Auto scroll right to left - swipe anytime</p>
        
        <div className="flex overflow-x-auto gap-4 pb-2 hide-scrollbar">
          {relatedProducts.length > 0 ? relatedProducts.map((rp) => (
            <div key={rp.id} onClick={() => router.push(`/product/${rp.id}`)} className="min-w-[150px] max-w-[150px] bg-white border border-gray-100 rounded-2xl p-3 shadow-sm shrink-0 flex flex-col cursor-pointer active:scale-95 transition-transform">
              <div className="flex justify-between items-center mb-2">
                 <div className="flex items-center gap-1 text-[8px] font-bold text-gray-600"><Truck className="h-3 w-3"/> FREE DELIVERY</div>
                 <div className="bg-red-50 text-red-600 text-[8px] font-black px-1.5 py-0.5 rounded">{rp.discount_tag || 'OFFER'}</div>
              </div>
              <div className="h-28 bg-gray-50 rounded-xl flex justify-center items-center mb-3 text-4xl">🌰</div>
              <div className="flex items-center gap-1 bg-white border border-gray-200 shadow-sm w-fit px-1.5 py-0.5 rounded text-[9px] font-bold mb-1">
                {rp.rating} <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
              </div>
              <h4 className="text-xs font-bold text-gray-900 line-clamp-2 leading-tight mb-1">{rp.name}</h4>
              <p className="text-[10px] text-gray-500 mb-2">{rp.weight || '1 Kg'}</p>
              <div className="flex items-end gap-1.5 mb-3 mt-auto">
                <span className="text-sm font-black text-gray-900">₹{rp.price}</span>
                {rp.old_price && <span className="text-[10px] text-gray-400 line-through font-medium">₹{rp.old_price}</span>}
              </div>
              <button onClick={(e) => { e.stopPropagation(); alert("Added to cart!"); }} className="w-full border border-[#5C3A21] text-[#5C3A21] font-bold py-2 rounded-xl text-xs active:bg-amber-50 transition">
                ADD TO CART +
              </button>
            </div>
          )) : (
            <div className="text-xs text-gray-500 py-4">No similar products found.</div>
          )}
        </div>
      </div>

      {/* Ratings & Reviews */}
      <div className="bg-white px-4 py-5 mb-2">
        <h3 className="text-base font-extrabold text-gray-900 mb-4">Ratings & Reviews</h3>
        <div className="flex items-center justify-between mb-6 border border-gray-100 p-4 rounded-2xl">
          <div className="flex flex-col items-center justify-center border-r border-gray-100 pr-6">
            <div className="text-4xl font-black text-gray-900">{product.rating}</div>
            <div className="flex text-green-600 mt-1"><Star className="h-3 w-3 fill-current"/><Star className="h-3 w-3 fill-current"/><Star className="h-3 w-3 fill-current"/><Star className="h-3 w-3 fill-current"/><Star className="h-3 w-3 fill-current opacity-30"/></div>
            <div className="text-[10px] text-gray-500 mt-1 font-medium">{product.reviews_count} Ratings</div>
          </div>
          <div className="flex-1 pl-6 space-y-1.5">
            {[5,4,3,2,1].map((star) => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-gray-500 w-2">{star}</span>
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${star >= 4 ? 'bg-green-600' : star === 3 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${star === 5 ? '70%' : star === 4 ? '20%' : star === 3 ? '5%' : '2%'}` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {reviews.length > 0 ? reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-green-700 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">{review.rating} <Star className="h-2 w-2 fill-white" /></div>
                <h5 className="text-xs font-bold text-gray-900">{review.customer_name}</h5>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed mb-2">{review.review_text}</p>
              <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium"><CheckCircle2 className="h-3 w-3" /> Verified Purchase</div>
            </div>
          )) : (
            <div className="text-center py-2 text-xs text-gray-500">More reviews coming soon.</div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 shadow-[0_-8px_20px_-3px_rgba(0,0,0,0.08)] z-50 rounded-t-3xl">
        {inCartCount > 0 ? (
          <div className="w-full bg-[#5C3A21] text-white font-extrabold py-3.5 rounded-2xl flex items-center justify-between px-4 shadow-[0_4px_12px_rgba(92,58,33,0.3)]">
            <button onClick={() => handleUpdateCart(-1)} className="text-2xl leading-none px-4 active:scale-75 transition-transform">−</button>
            <span className="text-base">{inCartCount} in cart</span>
            <button onClick={() => handleUpdateCart(1)} className="text-2xl leading-none px-4 active:scale-75 transition-transform">+</button>
          </div>
        ) : (
          <div className="flex gap-3">
             <button onClick={() => handleUpdateCart(1)} className="flex-1 bg-white border-2 border-[#5C3A21] text-[#5C3A21] font-extrabold py-3.5 rounded-2xl text-sm active:scale-95 transition">Add to Cart</button>
             <button onClick={() => { handleUpdateCart(1); handleProceed(); }} className="flex-1 bg-[#5C3A21] text-white font-extrabold py-3.5 rounded-2xl text-sm active:scale-95 transition shadow-[0_4px_12px_rgba(92,58,33,0.3)] flex justify-center items-center gap-1">Proceed <ChevronRight className="h-4 w-4" /></button>
          </div>
        )}
      </div>
    </div>
  );
}
