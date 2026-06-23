"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, ArrowLeft, Star, ShieldCheck, Tag, ChevronRight, CheckCircle2, RotateCcw, Truck, X } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

export default function ProductDetails({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const productId = resolvedParams.id;

  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [cart, setCart] = useState<Record<string, number>>({});
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      const supabaseUrl = "https://npzfzlkvdxweiaewnnem.supabase.co";
      const supabaseKey = "sb_publishable_it_SC_2dJQ8K4n7K4DqYjw_AaVk59xz";
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data: allData } = await supabase.from("products").select("*");
      if (allData) setAllProducts(allData);

      const { data: pData } = await supabase.from("products").select("*").eq("id", productId).single();
      if (pData) setProduct(pData);

      const { data: rData } = await supabase.from("product_reviews").select("*").eq("product_id", productId);
      if (rData) setReviews(rData);

      const { data: relData } = await supabase.from("products").select("*").neq("id", productId).limit(6);
      if (relData) setRelatedProducts(relData);

      const savedCart = localStorage.getItem("royal_cart");
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }

      setLoading(false);
    };

    fetchAllData();
  }, [productId]);

  const updateCart = (id: string, delta: number) => {
    setCart((prev) => {
      const current = prev[id] || 0;
      const next = current + delta;
      const newCart = { ...prev };
      if (next <= 0) delete newCart[id];
      else newCart[id] = next;
      localStorage.setItem("royal_cart", JSON.stringify(newCart));
      return newCart;
    });
  };

  const totalCartItems = Object.values(cart).reduce((sum, count) => sum + count, 0);
  const totalAmount = allProducts.reduce((sum, p) => sum + (p.price * (cart[p.id] || 0)), 0);
  const totalOldAmount = allProducts.reduce((sum, p) => sum + ((p.old_price || p.price) * (cart[p.id] || 0)), 0);
  const totalSaved = totalOldAmount - totalAmount;

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5C3A21]"></div></div>;
  if (!product) return <div className="p-10 text-center text-gray-700 text-xs">Product not found!</div>;

  const imagesList = product.images && product.images.length > 0 ? product.images : [product.image_url || "https://via.placeholder.com/400"];
  const currentInCart = cart[product.id] || 0;

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40 px-4 h-14 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/')} className="active:scale-95 transition">
            <ArrowLeft className="h-6 w-6 text-gray-800" />
          </button>
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">Product Details</h1>
        </div>
        <div onClick={() => setIsCheckoutOpen(true)} className="relative p-2 cursor-pointer bg-gray-50 rounded-full">
          <ShoppingCart className="h-5 w-5 text-gray-800" />
          {totalCartItems > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border border-white">{totalCartItems}</span>}
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
        </div>
      </div>

      {/* Product Basic Info */}
      <div className="bg-white px-4 py-4 mb-2">
        <div className="flex items-center gap-1 text-xs text-[#5C3A21] font-bold mb-1 uppercase tracking-widest">Royal Basket No.1</div>
        <h1 className="text-xl font-bold text-gray-900 leading-tight mb-2">{product.name}</h1>
        
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1 bg-green-700 text-white px-1.5 py-0.5 rounded text-[11px] font-bold">{product.rating} <Star className="h-3 w-3 fill-white" /></div>
          <span className="text-xs text-gray-500 font-medium">{product.reviews_count} Ratings & Reviews</span>
        </div>

        <div className="bg-[#F8F9FA] rounded-2xl p-4 mb-4 border border-gray-100 relative">
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-gray-900 leading-none">₹{product.price}</span>
            {product.old_price && <span className="text-sm text-gray-400 line-through font-medium mb-0.5">₹{product.old_price}</span>}
          </div>
          {product.old_price > product.price && <div className="text-xs text-green-700 font-bold mt-2 flex items-center gap-1"><Tag className="h-4 w-4" /> You save ₹{product.old_price - product.price} on this item</div>}
        </div>

        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-2">Select Unit</h3>
          <div className="flex gap-2">
            <button className="border-2 border-[#5C3A21] text-[#5C3A21] font-bold text-sm px-4 py-2 rounded-xl">{product.weight || "1 Kg"}</button>
          </div>
        </div>
      </div>

      {/* Highlighted Badges */}
      <div className="grid grid-cols-3 gap-2.5 px-4 py-4 bg-white mb-2">
         <div className="flex flex-col items-center justify-center p-3 border border-[#EADBC8] rounded-2xl bg-[#FFFDF9] shadow-sm"><Truck className="h-6 w-6 text-[#5C3A21] mb-1.5" /><span className="text-xs font-black text-black text-center leading-tight">Delivery info</span></div>
         <div className="flex flex-col items-center justify-center p-3 border border-[#EADBC8] rounded-2xl bg-[#FFFDF9] shadow-sm"><RotateCcw className="h-6 w-6 text-[#5C3A21] mb-1.5" /><span className="text-xs font-black text-black text-center leading-tight">Return policy</span></div>
         <div className="flex flex-col items-center justify-center p-3 border border-[#EADBC8] rounded-2xl bg-[#FFFDF9] shadow-sm"><ShieldCheck className="h-6 w-6 text-[#5C3A21] mb-1.5" /><span className="text-xs font-black text-black text-center leading-tight">Safe pack</span></div>
      </div>

      {/* Available Offers */}
      <div className="bg-[#F8F6F2] p-4 mb-2">
        <div className="flex items-center gap-2 mb-3"><Tag className="h-5 w-5 text-[#5C3A21]" /><h3 className="text-sm font-extrabold text-gray-900">Available offers</h3></div>
        <div className="space-y-3">
          <div><h4 className="text-xs font-bold text-[#5C3A21]">BUY 3 GET 1 FREE</h4><p className="text-xs text-gray-600 mt-0.5">Add 4 items to your cart to avail this offer.</p></div>
          <div><h4 className="text-xs font-bold text-[#5C3A21]">BUY 5 GET 2 FREE</h4><p className="text-xs text-gray-600 mt-0.5">Add 7 items to your cart to avail this offer.</p></div>
        </div>
      </div>

      {/* Return & Refund Support */}
      <div className="bg-white p-4 mb-2">
        <div className="bg-[#F8F9FA] border border-gray-100 p-4 rounded-2xl flex gap-3 items-start">
           <div className="bg-[#F4EFE6] p-2 rounded-full shrink-0"><ShieldCheck className="h-5 w-5 text-[#5C3A21]" /></div>
           <div><h3 className="text-sm font-bold text-gray-900 mb-1">Return & refund support</h3><p className="text-xs text-gray-600 leading-relaxed">Wrong, missing or damaged item par replacement/refund support available hai. Delivery ke 24 hours ke andar contact karein.</p></div>
        </div>
      </div>

      {/* Product Description */}
      <div className="bg-white px-4 py-5 mb-2">
        <h3 className="text-base font-extrabold text-gray-900 mb-3 border-b border-gray-100 pb-2">Product Description</h3>
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line mb-6">{product.description || "Handpicked premium quality dry fruits selected directly from top farms."}</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100"><p className="text-[10px] text-gray-500 font-bold uppercase">Weight</p><p className="text-sm font-extrabold text-gray-900">{product.weight || '1 Kg'}</p></div>
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100"><p className="text-[10px] text-gray-500 font-bold uppercase">Category</p><p className="text-sm font-extrabold text-gray-900">{product.category || 'Premium'}</p></div>
        </div>
      </div>

      {/* Similar Products */}
      <div className="bg-[#F8F9FA] px-4 py-5 mb-2">
        <div className="flex justify-between items-end mb-1"><h3 className="text-lg font-black text-gray-900">Similar products</h3><span className="text-xs font-bold text-[#5C3A21]">View all</span></div>
        <p className="text-[10px] text-gray-500 mb-4 font-medium">Auto scroll right to left - swipe anytime</p>
        <div className="flex overflow-x-auto gap-4 pb-2 hide-scrollbar">
          {relatedProducts.map((rp) => (
            <div key={rp.id} onClick={() => router.push(`/product/${rp.id}`)} className="min-w-[150px] max-w-[150px] bg-white border border-gray-100 rounded-2xl p-3 shadow-sm shrink-0 flex flex-col cursor-pointer">
              <div className="h-24 bg-gray-50 rounded-xl flex justify-center items-center mb-2 text-3xl">🌰</div>
              <h4 className="text-xs font-bold text-gray-900 line-clamp-2 leading-tight mb-1">{rp.name}</h4>
              <div className="font-black text-gray-900 mt-auto">₹{rp.price}</div>
            </div>
          ))}
        </div>
      </div>

      {/* RESTORED: Ratings & Reviews */}
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
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 shadow-[0_-8px_20px_-3px_rgba(0,0,0,0.08)] z-30 rounded-t-3xl">
        {currentInCart > 0 ? (
          <div className="w-full bg-[#5C3A21] text-white font-extrabold py-3.5 rounded-2xl flex items-center justify-between px-4 shadow-sm">
            <button onClick={() => updateCart(product.id, -1)} className="text-2xl font-bold px-4">−</button>
            <span onClick={() => setIsCheckoutOpen(true)} className="text-base cursor-pointer">{currentInCart} in cart (View Checkout)</span>
            <button onClick={() => updateCart(product.id, 1)} className="text-2xl font-bold px-4">+</button>
          </div>
        ) : (
          <div className="flex gap-3">
             <button onClick={() => { updateCart(product.id, 1); setIsCheckoutOpen(true); }} className="flex-1 bg-white border-2 border-[#5C3A21] text-[#5C3A21] font-extrabold py-3.5 rounded-2xl text-sm transition">Add to Cart</button>
             <button onClick={() => { if(currentInCart === 0) updateCart(product.id, 1); setIsCheckoutOpen(true); }} className="flex-1 bg-[#5C3A21] text-white font-extrabold py-3.5 rounded-2xl text-sm flex justify-center items-center gap-1 shadow-md">
               Buy Now <ChevronRight className="h-4 w-4" />
             </button>
          </div>
        )}
      </div>

      {/* Checkout Drawer */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex flex-col justify-end backdrop-blur-sm transition-opacity">
          <div className="bg-[#f8f8f8] w-full rounded-t-[24px] max-h-[85vh] flex flex-col animate-[slideUp_0.3s_ease-out]">
            <div className="flex justify-between items-center px-5 py-4 bg-white rounded-t-[24px]">
              <div><h2 className="text-xl font-extrabold text-gray-900">Checkout</h2><p className="text-xs text-gray-500 font-medium mt-0.5">{totalCartItems} item{totalCartItems !== 1 ? 's' : ''}</p></div>
              <button onClick={() => setIsCheckoutOpen(false)} className="bg-gray-100 p-2 rounded-full"><X className="h-5 w-5 text-gray-600" /></button>
            </div>

            {totalCartItems === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center text-center px-4">
                <div className="bg-gray-200 h-24 w-24 rounded-full flex items-center justify-center mb-5"><ShoppingCart className="h-10 w-10 text-gray-400" /></div>
                <h3 className="text-xl font-black text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-sm text-gray-500 font-medium mb-8">Looks like you haven't added any premium dry fruits yet.</p>
                <button onClick={() => { setIsCheckoutOpen(false); router.push('/'); }} className="bg-[#5C3A21] text-white font-extrabold py-3.5 px-8 rounded-2xl text-sm flex items-center gap-2">Continue Shopping <ChevronRight className="h-4 w-4" /></button>
              </div>
            ) : (
              <>
                <div className="overflow-y-auto px-4 py-4 space-y-4">
                  <div className="space-y-3">
                    {allProducts.filter(p => cart[p.id]).map(p => (
                      <div key={p.id} className="bg-white p-3.5 rounded-2xl flex items-center gap-4 shadow-sm border border-gray-100">
                        <div className="h-16 w-16 bg-gray-50 rounded-xl flex items-center justify-center text-3xl">🌰</div>
                        <div className="flex-1"><h4 className="font-bold text-sm text-gray-900 leading-tight pr-2">{p.name}</h4><div className="font-extrabold text-gray-900 mt-1 text-base">₹{p.price}</div></div>
                        <div className="bg-[#5C3A21] text-white rounded-xl flex items-center px-2.5 py-1.5"><button onClick={() => updateCart(p.id, -1)} className="text-lg font-medium px-2">−</button><span className="font-bold text-sm min-w-[20px] text-center">{cart[p.id]}</span><button onClick={() => updateCart(p.id, 1)} className="text-lg font-medium px-2">+</button></div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-t-3xl shadow-[0_-8px_15px_-3px_rgba(0,0,0,0.08)] mt-auto pb-6">
                  {totalSaved > 0 && <div className="bg-[#F4EFE6] text-[#5C3A21] text-xs font-bold py-2.5 text-center rounded-xl mb-4 flex justify-center items-center gap-1.5"><Tag className="h-3.5 w-3.5 fill-[#5C3A21]" /> You saved ₹{totalSaved} on this order</div>}
                  <div className="flex justify-between items-center mb-4 px-1"><span className="text-gray-600 text-sm font-medium">To Pay</span><span className="text-2xl font-extrabold text-gray-900">₹{totalAmount}</span></div>
                  <button onClick={() => { localStorage.setItem("cartTotal", totalAmount.toString()); router.push("/checkout"); }} className="w-full bg-[#5C3A21] text-white font-bold py-4 rounded-2xl text-lg flex items-center justify-center gap-2 shadow-md">
                    Buy Now <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
