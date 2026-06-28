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
    rating: "4.5", reviews_count: "10", image_url: "" 
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

  const handleSave = async () => {
    setLoading(true);
    const data = { ...form, price: Number(form.price), sale_price: Number(form.sale_price), rating: Number(form.rating), reviews_count: Number(form.reviews_count) };
    if (form.id) await supabase.from("products").update(data).eq("id", form.id);
    else await supabase.from("products").insert([data]);
    window.location.reload();
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-black">
      <div className="bg-white p-4 rounded-xl mb-6 shadow-sm">
        <h2 className="font-bold mb-2">Upload Banners</h2>
        <input type="file" onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const { data } = await supabase.storage.from('images').upload(`banners/${Date.now()}.jpg`, file);
            if (data) {
                const { data: urlData } = supabase.storage.from('images').getPublicUrl(data.path);
                await supabase.from("banners").insert([{ image_url: urlData.publicUrl }]);
                window.location.reload();
            }
        }} />
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-xl">Products</h2>
        <button onClick={() => { setForm({id: null, name: "", description: "", price: "", sale_price: "", category: "", weight: "", rating: "4.5", reviews_count: "10", image_url: ""}); setIsModalOpen(true); }} className="bg-black text-white px-4 py-2 rounded-xl text-sm font-bold">+ Add New</button>
      </div>
      
      <div className="grid gap-4">
        {products.map(p => (
          <div key={p.id} className="bg-white p-4 rounded-xl flex gap-4 items-center shadow-sm">
            <img src={p.image_url} className="w-16 h-16 object-cover rounded" />
            <div className="flex-1">
              <h3 className="font-bold text-sm">{p.name}</h3>
              <p className="text-xs text-gray-500">Price: ₹{p.sale_price}</p>
            </div>
            <button onClick={() => { setForm(p); setIsModalOpen(true); }} className="text-blue-600 font-bold text-sm">Edit</button>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 overflow-y-auto z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-lg my-10 shadow-xl">
            <h2 className="font-bold mb-4">{form.id ? "Edit Product" : "Add Product"}</h2>
            <input placeholder="Product Name" className="w-full border p-2 mb-2 rounded" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            <input placeholder="Image URL" className="w-full border p-2 mb-2 rounded" value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} />
            <input placeholder="Price" className="w-full border p-2 mb-2 rounded" value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
            <input placeholder="Sale Price" className="w-full border p-2 mb-2 rounded" value={form.sale_price} onChange={e => setForm({...form, sale_price: e.target.value})} />
            <input placeholder="Category" className="w-full border p-2 mb-2 rounded" value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
            <input placeholder="Weight" className="w-full border p-2 mb-2 rounded" value={form.weight} onChange={e => setForm({...form, weight: e.target.value})} />
            <textarea placeholder="Description" className="w-full border p-2 mb-2 rounded" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            
            <button onClick={handleSave} className="w-full bg-black text-white py-2 rounded-lg font-bold mt-4">{loading ? "Saving..." : "Save Product"}</button>
            <button onClick={() => setIsModalOpen(false)} className="w-full mt-2 text-gray-500 font-bold">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
