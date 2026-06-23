"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, LayoutDashboard, Package, ListOrdered, ImageIcon, Settings, Tags, Plus, Trash2, CheckCircle2, Eye, EyeOff, FolderHeart } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient("https://npzfzlkvdxweiaewnnem.supabase.co", "sb_publishable_it_SC_2dJQ8K4n7K4DqYjw_AaVk59xz");

export default function AdvancedAdminHub() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState("products");
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Lists Data from Database
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);

  // Advanced Product Form State
  const [prodForm, setProdForm] = useState({
    name: "", sku: "", price: "", old_price: "", weight: "1 Kg", category: "Dry Fruits",
    short_description: "", full_description: "", stock_quantity: "50",
    sale_badge: "NEW", is_featured: false, is_bestseller: false, is_new_arrival: true, is_visible: true,
    main_image: "", gallery_urls: ""
  });

  // Category & Banner States
  const [catName, setCatName] = useState("");
  const [catImage, setCatImage] = useState("");
  const [bannerForm, setBannerForm] = useState({ title: "", subtitle: "", image_url: "", cta_text: "Shop Now", cta_link: "/products", is_active: true });

  useEffect(() => {
    const authToken = sessionStorage.getItem("admin_auth_token");
    if (authToken === "true") {
      setIsAuthenticated(true);
      fetchCoreData();
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "7811743286") {
      sessionStorage.setItem("admin_auth_token", "true");
      setIsAuthenticated(true);
      fetchCoreData();
    } else {
      setLoginError("Incorrect Password! Access Denied.");
      setPassword("");
    }
  };

  const fetchCoreData = async () => {
    const { data: prods } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (prods) setProducts(prods);
    
    const { data: cats } = await supabase.from("categories").select("*");
    if (cats) setCategories(cats);

    const { data: bans } = await supabase.from("banners").select("*").order("created_at", { ascending: false });
    if (bans) setBanners(bans);
  };

  const triggerNotification = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Product Actions
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodForm.name || !prodForm.price) return alert("Product Name and Price details are mandatory!");
    
    const galleryArray = prodForm.gallery_urls.split(",").map(url => url.trim()).filter(url => url !== "");

    const payload = {
      name: prodForm.name,
      sku: prodForm.sku || "SKU-" + Math.floor(1000 + Math.random() * 9000),
      price: parseFloat(prodForm.price),
      old_price: prodForm.old_price ? parseFloat(prodForm.old_price) : null,
      weight: prodForm.weight,
      category: prodForm.category,
      short_description: prodForm.short_description,
      full_description: prodForm.full_description,
      stock_quantity: parseInt(prodForm.stock_quantity) || 0,
      sale_badge: prodForm.sale_badge,
      is_featured: prodForm.is_featured,
      is_bestseller: prodForm.is_bestseller,
      is_new_arrival: prodForm.is_new_arrival,
      is_visible: prodForm.is_visible,
      image_gallery: galleryArray
    };

    await supabase.from("products").insert([payload]);
    triggerNotification("Advanced Product Created in Database!");
    fetchCoreData();
    // Reset Form
    setProdForm({
      name: "", sku: "", price: "", old_price: "", weight: "1 Kg", category: "Dry Fruits",
      short_description: "", full_description: "", stock_quantity: "50",
      sale_badge: "NEW", is_featured: false, is_bestseller: false, is_new_arrival: true, is_visible: true,
      main_image: "", gallery_urls: ""
    });
  };

  // Category Actions
  const handleAddCategory = async () => {
    if(!catName) return;
    await supabase.from("categories").insert([{ name: catName, image_url: catImage }]);
    setCatName(""); setCatImage("");
    triggerNotification("Category Saved Globally!");
    fetchCoreData();
  };

  // Banner Actions
  const handleAddBanner = async () => {
    if(!bannerForm.title || !bannerForm.image_url) return;
    await supabase.from("banners").insert([bannerForm]);
    setBannerForm({ title: "", subtitle: "", image_url: "", cta_text: "Shop Now", cta_link: "/products", is_active: true });
    triggerNotification("Horizontal Slide Banner Activated!");
    fetchCoreData();
  };

  const deleteRow = async (table: string, id: string) => {
    if(confirm("Are you absolutely sure you want to delete this row permanently from Cloud DB?")) {
      await supabase.from(table).delete().eq("id", id);
      fetchCoreData();
      triggerNotification("Deleted Successfully!");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center items-center p-4 font-sans">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 w-full max-w-sm text-center">
          <div className="h-16 w-16 bg-[#F4EFE6] rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-[#5C3A21]" />
          </div>
          <h1 className="text-xl font-black text-gray-900 mb-1">Ecom Security Check</h1>
          <p className="text-xs text-gray-400 font-bold mb-6">Enter Secure Pin Code to View Live Panels</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50 border-2 p-4 rounded-xl text-center font-black tracking-widest text-lg focus:outline-none focus:border-[#5C3A21]"
            />
            {loginError && <p className="text-xs font-bold text-red-500">{loginError}</p>}
            <button type="submit" className="w-full bg-[#5C3A21] text-white font-extrabold py-3.5 rounded-xl shadow-md active:scale-95 transition">Unlock Master Control</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      {/* Dynamic Nav Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r flex flex-col sticky top-0 z-50">
         <div className="p-4 bg-[#5C3A21] text-white flex items-center gap-2">
            <StoreLayout className="h-5 w-5"/> <h2 className="font-black text-sm tracking-wide uppercase">Royal Core v2</h2>
         </div>
         <div className="flex overflow-x-auto md:flex-col p-2 gap-1 hide-scrollbar">
            <button onClick={() => setActiveTab('products')} className={`flex items-center gap-3 p-3 rounded-xl font-bold text-xs uppercase ${activeTab === 'products' ? 'bg-[#F4EFE6] text-[#5C3A21]' : 'text-gray-600 hover:bg-gray-50'}`}><Package className="h-4 w-4"/> Products Setup</button>
            <button onClick={() => setActiveTab('categories')} className={`flex items-center gap-3 p-3 rounded-xl font-bold text-xs uppercase ${activeTab === 'categories' ? 'bg-[#F4EFE6] text-[#5C3A21]' : 'text-gray-600 hover:bg-gray-50'}`}><FolderHeart className="h-4 w-4"/> Category Control</button>
            <button onClick={() => setActiveTab('banners')} className={`flex items-center gap-3 p-3 rounded-xl font-bold text-xs uppercase ${activeTab === 'banners' ? 'bg-[#F4EFE6] text-[#5C3A21]' : 'text-gray-600 hover:bg-gray-50'}`}><ImageIcon className="h-4 w-4"/> Sliding Banners</button>
         </div>
      </aside>

      {/* Main Form Fields Container */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
         
         {/* MODULE 1.1: PRODUCTS FIELDS */}
         {activeTab === 'products' && (
            <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
               <div className="bg-white p-6 rounded-2xl border shadow-sm">
                  <h3 className="text-base font-black text-gray-900 mb-4 uppercase tracking-wider border-b pb-2">Add Production-Ready Product</h3>
                  <form onSubmit={handleSaveProduct} className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="text-xs font-bold text-gray-600 block mb-1">Product Name</label><input type="text" value={prodForm.name} onChange={e=>setProdForm({...prodForm, name:e.target.value})} placeholder="Premium Almonds" className="w-full border p-3 rounded-xl text-xs" /></div>
                        <div><label className="text-xs font-bold text-gray-600 block mb-1">SKU Barcode Code</label><input type="text" value={prodForm.sku} onChange={e=>setProdForm({...prodForm, sku:e.target.value})} placeholder="DRY-ALM-1KG" className="w-full border p-3 rounded-xl text-xs" /></div>
                     </div>

                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div><label className="text-xs font-bold text-gray-600 block mb-1">Sale Price (₹)</label><input type="number" value={prodForm.price} onChange={e=>setProdForm({...prodForm, price:e.target.value})} placeholder="849" className="w-full border p-3 rounded-xl text-xs" /></div>
                        <div><label className="text-xs font-bold text-gray-600 block mb-1">Old Strike Price (₹)</label><input type="number" value={prodForm.old_price} onChange={e=>setProdForm({...prodForm, old_price:e.target.value})} placeholder="1200" className="w-full border p-3 rounded-xl text-xs" /></div>
                        <div><label className="text-xs font-bold text-gray-600 block mb-1">Weight Variant</label><input type="text" value={prodForm.weight} onChange={e=>setProdForm({...prodForm, weight:e.target.value})} placeholder="500g, 1 Kg, 4Kg" className="w-full border p-3 rounded-xl text-xs" /></div>
                        <div><label className="text-xs font-bold text-gray-600 block mb-1">Stock Quantity</label><input type="number" value={prodForm.stock_quantity} onChange={e=>setProdForm({...prodForm, stock_quantity:e.target.value})} className="w-full border p-3 rounded-xl text-xs" /></div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="text-xs font-bold text-gray-600 block mb-1">Assign Category</label>
                           <select value={prodForm.category} onChange={e=>setProdForm({...prodForm, category:e.target.value})} className="w-full border p-3 rounded-xl text-xs bg-white font-bold">
                              {categories.length === 0 ? <option>Dry Fruits</option> : categories.map(c=><option key={c.id} value={c.name}>{c.name}</option>)}
                           </select>
                        </div>
                        <div><label className="text-xs font-bold text-gray-600 block mb-1">Sale Badge Tag Text</label><input type="text" value={prodForm.sale_badge} onChange={e=>setProdForm({...prodForm, sale_badge:e.target.value})} placeholder="SALE, NEW, 20% OFF" className="w-full border p-3 rounded-xl text-xs" /></div>
                     </div>

                     <div><label className="text-xs font-bold text-gray-600 block mb-1">Short Punchy Highlights</label><input type="text" value={prodForm.short_description} onChange={e=>setProdForm({...prodForm, short_description:e.target.value})} placeholder="High quality organic crisp walnuts raw..." className="w-full border p-3 rounded-xl text-xs" /></div>
                     <div><label className="text-xs font-bold text-gray-600 block mb-1">Full Long Description Text</label><textarea value={prodForm.full_description} onChange={e=>setProdForm({...prodForm, full_description:e.target.value})} rows={3} placeholder="Write nutritional values, specifications, and complete product source story details..." className="w-full border p-3 rounded-xl text-xs" /></div>
                     
                     <div><label className="text-xs font-bold text-gray-600 block mb-1">Product Images Gallery Links (Comma Separated Urls)</label><input type="text" value={prodForm.gallery_urls} onChange={e=>setProdForm({...prodForm, gallery_urls:e.target.value})} placeholder="https://link1.png, https://link2.png" className="w-full border p-3 rounded-xl text-xs" /></div>

                     {/* Custom Control Toggles */}
                     <div className="bg-gray-50 p-4 rounded-xl grid grid-cols-2 md:grid-cols-4 gap-4 border">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold"><input type="checkbox" checked={prodForm.is_featured} onChange={e=>setProdForm({...prodForm, is_featured:e.target.checked})} /> Featured</label>
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold"><input type="checkbox" checked={prodForm.is_bestseller} onChange={e=>setProdForm({...prodForm, is_bestseller:e.target.checked})} /> Best Seller</label>
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold"><input type="checkbox" checked={prodForm.is_new_arrival} onChange={e=>setProdForm({...prodForm, is_new_arrival:e.target.checked})} /> New Arrival</label>
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold"><input type="checkbox" checked={prodForm.is_visible} onChange={e=>setProdForm({...prodForm, is_visible:e.checked})} /> Live Visible</label>
                     </div>

                     <button type="submit" className="w-full bg-[#5C3A21] text-white font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-widest shadow-md">Upload and Sync Globally</button>
                  </form>
               </div>

               {/* Live List Preview */}
               <div className="bg-white p-6 rounded-2xl border shadow-sm">
                  <h3 className="text-sm font-black text-gray-900 mb-4 uppercase">Database Sync Products List ({products.length})</h3>
                  <div className="space-y-2">
                     {products.map(p=>(
                        <div key={p.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border text-xs font-bold">
                           <div>
                              <p className="text-gray-900">{p.name} <span className="text-gray-400 font-normal">({p.sku})</span></p>
                              <p className="text-[10px] text-gray-500 mt-0.5">Price: ₹{p.price} • Stock: {p.stock_quantity} • Cat: {p.category}</p>
                           </div>
                           <button onClick={()=>deleteRow("products", p.id)} className="bg-red-50 p-2 rounded-lg border border-red-200 text-red-500"><Trash2 className="h-4 w-4"/></button>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         )}

         {/* MODULE 1.2: CATEGORY SECTIONS */}
         {activeTab === 'categories' && (
            <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
               <div className="bg-white p-6 rounded-2xl border shadow-sm max-w-md">
                  <h3 className="text-sm font-black text-gray-900 uppercase mb-4 tracking-wider">Create Custom Category</h3>
                  <div className="space-y-3">
                     <div><label className="text-xs font-bold text-gray-600 block mb-1">Category Name</label><input type="text" value={catName} onChange={e=>setCatName(e.target.value)} placeholder="e.g. Clothing, Walnuts, Cashews" className="w-full border p-3 rounded-xl text-xs" /></div>
                     <div><label className="text-xs font-bold text-gray-600 block mb-1">Category Icon / Image Link</label><input type="text" value={catImage} onChange={e=>setCatImage(e.target.value)} placeholder="Paste cloud URL link or emoji" className="w-full border p-3 rounded-xl text-xs" /></div>
                     <button onClick={handleAddCategory} className="w-full bg-[#5C3A21] text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wide">Save Category</button>
                  </div>
               </div>

               <div className="bg-white p-6 rounded-2xl border shadow-sm max-w-md">
                  <h3 className="text-sm font-black text-gray-900 uppercase mb-3">Active Categories ({categories.length})</h3>
                  <div className="space-y-2">
                     {categories.map(c=>(
                        <div key={c.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border text-xs font-bold">
                           <span className="text-gray-800">{c.name}</span>
                           <button onClick={()=>deleteRow("categories", c.id)} className="text-red-500 p-1"><Trash2 className="h-4 w-4"/></button>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         )}

         {/* MODULE 1.3: AUTOMATIC BANNERS SLIDES */}
         {activeTab === 'banners' && (
            <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
               <div className="bg-white p-6 rounded-2xl border shadow-sm max-w-xl">
                  <h3 className="text-sm font-black text-gray-900 uppercase mb-4 tracking-wider">Add 2-Second Looping Slider Banner</h3>
                  <div className="space-y-3">
                     <div className="grid grid-cols-2 gap-3">
                        <div><label className="text-xs font-bold text-gray-600 block mb-1">Banner Title</label><input type="text" value={bannerForm.title} onChange={e=>setBannerForm({...bannerForm, title:e.target.value})} placeholder="Mega Diwali Blast" className="w-full border p-3 rounded-xl text-xs" /></div>
                        <div><label className="text-xs font-bold text-gray-600 block mb-1">Sub Title Description</label><input type="text" value={bannerForm.subtitle} onChange={e=>setBannerForm({...bannerForm, subtitle:e.target.value})} placeholder="Get upto 40% OFF today only" className="w-full border p-3 rounded-xl text-xs" /></div>
                     </div>
                     <div><label className="text-xs font-bold text-gray-600 block mb-1">Banner Image Asset URL</label><input type="text" value={bannerForm.image_url} onChange={e=>setBannerForm({...bannerForm, image_url:e.target.value})} placeholder="Paste hosted image asset URL" className="w-full border p-3 rounded-xl text-xs" /></div>
                     
                     <div className="grid grid-cols-2 gap-3">
                        <div><label className="text-xs font-bold text-gray-600 block mb-1">CTA Button Text</label><input type="text" value={bannerForm.cta_text} onChange={e=>setBannerForm({...bannerForm, cta_text:e.target.value})} placeholder="Shop Now" className="w-full border p-3 rounded-xl text-xs" /></div>
                        <div><label className="text-xs font-bold text-gray-600 block mb-1">CTA Redirect Link</label><input type="text" value={bannerForm.cta_link} onChange={e=>setBannerForm({...bannerForm, cta_link:e.target.value})} placeholder="/products?category=Almonds" className="w-full border p-3 rounded-xl text-xs" /></div>
                     </div>

<button onClick={handleAddBanner} className="w-full bg-[#5C3A21] text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wide">Inject Banner to Live Loop</button>
                  </div>
               </div>

               <div className="bg-white p-6 rounded-2xl border shadow-sm max-w-xl">
                  <h3 className="text-sm font-black text-gray-900 uppercase mb-3">Live Slider Banners List ({banners.length})</h3>
                  <div className="space-y-2">
                     {banners.map(b=>(
                        <div key={b.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border text-xs font-bold">
                           <div>
                              <p className="text-gray-900">{b.title}</p>
                              <p className="text-[10px] text-gray-400 font-medium">Link: {b.cta_link}</p>
                           </div>
                           <button onClick={()=>deleteRow("banners", b.id)} className="text-red-500 p-1"><Trash2 className="h-4 w-4"/></button>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         )}

      </main>

      {/* Toast Pop Alert */}
      {showToast && (
         <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-full shadow-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 z-[999]">
            <CheckCircle2 className="h-4 w-4" /> {toastMsg}
         </div>
      )}
    </div>
  );
}

function StoreLayout(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  );
}EOF
