"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient("https://npzfzlkvdxweiaewnnem.supabase.co", "sb_publishable_it_SC_2dJQ8K4n7K4DqYjw_AaVk59xz");

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    id: null, name: "", description: "", price: "", sale_price: "", 
    category: "Premium Combo", weight: "1 Kg", 
    image_url: "", gallery: [] as string[], in_stock: true, is_active: true
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("*").order("id", { ascending: false });
    if (data) setProducts(data);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const files = e.target.files;
      if (!files || files.length === 0) return;

      const newGallery = [...form.gallery];
      let mainImage = form.image_url;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `product-images/${fileName}`;

        const { error: uploadError } = await supabase.storage.from('public').upload(filePath, file);
        
        if (uploadError) {
          console.error("Upload error:", uploadError);
          alert("Error: Please create a public bucket named 'public' in Supabase Storage.");
          setUploading(false);
          return;
        }

        const { data } = supabase.storage.from('public').getPublicUrl(filePath);
        if (i === 0 && !mainImage) mainImage = data.publicUrl;
        newGallery.push(data.publicUrl);
      }

      setForm({ ...form, image_url: mainImage, gallery: newGallery });
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // ডাটাবেসে গ্লোবালি সেভ করার জন্য ডেটা রেডি করা
    const productData = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      sale_price: Number(form.sale_price) > 0 ? Number(form.sale_price) : Number(form.price),
      category: form.category,
      weight: form.weight,
      image_url: form.image_url,
      gallery: form.gallery,
      in_stock: form.in_stock,
      is_active: form.is_active
    };

    if (form.id) {
      await supabase.from("products").update(productData).eq("id", form.id);
    } else {
      await supabase.from("products").insert([productData]);
    }
    
    setIsModalOpen(false);
    fetchProducts();
    setLoading(false);
    alert("Product saved globally in database!");
  };

  const editProduct = (p: any) => {
    setForm({ 
      id: p.id, name: p.name || "", description: p.description || "", 
      price: p.price || "", sale_price: p.sale_price || "", 
      category: p.category || "Premium Combo", weight: p.weight || "1 Kg", 
      image_url: p.image_url || "", gallery: p.gallery || [], 
      in_stock: p.in_stock ?? true, is_active: p.is_active ?? true 
    });
    setIsModalOpen(true);
  };

  const deleteProduct = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      await supabase.from("products").delete().eq("id", id);
      fetchProducts();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 font-sans text-gray-900 pb-20">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-black">Products List</h1>
          <button onClick={() => {
              setForm({ id: null, name: "", description: "", price: "", sale_price: "", category: "Premium Combo", weight: "1 Kg", image_url: "", gallery: [], in_stock: true, is_active: true });
              setIsModalOpen(true);
            }} 
            className="bg-[#5C3A21] text-white px-4 py-2 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-transform"
          >
            + Add Product
          </button>
        </div>

        <div className="bg-white p-3 rounded-xl shadow-sm mb-6 border border-gray-100 flex items-center gap-3">
          <span>🔍</span>
          <input type="text" placeholder="Search..." className="w-full bg-transparent outline-none font-medium" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase())).map((p) => (
            <div key={p.id} className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4 relative ${!p.is_active ? 'opacity-50' : ''}`}>
              {!p.is_active && <span className="absolute top-2 right-2 bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded">HIDDEN</span>}
              <img src={p.image_url || 'https://via.placeholder.com/100'} className="w-20 h-20 rounded-xl object-cover bg-gray-50" />
              <div className="flex-1">
                <h3 className="font-bold text-sm text-gray-800 leading-tight">{p.name}</h3>
                <p className="text-[10px] text-gray-500 font-bold mt-1">{p.weight} • {p.category}</p>
                <div className="mt-1">
                  <span className="font-black text-[#5C3A21] text-sm">₹{p.sale_price || p.price}</span>
                  {p.sale_price && p.sale_price < p.price && <span className="text-[10px] text-gray-400 line-through ml-2">₹{p.price}</span>}
                </div>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => editProduct(p)} className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold w-full">Edit</button>
                  <button onClick={() => deleteProduct(p.id)} className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold w-full">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center sm:p-4">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] md:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-black">{form.id ? "Edit Product" : "Add Product"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="bg-gray-100 w-8 h-8 rounded-full font-bold">✕</button>
            </div>
            
            {/* Scrollable Form Body - Fixes overlapping issue */}
            <div className="p-5 overflow-y-auto space-y-5">
              
              {/* Photo Upload Options */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">1. Upload from Gallery (Needs Supabase Bucket)</label>
                <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" id="gallery-upload" />
                <label htmlFor="gallery-upload" className="w-full bg-white border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer active:bg-gray-50">
                  <span className="text-2xl">📸</span>
                  <span className="font-bold text-sm text-[#5C3A21] mt-1">Select Multiple Photos</span>
                  {uploading && <span className="text-xs font-bold text-blue-600 mt-1">Uploading...</span>}
                </label>

                <div className="mt-4">
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">OR 2. Paste Image Link (Manual)</label>
                  <input type="text" placeholder="Paste image URL here..." className="w-full bg-white border border-gray-200 p-3 rounded-xl font-medium outline-none text-sm" value={form.image_url} onChange={e=>setForm({...form, image_url: e.target.value})} />
                </div>

                {/* Photo Preview */}
                {(form.image_url || form.gallery.length > 0) && (
                  <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                    {form.image_url && !form.gallery.includes(form.image_url) && (
                      <img src={form.image_url} className="w-14 h-14 object-cover rounded-lg border border-gray-300" />
                    )}
                    {form.gallery.map((img, i) => (
                      <img key={i} src={img} className="w-14 h-14 object-cover rounded-lg border border-gray-300" />
                    ))}
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Product Name</label>
                  <input required className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl font-medium outline-none text-sm" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">MRP (Old Price)</label>
                    <input required type="number" className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl font-medium outline-none text-sm" value={form.price} onChange={e=>setForm({...form, price: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Sale Price (New Price)</label>
                    <input required type="number" className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl font-medium outline-none text-sm" value={form.sale_price} onChange={e=>setForm({...form, sale_price: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Weight (e.g. 1Kg)</label>
                    <input required className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl font-medium outline-none text-sm" value={form.weight} onChange={e=>setForm({...form, weight: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Category</label>
                    <select className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl font-medium outline-none text-sm" value={form.category} onChange={e=>setForm({...form, category: e.target.value})}>
                      <option>Premium Combo</option>
                      <option>Daily Use</option>
                      <option>Gift Box</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Description</label>
                  <textarea rows={3} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl font-medium outline-none text-sm" value={form.description} onChange={e=>setForm({...form, description: e.target.value})} />
                </div>
              </div>

              {/* Checkboxes */}
              <div className="flex gap-4">
                <label className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl border border-gray-200 flex-1">
                  <input type="checkbox" checked={form.in_stock} onChange={e=>setForm({...form, in_stock: e.target.checked})} className="w-4 h-4 accent-[#5C3A21]" />
                  <span className="font-bold text-xs">In Stock</span>
                </label>
                <label className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl border border-gray-200 flex-1">
                  <input type="checkbox" checked={form.is_active} onChange={e=>setForm({...form, is_active: e.target.checked})} className="w-4 h-4 accent-[#5C3A21]" />
                  <span className="font-bold text-xs">Show Global</span>
                </label>
              </div>
            </div>

            {/* Sticky Footer Buttons */}
            <div className="p-4 border-t border-gray-100 flex gap-3 bg-white rounded-b-3xl">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-100 text-gray-700 py-3.5 rounded-xl font-bold">Cancel</button>
              <button onClick={handleSave} disabled={loading || uploading} className="flex-1 bg-[#5C3A21] text-white py-3.5 rounded-xl font-bold">
                {loading ? "Saving..." : "Save Globally"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
