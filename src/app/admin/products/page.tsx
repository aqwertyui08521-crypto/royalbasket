"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient("https://npzfzlkvdxweiaewnnem.supabase.co", "sb_publishable_it_SC_2dJQ8K4n7K4DqYjw_AaVk59xz");

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<any>({ 
    id: null, name: "", description: "", price: "", sale_price: "", category: "", weight: "", 
    rating: "4.5", reviews_count: "10", image_url: "", gallery: [] 
  });

  useEffect(() => { fetchProducts(); fetchBanners(); }, []);

  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("*").order("id", { ascending: false });
    if (data) setProducts(data);
  };

  const fetchBanners = async () => {
    const { data } = await supabase.from("banners").select("*").order("id", { ascending: false });
    if (data) setBanners(data);
  };

  // একসাথে একাধিক ব্যানার আপলোডের ফাংশন
  const handleBannerUpload = async (e: any) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setLoading(true);
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const { data } = await supabase.storage.from('images').upload(`banners/${Date.now()}-${i}.jpg`, file);
        if (data) {
            const { data: urlData } = supabase.storage.from('images').getPublicUrl(data.path);
            await supabase.from("banners").insert([{ image_url: urlData.publicUrl }]);
        }
    }
    setLoading(false);
    fetchBanners();
  };

  // ব্যানার ডিলিট করার ফাংশন
  const deleteBanner = async (id: number) => {
    if(confirm("Delete this banner?")) {
        await supabase.from("banners").delete().eq("id", id);
        fetchBanners();
    }
  };

  // প্রোডাক্টের একাধিক ছবি (গ্যালারি) আপলোডের ফাংশন
  const handleProductPhotos = async (e: any) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setLoading(true);
    let newGallery = [...(form.gallery || [])];
    let mainImage = form.image_url;

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const { data } = await supabase.storage.from('images').upload(`products/${Date.now()}-${i}.jpg`, file);
        if (data) {
            const { data: urlData } = supabase.storage.from('images').getPublicUrl(data.path);
            newGallery.push(urlData.publicUrl);
            if (!mainImage) mainImage = urlData.publicUrl; // প্রথম ছবিটাকে মেইন ইমেজ হিসেবে সেট করা
        }
    }
    setForm({ ...form, gallery: newGallery, image_url: mainImage });
    setLoading(false);
  };

  // গ্যালারি থেকে ছবি ডিলিট করা
  const removeGalleryImage = (index: number) => {
    const newGallery = [...form.gallery];
    newGallery.splice(index, 1);
    setForm({ ...form, gallery: newGallery, image_url: newGallery.length > 0 ? newGallery[0] : "" });
  };

  const handleSave = async () => {
    setLoading(true);
    const data = { ...form, price: Number(form.price), sale_price: Number(form.sale_price), rating: Number(form.rating), reviews_count: Number(form.reviews_count) };
    if (form.id) await supabase.from("products").update(data).eq("id", form.id);
    else await supabase.from("products").insert([data]);
    setIsModalOpen(false);
    setLoading(false);
    fetchProducts();
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-black">
      {/* ব্যানার সেকশন */}
      <div className="bg-white p-4 rounded-xl mb-6 shadow-sm">
        <h2 className="font-bold mb-2">Upload Banners (Select multiple)</h2>
        <input type="file" multiple accept="image/*" onChange={handleBannerUpload} disabled={loading} className="mb-4" />
        <div className="flex gap-4 overflow-x-auto">
            {banners.map(b => (
                <div key={b.id} className="relative min-w-[120px] h-[60px] rounded-lg overflow-hidden border">
                    <img src={b.image_url} className="w-full h-full object-cover" />
                    <button onClick={() => deleteBanner(b.id)} className="absolute top-0 right-0 bg-red-500 text-white w-5 h-5 flex items-center justify-center text-xs">✕</button>
                </div>
            ))}
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-xl">Products</h2>
        <button onClick={() => { setForm({id: null, name: "", description: "", price: "", sale_price: "", category: "", weight: "", rating: "4.5", reviews_count: "10", image_url: "", gallery: []}); setIsModalOpen(true); }} className="bg-black text-white px-4 py-2 rounded-xl text-sm font-bold">+ Add New</button>
      </div>
      
      <div className="grid gap-4">
        {products.map(p => (
          <div key={p.id} className="bg-white p-4 rounded-xl flex gap-4 items-center shadow-sm border border-gray-100">
            <img src={p.image_url || p.gallery?.[0]} className="w-16 h-16 object-cover rounded" />
            <div className="flex-1">
              <h3 className="font-bold text-sm">{p.name}</h3>
              <p className="text-xs text-gray-500">Price: ₹{p.sale_price}</p>
            </div>
            <button onClick={() => { setForm({ ...p, gallery: p.gallery || [] }); setIsModalOpen(true); }} className="text-blue-600 font-bold text-sm bg-blue-50 px-3 py-1 rounded">Edit</button>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 overflow-y-auto z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-lg my-10 shadow-xl">
            <h2 className="font-bold mb-4">{form.id ? "Edit Product" : "Add Product"}</h2>
            
            {/* প্রোডাক্ট গ্যালারি আপলোড */}
            <div className="mb-4">
                <label className="text-sm font-bold block mb-1">Product Images (Select multiple)</label>
                <input type="file" multiple accept="image/*" onChange={handleProductPhotos} disabled={loading} className="w-full border p-2 rounded text-sm" />
                {form.gallery && form.gallery.length > 0 && (
                    <div className="flex gap-2 mt-2 overflow-x-auto">
                        {form.gallery.map((img: string, idx: number) => (
                            <div key={idx} className="relative w-16 h-16 border rounded">
                                <img src={img} className="w-full h-full object-cover rounded" />
                                <button onClick={() => removeGalleryImage(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs">✕</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <input placeholder="Product Name" className="w-full border p-2 mb-2 rounded" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            <div className="grid grid-cols-2 gap-2">
              <input placeholder="Price (₹)" className="border p-2 mb-2 rounded" value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
              <input placeholder="Sale Price (₹)" className="border p-2 mb-2 rounded" value={form.sale_price} onChange={e => setForm({...form, sale_price: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-2">
                <input placeholder="Category" className="border p-2 mb-2 rounded" value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
                <input placeholder="Weight (e.g. 500g, 1kg)" className="border p-2 mb-2 rounded" value={form.weight} onChange={e => setForm({...form, weight: e.target.value})} />
            </div>
            <textarea placeholder="Description" className="w-full border p-2 mb-2 rounded" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            
            <button onClick={handleSave} disabled={loading} className="w-full bg-black text-white py-2 rounded-lg font-bold mt-4">{loading ? "Wait..." : "Save Product"}</button>
            <button onClick={() => setIsModalOpen(false)} className="w-full mt-2 text-gray-500 font-bold">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
