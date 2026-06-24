"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Package, ListOrdered, Settings, Tags, CheckCircle2, Users, ImageIcon, Star, FolderHeart, Truck, CreditCard } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient("https://npzfzlkvdxweiaewnnem.supabase.co", "sb_publishable_it_SC_2dJQ8K4n7K4DqYjw_AaVk59xz");

export default function MasterAdminHub() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("settings");
  const [toastMsg, setToastMsg] = useState("");

  // DB States
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [settings, setStoreSettings] = useState<any>({});

  // Forms
  const [prodForm, setProdForm] = useState({ name: "", sku: "", price: "", old_price: "", weight: "1 Kg", category: "Dry Fruits", short_description: "", full_description: "", stock_quantity: "50", sale_badge: "NEW", gallery_urls: "" });
  const [reviewForm, setReviewForm] = useState({ product_id: "", customer_name: "", rating: "5", review_text: "", photo_url: "" });
  const [bannerForm, setBannerForm] = useState({ title: "", subtitle: "", image_url: "", cta_link: "/products" });

  useEffect(() => { if (sessionStorage.getItem("admin_auth_token") === "true") { setIsAuthenticated(true); fetchCoreData(); } }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "7811743286") { sessionStorage.setItem("admin_auth_token", "true"); setIsAuthenticated(true); fetchCoreData(); } 
    else { alert("Incorrect Password!"); setPassword(""); }
  };

  const fetchCoreData = async () => {
    const { data: prods } = await supabase.from("products").select("*").order("created_at", { ascending: false }); if (prods) setProducts(prods);
    const { data: cats } = await supabase.from("categories").select("*"); if (cats) setCategories(cats);
    const { data: bans } = await supabase.from("banners").select("*"); if (bans) setBanners(bans);
    const { data: ords } = await supabase.from("orders").select("*").order("created_at", { ascending: false }); if (ords) setOrders(ords);
    const { data: revs } = await supabase.from("product_reviews").select("*, products(name)").order("created_at", { ascending: false }); if (revs) setReviews(revs);
    const { data: setts } = await supabase.from("store_settings").select("*").eq("id", 1).single(); if (setts) setStoreSettings(setts);
  };

  const triggerNotification = (msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(""), 3000); };

  const saveSettings = async () => { await supabase.from("store_settings").upsert({ id: 1, ...settings }); triggerNotification("Payment & Settings Saved!"); fetchCoreData(); };
  
  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodForm.name || !prodForm.price) return alert("Required fields missing");
    const payload = { ...prodForm, price: parseFloat(prodForm.price), old_price: parseFloat(prodForm.old_price||'0'), stock_quantity: parseInt(prodForm.stock_quantity), image_gallery: prodForm.gallery_urls.split(",") };
    await supabase.from("products").insert([payload]);
    triggerNotification("Product Added!"); fetchCoreData();
  };

  const saveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!reviewForm.product_id || !reviewForm.customer_name) return alert("Missing fields");
    await supabase.from("product_reviews").insert([{ ...reviewForm, rating: parseFloat(reviewForm.rating) }]);
    triggerNotification("Review Added with Photo!"); fetchCoreData();
  };

  const saveBanner = async () => {
    await supabase.from("banners").insert([bannerForm]); triggerNotification("Banner Added!"); fetchCoreData();
  };

  const deleteRow = async (table: string, id: string) => { if(confirm("Delete?")) { await supabase.from(table).delete().eq("id", id); fetchCoreData(); } };

  if (!isAuthenticated) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm text-center"><Lock className="h-10 w-10 text-[#5C3A21] mx-auto mb-4" /><form onSubmit={handleLogin}><input type="password" placeholder="Passcode" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border-2 border-gray-300 p-4 rounded-xl text-center text-xl font-black text-black tracking-widest mb-4 focus:border-[#5C3A21] focus:outline-none placeholder-gray-400"/><button className="w-full bg-[#5C3A21] text-white py-4 rounded-xl font-bold uppercase tracking-widest">LOGIN</button></form></div></div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      <aside className="w-full md:w-56 bg-white border-r flex flex-col sticky top-0 z-50">
         <div className="p-4 bg-[#5C3A21] text-white font-black uppercase">Admin Panel</div>
         <div className="flex overflow-x-auto md:flex-col p-2 gap-1 hide-scrollbar">
            <button onClick={()=>setActiveTab('settings')} className={`flex items-center gap-2 p-3 rounded-xl font-bold text-xs uppercase ${activeTab==='settings'?'bg-[#F4EFE6] text-[#5C3A21] text-black':'text-gray-700 hover:bg-gray-100'}`}><CreditCard className="h-4 w-4"/> Payments & Setup</button>
            <button onClick={()=>setActiveTab('products')} className={`flex items-center gap-2 p-3 rounded-xl font-bold text-xs uppercase ${activeTab==='products'?'bg-[#F4EFE6] text-[#5C3A21] text-black':'text-gray-700 hover:bg-gray-100'}`}><Package className="h-4 w-4"/> Products</button>
            <button onClick={()=>setActiveTab('reviews')} className={`flex items-center gap-2 p-3 rounded-xl font-bold text-xs uppercase ${activeTab==='reviews'?'bg-[#F4EFE6] text-[#5C3A21] text-black':'text-gray-700 hover:bg-gray-100'}`}><Star className="h-4 w-4"/> Reviews</button>
            <button onClick={()=>setActiveTab('banners')} className={`flex items-center gap-2 p-3 rounded-xl font-bold text-xs uppercase ${activeTab==='banners'?'bg-[#F4EFE6] text-[#5C3A21] text-black':'text-gray-700 hover:bg-gray-100'}`}><ImageIcon className="h-4 w-4"/> Banners</button>
            <button onClick={()=>setActiveTab('orders')} className={`flex items-center gap-2 p-3 rounded-xl font-bold text-xs uppercase ${activeTab==='orders'?'bg-[#F4EFE6] text-[#5C3A21] text-black':'text-gray-700 hover:bg-gray-100'}`}><ListOrdered className="h-4 w-4"/> Orders</button>
         </div>
      </aside>

      <main className="flex-1 p-4 overflow-y-auto">
         
         {activeTab === 'settings' && (
            <div className="space-y-6">
               <div className="bg-white p-6 rounded-2xl border shadow-sm max-w-2xl">
                  <h3 className="font-black text-black mb-4 border-b pb-2 uppercase"><CreditCard className="inline h-5 w-5 mr-2 text-[#5C3A21]"/> User Payment Gateways</h3>
                  <div className="space-y-4">
                     <div><label className="text-xs font-black text-black block mb-1">PhonePe UPI ID</label><input type="text" value={settings.phonepe_upi||''} onChange={e=>setStoreSettings({...settings, phonepe_upi:e.target.value})} className="w-full border-2 border-gray-300 p-3 rounded-xl text-sm font-black text-black placeholder-gray-400 focus:outline-none focus:border-[#5C3A21]" placeholder="yourname@ybl"/></div>
                     <div><label className="text-xs font-black text-black block mb-1">Paytm / GPay UPI ID</label><input type="text" value={settings.paytm_upi||''} onChange={e=>setStoreSettings({...settings, paytm_upi:e.target.value})} className="w-full border-2 border-gray-300 p-3 rounded-xl text-sm font-black text-black placeholder-gray-400 focus:outline-none focus:border-[#5C3A21]" placeholder="number@paytm"/></div>
                     <div><label className="text-xs font-black text-black block mb-1">QR Code Image Link</label><input type="text" value={settings.qr_code_url||''} onChange={e=>setStoreSettings({...settings, qr_code_url:e.target.value})} className="w-full border-2 border-gray-300 p-3 rounded-xl text-sm font-black text-black placeholder-gray-400 focus:outline-none focus:border-[#5C3A21]" placeholder="URL of your QR Code"/></div>
                     <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200">
                        <span className="text-sm font-black text-black">Enable Cash on Delivery (COD)</span>
                        <input type="checkbox" checked={settings.cod_enabled||false} onChange={e=>setStoreSettings({...settings, cod_enabled:e.target.checked})} className="h-5 w-5 accent-[#5C3A21]"/>
                     </div>
                  </div>
               </div>

               <div className="bg-white p-6 rounded-2xl border shadow-sm max-w-2xl">
                  <h3 className="font-black text-black mb-4 border-b pb-2 uppercase">Store Setup & Shipping</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                     <div><label className="text-xs font-black text-black block mb-1">Delivery Charge (₹)</label><input type="number" value={settings.shipping_charge||0} onChange={e=>setStoreSettings({...settings, shipping_charge:e.target.value})} className="w-full border-2 border-gray-300 p-3 rounded-xl text-sm font-black text-black placeholder-gray-400 focus:outline-none focus:border-[#5C3A21]"/></div>
                     <div><label className="text-xs font-black text-black block mb-1">Support WhatsApp</label><input type="text" value={settings.support_phone||''} onChange={e=>setStoreSettings({...settings, support_phone:e.target.value})} className="w-full border-2 border-gray-300 p-3 rounded-xl text-sm font-black text-black placeholder-gray-400 focus:outline-none focus:border-[#5C3A21]"/></div>
                  </div>
                  <button onClick={saveSettings} className="w-full bg-[#5C3A21] text-white font-black py-4 rounded-xl text-xs uppercase tracking-widest hover:bg-[#4A2E1A] transition">Save Payment & Settings</button>
               </div>
            </div>
         )}

         {activeTab === 'products' && (
            <div className="space-y-6">
               <form onSubmit={saveProduct} className="bg-white p-6 rounded-2xl border shadow-sm">
                  <h3 className="font-black text-black mb-4 uppercase">Add New Product</h3>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                     <input type="text" placeholder="Name" value={prodForm.name} onChange={e=>setProdForm({...prodForm, name:e.target.value})} className="border-2 border-gray-300 p-2 rounded-lg text-sm font-black text-black placeholder-gray-400 focus:outline-none focus:border-[#5C3A21]" required/>
                     <input type="number" placeholder="Price (₹)" value={prodForm.price} onChange={e=>setProdForm({...prodForm, price:e.target.value})} className="border-2 border-gray-300 p-2 rounded-lg text-sm font-black text-black placeholder-gray-400 focus:outline-none focus:border-[#5C3A21]" required/>
                     <input type="number" placeholder="Old Price (₹)" value={prodForm.old_price} onChange={e=>setProdForm({...prodForm, old_price:e.target.value})} className="border-2 border-gray-300 p-2 rounded-lg text-sm font-black text-black placeholder-gray-400 focus:outline-none focus:border-[#5C3A21]"/>
                     <input type="text" placeholder="Weight (e.g. 1Kg)" value={prodForm.weight} onChange={e=>setProdForm({...prodForm, weight:e.target.value})} className="border-2 border-gray-300 p-2 rounded-lg text-sm font-black text-black placeholder-gray-400 focus:outline-none focus:border-[#5C3A21]"/>
                     <select value={prodForm.category} onChange={e=>setProdForm({...prodForm, category:e.target.value})} className="border-2 border-gray-300 p-2 rounded-lg text-sm font-black text-black bg-white focus:outline-none focus:border-[#5C3A21]">
                        <option>Dry Fruits</option>{categories.map(c=><option key={c.id}>{c.name}</option>)}
                     </select>
                     <input type="text" placeholder="Stock Qty" value={prodForm.stock_quantity} onChange={e=>setProdForm({...prodForm, stock_quantity:e.target.value})} className="border-2 border-gray-300 p-2 rounded-lg text-sm font-black text-black placeholder-gray-400 focus:outline-none focus:border-[#5C3A21]"/>
                  </div>
                  <textarea placeholder="Short Description..." value={prodForm.short_description} onChange={e=>setProdForm({...prodForm, short_description:e.target.value})} className="w-full border-2 border-gray-300 p-2 rounded-lg text-sm font-black text-black placeholder-gray-400 mb-3 focus:outline-none focus:border-[#5C3A21]"/>
                  <input type="text" placeholder="Image URLs (Comma separated)" value={prodForm.gallery_urls} onChange={e=>setProdForm({...prodForm, gallery_urls:e.target.value})} className="w-full border-2 border-gray-300 p-2 rounded-lg text-sm font-black text-black placeholder-gray-400 mb-3 focus:outline-none focus:border-[#5C3A21]"/>
                  <button type="submit" className="w-full bg-[#5C3A21] text-white py-3 rounded-lg font-black text-xs uppercase tracking-widest hover:bg-[#4A2E1A] transition">Save Product</button>
               </form>
               <div className="bg-white p-4 rounded-2xl border shadow-sm">
                  <h3 className="font-black text-black mb-3">Live Products ({products.length})</h3>
                  {products.map(p=>(<div key={p.id} className="flex justify-between border-b border-gray-200 py-2 text-sm font-black text-black"><span>{p.name} (₹{p.price})</span><button onClick={()=>deleteRow("products", p.id)} className="text-red-500 hover:text-red-700 transition">Delete</button></div>))}
               </div>
            </div>
         )}

         {activeTab === 'reviews' && (
            <div className="space-y-6">
               <form onSubmit={saveReview} className="bg-white p-6 rounded-2xl border shadow-sm max-w-2xl">
                  <h3 className="font-black text-black mb-4 uppercase">Add Customer Review</h3>
                  <div className="space-y-3">
                     <select value={reviewForm.product_id} onChange={e=>setReviewForm({...reviewForm, product_id:e.target.value})} className="w-full border-2 border-gray-300 p-3 rounded-xl text-sm font-black text-black bg-white focus:outline-none focus:border-[#5C3A21]">
                        <option value="">Select Product...</option>
                        {products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                     </select>
                     <div className="grid grid-cols-2 gap-3">
                        <input type="text" placeholder="Customer Name" value={reviewForm.customer_name} onChange={e=>setReviewForm({...reviewForm, customer_name:e.target.value})} className="border-2 border-gray-300 p-3 rounded-xl text-sm font-black text-black placeholder-gray-400 focus:outline-none focus:border-[#5C3A21]"/>
                        <input type="number" step="0.1" placeholder="Rating (1-5)" value={reviewForm.rating} onChange={e=>setReviewForm({...reviewForm, rating:e.target.value})} className="border-2 border-gray-300 p-3 rounded-xl text-sm font-black text-black placeholder-gray-400 focus:outline-none focus:border-[#5C3A21]"/>
                     </div>
                     <textarea placeholder="Review Comment..." rows={3} value={reviewForm.review_text} onChange={e=>setReviewForm({...reviewForm, review_text:e.target.value})} className="w-full border-2 border-gray-300 p-3 rounded-xl text-sm font-black text-black placeholder-gray-400 focus:outline-none focus:border-[#5C3A21]"/>
                     <input type="text" placeholder="Review Photo Link (Optional)" value={reviewForm.photo_url} onChange={e=>setReviewForm({...reviewForm, photo_url:e.target.value})} className="w-full border-2 border-gray-300 p-3 rounded-xl text-sm font-black text-black placeholder-gray-400 focus:outline-none focus:border-[#5C3A21]"/>
                     
                     <button type="submit" className="w-full bg-[#5C3A21] text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#4A2E1A] transition">Publish Review</button>
                  </div>
               </form>
               <div className="bg-white p-4 rounded-2xl border shadow-sm max-w-2xl">
                  <h3 className="font-black text-black mb-3">Live Reviews</h3>
                  {reviews.map(r=>(<div key={r.id} className="border-b border-gray-200 py-3 text-sm text-black">
                     <p className="font-black">{r.customer_name} <span className="text-amber-500">({r.rating}★)</span></p>
                     <p className="text-gray-800 my-1 font-medium">{r.review_text}</p>
                     {r.photo_url && <img src={r.photo_url} className="h-16 w-16 object-cover rounded mt-1 border border-gray-300" alt="review"/>}
                     <button onClick={()=>deleteRow("product_reviews", r.id)} className="text-red-500 font-bold mt-2 hover:text-red-700 transition">Delete</button>
                  </div>))}
               </div>
            </div>
         )}

         {activeTab === 'banners' && (
            <div className="space-y-6">
               <div className="bg-white p-6 rounded-2xl border shadow-sm max-w-md">
                  <h3 className="font-black text-black mb-4 uppercase">Add Sliding Banner</h3>
                  <div className="space-y-3">
                     <input type="text" placeholder="Title" value={bannerForm.title} onChange={e=>setBannerForm({...bannerForm, title:e.target.value})} className="w-full border-2 border-gray-300 p-2 rounded-lg text-sm font-black text-black placeholder-gray-400 focus:outline-none focus:border-[#5C3A21]" />
                     <input type="text" placeholder="Image URL" value={bannerForm.image_url} onChange={e=>setBannerForm({...bannerForm, image_url:e.target.value})} className="w-full border-2 border-gray-300 p-2 rounded-lg text-sm font-black text-black placeholder-gray-400 focus:outline-none focus:border-[#5C3A21]" />
                     <button onClick={saveBanner} className="w-full bg-[#5C3A21] text-white py-3 rounded-lg font-black text-xs uppercase tracking-widest hover:bg-[#4A2E1A] transition">Add Banner</button>
                  </div>
               </div>
               <div className="bg-white p-4 rounded-2xl border shadow-sm max-w-md">
                  {banners.map(b=>(<div key={b.id} className="flex justify-between border-b border-gray-200 py-2 text-sm font-black text-black"><span>{b.title}</span><button onClick={()=>deleteRow("banners", b.id)} className="text-red-500 hover:text-red-700 transition">Del</button></div>))}
               </div>
            </div>
         )}

         {activeTab === 'orders' && (
            <div className="bg-white p-6 rounded-2xl border shadow-sm">
               <h3 className="font-black text-black mb-4 uppercase">Recent Orders</h3>
               {orders.length === 0 ? <p className="text-gray-500 font-bold">No orders yet.</p> : orders.map(o=>(
                  <div key={o.id} className="border-b border-gray-200 py-3 flex justify-between items-center text-sm">
                     <div><p className="font-black text-black">{o.order_id}</p><p className="text-gray-700 font-bold">{o.customer_name} • ₹{o.total_amount}</p></div>
                     <span className="bg-[#F4EFE6] text-[#5C3A21] px-2 py-1 rounded font-black uppercase text-xs">{o.status}</span>
                  </div>
               ))}
            </div>
         )}

      </main>
{toastMsg && <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-full font-black text-sm shadow-lg z-[999]">{toastMsg}</div>}
    </div>
  );
}
