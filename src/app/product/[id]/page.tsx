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
  
  const [customerReview, setCustomerReview] = useState("");
  const [localReviewSaved, setLocalReviewSaved] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      const supabaseUrl = "https://npzfzlkvdxweiaewnnem.supabase.co";
      const supabaseKey = "sb_publishable_it_SC_2dJQ8K4n7K4DqYjw_AaVk59xz";
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data: pData } = await supabase.from("products").select("*").eq("id", productId).single();
      if (pData) setProduct(pData);

      const { data: rData } = await supabase.from("product_reviews").select("*").eq("product_id", productId);
      if (rData) setReviews(rData);

      const { data: relData } = await supabase.from("products").select("*").neq("id", productId).limit(4);
      if (relData) setRelatedProducts(relData);

      const savedReview = localStorage.getItem(`review_${productId}`);
      if (savedReview) {
        setCustomerReview(savedReview);
        setLocalReviewSaved(true);
      }

      setLoading(false);
    };

    fetchProductDetails();
  }, [productId]);

  const handleBuyNow = () => {
    if(product) {
      localStorage.setItem("cartTotal", product.price.toString());
      const hasAddress = localStorage.getItem("deliveryAddress");
      router.push(hasAddress ? "/payment" : "/address");
    }
  };

  const handleAddToCart = () => {
    // For now, redirecting to home to add to actual cart list
    alert("Added! Please check your cart.");
    router.push("/");
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-800"></div></div>;
  if (!product) return <div className="p-10 text-center text-gray-700 text-xs">Product not found!</div>;

  const discountPercent = product.old_price > product.price ? Math.round(((product.old_price - product.price) / product.old_price) * 100) : 0;
  const savingsAmount = product.old_price - product.price;
  const imagesList = product.images && product.images.length > 0 ? product.images : [product.image_url || "https://via.placeholder.com/400"];

  return (
    <div className="min-h-screen bg-gray-100 pb-20 font-sans">
      <header className="bg-white/90 backdrop-blur-sm shadow-sm sticky top-0 z-50 px-4 h-12 flex items-center justify-between border-b border-gray-100">
        <button onClick={() => router.push('/')} className="bg-gray-100 p-1.5 rounded-full active:scale-95 transition">
          <ArrowLeft className="h-4 w-4 text-gray-800" />
        </button>
        <h1 className="text-[11px] font-bold text-gray-800 tracking-wider uppercase">Royal Basket</h1>
        <div onClick={() => router.push('/')} className="relative bg-gray-100 p-1.5 rounded-full cursor-pointer">
          <ShoppingCart className="h-4 w-4 text-gray-800" />
        </div>
      </header>

      <div className="bg-white relative border-b border-gray-100">
        {discountPercent > 0 && <div className="absolute top-3 left-3 z-10 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm">{discountPercent}% OFF</div>}
        <div className="w-full flex overflow-x-auto snap-x snap-mandatory hide-scrollbar">
          {imagesList.map((_: string, idx: number) => (
             <div key={idx} className="min-w-full snap-center h-60 bg-gray-50 flex justify-center items-center relative"><div className="text-6xl">🌰</div></div>
          ))}
        </div>
      </div>

      <div className="bg-white px-3.5 py-3 mb-1.5 shadow-sm">
        <div className="flex items-center gap-1 text-[10px] text-amber-600 font-bold mb-0.5 tracking-wider uppercase">RB No.1 Dry Fruits</div>
        <h1 className="text-lg font-bold text-gray-900 leading-tight mb-1">{product.name}</h1>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-0.5 bg-green-700 text-white px-1 py-0.5 rounded text-[9px] font-bold">{product.rating} <Star className="h-2.5 w-2.5 fill-white" /></div>
          <span className="text-[10px] text-gray-500 font-medium">{product.reviews_count} verified ratings</span>
        </div>
        <div className="bg-gray-50 rounded-lg p-2.5 mb-2.5 border border-gray-100 flex flex-col gap-1">
          <div className="flex items-end gap-1.5">
            <span className="text-2xl font-black text-gray-900 leading-none">₹{product.price}</span>
            {product.old_price && <span className="text-[10px] text-gray-400 line-through font-medium mb-0.5">₹{product.old_price}</span>}
          </div>
          {savingsAmount > 0 && <div className="text-[9px] text-green-700 font-bold flex items-center gap-1"><Tag className="h-3 w-3" /> You save ₹{savingsAmount}</div>}
        </div>
        <div>
          <h3 className="text-[10px] font-bold text-gray-900 mb-1.5">Select Unit</h3>
          <div className="flex gap-2"><button className="border-1 border-amber-800 bg-amber-50 text-amber-900 font-bold text-xs px-3 py-1 rounded-lg">{product.weight || "1 Kg"}</button></div>
        </div>
      </div>

      <div className="bg-white px-3.5 py-3.5 mb-1.5 shadow-sm space-y-2.5">
        <div className="flex items-center gap-2.5"><div className="bg-green-50 p-1.5 rounded-full"><Truck className="h-4 w-4 text-green-700" /></div><div><h4 className="text-xs font-bold text-gray-900">Free Delivery Available</h4><p className="text-[9px] text-gray-500">3-5 days delivery estimation</p></div></div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.1)] z-50 flex gap-2">
        <button onClick={handleAddToCart} className="flex-1 bg-white border border-[#5C3A21] text-[#5C3A21] font-bold py-2.5 rounded text-xs active:scale-95 transition flex justify-center items-center gap-1.5 shadow-sm">
           <ShoppingCart className="h-3.5 w-3.5" /> Add to Cart
        </button>
        <button onClick={handleBuyNow} className="flex-1 bg-[#5C3A21] text-white font-bold py-2.5 rounded text-xs shadow-md hover:bg-[#4a2e1a] active:scale-95 transition flex justify-center items-center gap-1.5">
           Buy Now <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
