"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, ArrowLeft, Star, Truck, ShieldCheck, Tag, ChevronRight, CheckCircle2 } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

export default function ProductDetails({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const productId = resolvedParams.id;

  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  
  // কাস্টমারের লোকাল রিভিউয়ের জন্য স্টেট
  const [customerReview, setCustomerReview] = useState("");
  const [localReviewSaved, setLocalReviewSaved] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      const supabaseUrl = "https://npzfzlkvdxweiaewnnem.supabase.co";
      const supabaseKey = "sb_publishable_it_SC_2dJQ8K4n7K4DqYjw_AaVk59xz";
      const supabase = createClient(supabaseUrl, supabaseKey);

      // মূল প্রোডাক্ট আনা
      const { data: pData } = await supabase.from("products").select("*").eq("id", productId).single();
      if (pData) setProduct(pData);

      // রিভিউ আনা
      const { data: rData } = await supabase.from("product_reviews").select("*").eq("product_id", productId);
      if (rData) setReviews(rData);

      // রিলেটেড প্রোডাক্ট আনা
      const { data: relData } = await supabase.from("products").select("*").neq("id", productId).limit(4);
      if (relData) setRelatedProducts(relData);

      // লোকাল স্টোরেজ থেকে কাস্টমারের নিজের রিভিউ চেক করা
      const savedReview = localStorage.getItem(`review_${productId}`);
      if (savedReview) {
        setCustomerReview(savedReview);
        setLocalReviewSaved(true);
      }

      setLoading(false);
    };

    fetchProductDetails();
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-amber-800"></div>
      </div>
    );
  }

  if (!product) return <div className="p-10 text-center">Product not found!</div>;

  const discountPercent = product.old_price > product.price 
    ? Math.round(((product.old_price - product.price) / product.old_price) * 100) 
    : 0;
  const savingsAmount = product.old_price - product.price;

  // স্লাইডারের জন্য একাধিক ছবি (যদি ডেটাবেসে না থাকে, ডামি ছবি দেখাবে)
  const imagesList = product.images && product.images.length > 0 
    ? product.images 
    : [product.image_url || "https://via.placeholder.com/400", "https://via.placeholder.com/400?text=View+2", "https://via.placeholder.com/400?text=View+3"];

  const handleReviewSubmit = () => {
    if(!customerReview.trim()) return;
    localStorage.setItem(`review_${productId}`, customerReview);
    setLocalReviewSaved(true);
    alert("Thank you! Your review has been submitted for moderation.");
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-24 font-sans selection:bg-amber-100">
      {/* App Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 px-4 h-14 flex items-center justify-between">
        <button onClick={() => router.push('/')} className="bg-gray-100 p-2 rounded-full active:scale-95 transition">
          <ArrowLeft className="h-5 w-5 text-gray-800" />
        </button>
        <h1 className="text-sm font-bold text-gray-800 tracking-wide">Royal Basket Premium</h1>
        <div className="relative bg-gray-100 p-2 rounded-full cursor-pointer">
          <ShoppingCart className="h-5 w-5 text-gray-800" />
        </div>
      </header>

      {/* Image Slider */}
      <div className="bg-white relative">
        {discountPercent > 0 && (
          <div className="absolute top-4 left-4 z-10 bg-red-600 text-white text-xs font-black px-2.5 py-1 rounded-md shadow-md">
            {discountPercent}% OFF
          </div>
        )}
        
        {/* Swipeable Gallery */}
        <div className="w-full flex overflow-x-auto snap-x snap-mandatory hide-scrollbar">
          {imagesList.map((img: string, idx: number) => (
             <div key={idx} className="min-w-full snap-center h-80 bg-gray-50 flex justify-center items-center relative">
                <div className="text-8xl">🌰</div> {/* Placeholder for real image */}
             </div>
          ))}
        </div>
        
        {/* Thumbnails */}
        <div className="flex justify-center gap-2 p-3 bg-white border-b border-gray-100">
          {imagesList.map((_: any, idx: number) => (
            <div key={idx} onClick={() => setActiveImage(idx)} className={`h-2 w-2 rounded-full ${activeImage === idx ? 'bg-amber-800 w-4' : 'bg-gray-300'} transition-all duration-300`}></div>
          ))}
        </div>
      </div>

      {/* Product Basic Info */}
      <div className="bg-white px-4 py-4 mb-2 shadow-sm">
        <div className="flex items-center gap-1 text-xs text-amber-600 font-bold mb-1 tracking-wider uppercase">
          Royal Basket No.1
        </div>
        <h1 className="text-xl font-extrabold text-gray-900 leading-tight mb-2">{product.name}</h1>
        
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1 bg-green-700 text-white px-2 py-0.5 rounded text-xs font-bold">
            {product.rating} <Star className="h-3 w-3 fill-white" />
          </div>
          <span className="text-xs text-gray-500 font-medium">{product.reviews_count} Ratings & Reviews</span>
        </div>

        <div className="bg-[#F8F9FA] rounded-xl p-3 mb-4 border border-gray-100">
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-gray-900 leading-none">₹{product.price}</span>
            {product.old_price && (
              <span className="text-sm text-gray-400 line-through font-medium mb-1">₹{product.old_price}</span>
            )}
          </div>
          {savingsAmount > 0 && (
            <div className="text-xs text-green-700 font-bold mt-1.5 flex items-center gap-1">
              <Tag className="h-3.5 w-3.5" /> You save ₹{savingsAmount} on this item
            </div>
          )}
          <div className="text-[10px] text-gray-500 mt-1">Inclusive of all taxes</div>
        </div>

        {/* Dynamic Weight/Variant Selector */}
        <div className="mb-2">
          <h3 className="text-xs font-bold text-gray-900 mb-2">Select Unit</h3>
          <div className="flex gap-3">
            <button className="border-2 border-amber-800 bg-amber-50 text-amber-900 font-bold text-sm px-4 py-2 rounded-xl">
              {product.weight || "1 Kg"}
            </button>
          </div>
        </div>
      </div>

      {/* Delivery & Trust Section */}
      <div className="bg-white px-4 py-4 mb-2 shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <div className="bg-green-50 p-2 rounded-full"><Truck className="h-5 w-5 text-green-700" /></div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">Free Delivery Available</h4>
            <p className="text-xs text-gray-500">Usually delivered in 3-5 days</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-amber-50 p-2 rounded-full"><ShieldCheck className="h-5 w-5 text-amber-700" /></div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">100% Genuine Quality</h4>
            <p className="text-xs text-gray-500">Premium graded dry fruits</p>
          </div>
        </div>
      </div>

      {/* Product Details (Admin Editable) */}
      <div className="bg-white px-4 py-4 mb-2 shadow-sm">
        <h3 className="text-base font-extrabold text-gray-900 mb-3 border-b pb-2">Product Details</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Description</h4>
            <p className="text-sm text-gray-800 leading-relaxed">
              {product.description || "Premium quality dry fruits selected directly from top farms. Enjoy the natural taste and nutrition."}
            </p>
          </div>
          
          {product.benefits && (
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Health Benefits</h4>
              <p className="text-sm text-gray-800 leading-relaxed">{product.benefits}</p>
            </div>
          )}
        </div>
      </div>

      {/* Ratings & Reviews Section */}
      <div className="bg-white px-4 py-5 mb-2 shadow-sm">
        <div className="flex justify-between items-end mb-4 border-b pb-4">
          <div>
            <h3 className="text-base font-extrabold text-gray-900">Customer Ratings</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-4xl font-black text-gray-900">{product.rating}</span>
              <div>
                <div className="flex text-amber-500"><Star className="h-4 w-4 fill-current"/><Star className="h-4 w-4 fill-current"/><Star className="h-4 w-4 fill-current"/><Star className="h-4 w-4 fill-current"/><Star className="h-4 w-4 fill-current opacity-50"/></div>
                <span className="text-xs text-gray-500 font-medium">{product.reviews_count} verified ratings</span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Private Review Section (Local Storage Magic) */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
          <h4 className="text-sm font-bold text-gray-900 mb-2">Write your review</h4>
          {localReviewSaved ? (
            <div className="bg-green-50 text-green-800 text-xs p-3 rounded-lg flex gap-2 items-start border border-green-200">
              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                <p className="font-bold mb-1">Your Review is saved (Visible only to you until approved)</p>
                <p className="text-gray-600 italic">"{customerReview}"</p>
              </div>
            </div>
          ) : (
            <div>
              <textarea 
                value={customerReview}
                onChange={(e) => setCustomerReview(e.target.value)}
                placeholder="How was the product quality?" 
                className="w-full text-sm p-3 rounded-lg border border-gray-300 focus:border-amber-500 focus:outline-none mb-2"
                rows={3}
              ></textarea>
              <button onClick={handleReviewSubmit} className="bg-amber-800 text-white text-xs font-bold px-4 py-2 rounded-lg w-full">Submit Review</button>
            </div>
          )}
        </div>

        {/* Public Reviews (Fetched from DB - Uploaded by Admin) */}
        <div className="space-y-4">
          {reviews.length > 0 ? reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600 text-xs">
                    {review.customer_name.charAt(0)}
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-gray-900">{review.customer_name}</h5>
                    <div className="flex gap-1 text-[10px] text-gray-500"><CheckCircle2 className="h-3 w-3 text-green-500" /> Verified Buyer</div>
                  </div>
                </div>
                <div className="bg-green-700 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  {review.rating} <Star className="h-2.5 w-2.5 fill-white" />
                </div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed mt-2">{review.review_text}</p>
            </div>
          )) : (
            <div className="text-center py-4 text-sm text-gray-500">More reviews coming soon.</div>
          )}
        </div>
      </div>

      {/* Related Products */}
      <div className="bg-white px-4 py-5 shadow-sm">
        <h3 className="text-base font-extrabold text-gray-900 mb-4">You might also like</h3>
        <div className="flex overflow-x-auto gap-3 pb-2 hide-scrollbar">
          {relatedProducts.map((rp) => (
            <div key={rp.id} onClick={() => router.push(`/product/${rp.id}`)} className="min-w-[140px] border border-gray-100 rounded-xl p-2 shadow-sm shrink-0">
              <div className="h-24 bg-gray-50 rounded-lg flex justify-center items-center mb-2 text-2xl relative">
                 <span className="absolute top-1 left-1 bg-red-50 text-red-600 text-[8px] font-bold px-1 py-0.5 rounded">{rp.discount_tag}</span>
                 🌰
              </div>
              <h4 className="text-xs font-semibold text-gray-800 line-clamp-2 leading-tight h-8">{rp.name}</h4>
              <div className="mt-1 font-extrabold text-gray-900 text-sm">₹{rp.price}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.1)] z-50 flex gap-3">
        <button className="flex-1 bg-white border border-[#5C3A21] text-[#5C3A21] font-extrabold py-3.5 rounded-xl text-sm active:scale-95 transition flex justify-center items-center gap-2">
           <ShoppingCart className="h-4 w-4" /> Add to Cart
        </button>
        <button className="flex-1 bg-[#5C3A21] text-white font-extrabold py-3.5 rounded-xl text-sm shadow-md hover:bg-[#4a2e1a] active:scale-95 transition flex justify-center items-center gap-2">
           Buy Now <ChevronRight className="h-4 w-4" />
        </button>
      </div>

    </div>
  );
}
