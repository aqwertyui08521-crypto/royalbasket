"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient("https://npzfzlkvdxweiaewnnem.supabase.co", "sb_publishable_it_SC_2dJQ8K4n7K4DqYjw_AaVk59xz");

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("payments");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const [phonepe, setPhonepe] = useState("");
  const [paytm, setPaytm] = useState("");
  const [otherUpi, setOtherUpi] = useState("");

  const [selectedProductId, setSelectedProductId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState("5");
  const [reviewImageUrl, setReviewImageUrl] = useState("");
  
  // All Reviews State
  const [allReviews, setAllReviews] = useState<any[]>([]);

  const fetchReviews = async () => {
    const { data } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
    if (data) setAllReviews(data);
  };

  useEffect(() => {
    const fetchData = async () => {
      // Products fetch (কোনো চেঞ্জ করা হয়নি)
      const { data: prodData } = await supabase.from("products").select("id, name").order("name");
      if (prodData) setProducts(prodData);
      
      // Payment Global Load
      const { data: payData } = await supabase.from("payment_settings").select("*").eq("id", 1).single();
      if (payData) {
        setPhonepe(payData.phonepe || "");
        setPaytm(payData.paytm || "");
        setOtherUpi(payData.other_upi || "");
      }

      // Load all reviews for Manage Reviews section
      fetchReviews();
    };
    fetchData();
  }, []);

  const handleSavePayments = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setMsg("Saving payment options globally...");
    
    const { error } = await supabase.from("payment_settings").upsert([{ id: 1, phonepe, paytm, other_upi: otherUpi }]);
    
    if (error) {
      setMsg("Error saving to database! ❌");
    } else {
      setMsg("Payment options updated globally! 🎉");
    }
    
    setTimeout(() => setMsg(""), 3000);
    setLoading(false);
  };

  const handleReviewPhoto = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setMsg("Uploading photo...");
    const { data } = await supabase.storage.from('images').upload(`reviews/${Date.now()}.jpg`, file);
    if (data) {
      const { data: urlData } = supabase.storage.from('images').getPublicUrl(data.path);
      setReviewImageUrl(urlData.publicUrl);
      setMsg("Photo uploaded! ✅");
    } else {
      setMsg("Photo upload failed. ❌");
    }
    setTimeout(() => setMsg(""), 3000);
    setLoading(false);
  };

  const handleSaveReview = async (e: any) => {
    e.preventDefault();
    if (!selectedProductId || !reviewText) {
      alert("Please select a product and write a review.");
      return;
    }
    setLoading(true);
    setMsg("Saving review...");
    const { error } = await supabase.from("reviews").insert([
      { product_id: selectedProductId, customer_name: customerName, review_text: reviewText, rating: Number(rating), image_url: reviewImageUrl }
    ]);
    if (!error) {
      setMsg("Review added successfully! 🎉");
      setSelectedProductId(""); setCustomerName(""); setReviewText(""); setRating("5"); setReviewImageUrl("");
      fetchReviews(); // Update the list immediately
    } else {
      setMsg("Review save failed. ❌");
    }
    setTimeout(() => setMsg(""), 3000);
    setLoading(false);
  };

  const handleDeleteReview = async (id: number) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    setLoading(true);
    setMsg("Deleting review...");
    
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (!error) {
      setMsg("Review deleted successfully! 🗑️");
      setAllReviews(allReviews.filter(r => r.id !== id));
    } else {
      setMsg("Failed to delete review. ❌");
    }
    setTimeout(() => setMsg(""), 3000);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-black p-4 font-sans pb-10">
      <div className="bg-white p-6 rounded-3xl mb-6 shadow-sm max-w-md mx-auto border border-gray-100">
        <h1 className="text-2xl font-black text-gray-900 leading-tight">Admin Dashboard</h1>
        <p className="text-xs text-gray-500 font-medium mt-1">Manage your store settings and products</p>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-6">
        <div onClick={() => router.push('/admin/products')} className="bg-[#5C3A21] text-white p-5 rounded-3xl flex flex-col items-center justify-center text-center gap-2 shadow-sm cursor-pointer active:scale-95 transition-transform">
          <span className="text-3xl mb-1">📦</span>
          <span className="text-sm font-bold">Products</span>
        </div>
        <div onClick={() => setActiveTab("payments")} className={`p-5 rounded-3xl flex flex-col items-center justify-center text-center gap-2 shadow-sm cursor-pointer active:scale-95 transition-transform border ${activeTab === "payments" ? 'bg-[#fdf8f5] border-2 border-[#5C3A21] text-[#5C3A21]' : 'bg-white border-transparent text-gray-800'}`}>
          <span className="text-3xl mb-1">💳</span>
          <span className="text-sm font-bold">Payments</span>
        </div>
        <div onClick={() => setActiveTab("reviews")} className={`p-5 rounded-3xl flex flex-col items-center justify-center text-center gap-2 shadow-sm cursor-pointer active:scale-95 transition-transform border ${activeTab === "reviews" ? 'bg-[#fdf8f5] border-2 border-[#5C3A21] text-[#5C3A21]' : 'bg-white border-transparent text-gray-800'}`}>
          <span className="text-3xl mb-1">⭐</span>
          <span className="text-sm font-bold">Reviews</span>
        </div>
        <div className="bg-white/60 text-gray-400 p-5 rounded-3xl flex flex-col items-center justify-center text-center gap-2 border border-transparent opacity-60">
          <span className="text-3xl mb-1">⚙️</span>
          <span className="text-sm font-bold">Settings</span>
        </div>
      </div>

      {msg && <div className="max-w-md mx-auto mb-4 p-3 text-xs font-bold rounded-xl bg-[#5C3A21]/10 text-[#5C3A21] text-center">{msg}</div>}

      <div className="max-w-md mx-auto">
        {activeTab === "payments" ? (
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-5">
            <h2 className="text-lg font-black text-gray-900">Set Payment Options</h2>
            <form onSubmit={handleSavePayments} className="space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-2">PHONEPE UPI</label>
                <input type="text" value={phonepe} onChange={e => setPhonepe(e.target.value)} className="w-full bg-[#f8f9fa] border-none p-4 rounded-2xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5C3A21]/20" />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-2">PAYTM UPI</label>
                <input type="text" value={paytm} onChange={e => setPaytm(e.target.value)} className="w-full bg-[#f8f9fa] border-none p-4 rounded-2xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5C3A21]/20" />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-2">ANY OTHER UPI (GPAY/BHIM)</label>
                <input type="text" value={otherUpi} onChange={e => setOtherUpi(e.target.value)} className="w-full bg-[#f8f9fa] border-none p-4 rounded-2xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5C3A21]/20" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-[#111] text-white py-4 rounded-2xl font-bold text-sm active:scale-95 transition-transform mt-2">
                Save Options Globally
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* Add Review Form */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-5">
              <h2 className="text-lg font-black text-gray-900">Add Product Review</h2>
              <form onSubmit={handleSaveReview} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-2">SELECT PRODUCT</label>
                  <select value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)} className="w-full bg-[#f8f9fa] border-none p-4 rounded-2xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5C3A21]/20" required>
                    <option value="">-- Choose a Product --</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-2">CUSTOMER NAME</label>
                  <input type="text" placeholder="e.g. Rahul Sharma" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full bg-[#f8f9fa] border-none p-4 rounded-2xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5C3A21]/20" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-2">RATING</label>
                    <select value={rating} onChange={e => setRating(e.target.value)} className="w-full bg-[#f8f9fa] border-none p-4 rounded-2xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5C3A21]/20">
                      <option value="5">5 Star ★★★★★</option>
                      <option value="4">4 Star ★★★★☆</option>
                      <option value="3">3 Star ★★★☆☆</option>
                      <option value="2">2 Star ★★☆☆☆</option>
                      <option value="1">1 Star ★☆☆☆☆</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-2">UPLOAD PHOTO</label>
                    <input type="file" accept="image/*" onChange={handleReviewPhoto} disabled={loading} className="w-full bg-[#f8f9fa] border-none p-3.5 rounded-2xl text-xs focus:outline-none" />
                  </div>
                </div>
                {reviewImageUrl && (
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden">
                    <img src={reviewImageUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setReviewImageUrl("")} className="absolute top-0 right-0 bg-red-500 text-white w-5 h-5 flex items-center justify-center text-[10px] font-bold rounded-bl-lg">✕</button>
                  </div>
                )}
                <div>
                  <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-2">COMMENT / REVIEW</label>
                  <textarea placeholder="Write review..." value={reviewText} onChange={e => setReviewText(e.target.value)} className="w-full bg-[#f8f9fa] border-none p-4 rounded-2xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5C3A21]/20" rows={3} required />
                </div>
                <button type="submit" disabled={loading} className="w-full bg-[#5C3A21] text-white py-4 rounded-2xl font-bold text-sm active:scale-95 transition-transform mt-2">
                  Submit Review
                </button>
              </form>
            </div>

            {/* Manage Reviews List */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mt-6 space-y-4">
              <h2 className="text-lg font-black text-gray-900">Manage Reviews</h2>
              {allReviews.length === 0 ? (
                <p className="text-xs text-gray-500 font-medium">No reviews found in database.</p>
              ) : (
                <div className="space-y-3">
                  {allReviews.map((r: any) => {
                    const prodName = products.find(p => p.id === r.product_id)?.name || "Unknown Product";
                    return (
                      <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="flex-1 min-w-0 pr-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] bg-[#198754] text-white px-1.5 py-0.5 rounded font-bold">{r.rating} ★</span>
                            <span className="text-[10px] font-bold text-gray-800 truncate">{r.customer_name || "Verified Buyer"}</span>
                          </div>
                          <p className="text-[10px] font-extrabold text-[#5C3A21] truncate mb-0.5">{prodName}</p>
                          <p className="text-[11px] text-gray-600 truncate">{r.review_text}</p>
                        </div>
                        <button onClick={() => handleDeleteReview(r.id)} disabled={loading} className="bg-red-100 text-red-600 px-3 py-2 rounded-xl text-xs font-black active:scale-95 transition-transform shrink-0">
                          Delete
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
