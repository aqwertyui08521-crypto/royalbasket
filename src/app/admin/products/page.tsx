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

  // Form State
  const [form, setForm] = useState({
    id: null, name: "", description: "", price: "", sale_price: "", 
    category: "Premium Dry Fruits", weight: "1 Kg", 
    image_url: "", gallery: [] as string[], in_stock: true, is_active: true
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("*").order("id", { ascending: false });
    if (data) setProducts(data);
  };

  // Image Upload Logic (Supabase Storage)
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

        // Upload to a bucket named 'public' (change if you created a specific bucket)
        const { error: uploadError } = await supabase.storage.from('public').upload(filePath, file);
        
        if (uploadError) {
          console.error("Upload error:", uploadError);
          alert("Storage Bucket error: Ensure you have a public bucket created.");
          continue;
        }

        const { data } = supabase.storage.from('public').getPublicUrl(filePath);
        if (i === 0 && !mainImage) {
           mainImage = data.publicUrl; // First image becomes main thumbnail
        }
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
    const productData = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      sale_price: Number(form.sale_price),
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
  };

  const editProduct = (p: any) => {
    setForm({ ...p, gallery: p.gallery || [] });
    setIsModalOpen(true);
  };

  const deleteProduct = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      await supabase.from("products").delete().eq("id", id);
      fetchProducts();
    }
  };

  const filteredProducts = products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans text-gray-900">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Products List</h1>
            <p className="text-gray-500 font-medium mt-1">Manage your store inventory and catalog</p>
          </div>
          <button 
            onClick={() => {
              setForm({ id: null, name: "", description: "", price: "", sale_price: "", category: "Premium Combo", weight: "1 Kg", image_url: "", gallery: [], in_stock: true, is_active: true });
              setIsModalOpen(true);
            }} 
            className="bg-[#5C3A21] text-white px-6 py-3 rounded-xl font-bold shadow-lg active:scale-95 transition-transform flex items-center gap-2"
          >
            <span>+</span> Add New Product
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm mb-6 border border-gray-100 flex items-center gap-3">
          <span className="text-xl">🔍</span>
          <input 
            type="text" 
            placeholder="Search products by name..." 
            className="w-full bg-transparent outline-none font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((p) => (
            <div key={p.id} className={`bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex gap-4 relative transition-all ${!p.is_active ? 'opacity-60' : ''}`}>
              {!p.is_active && <span className="absolute top-2 right-2 bg-gray-200 text-gray-600 text-[10px] font-bold px-2 py-1 rounded">HIDDEN</span>}
              <img src={p.image_url || 'https://via.placeholder.com/100'} alt={p.name} className="w-24 h-24 rounded-2xl object-cover bg-gray-50" />
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 leading-tight">{p.name}</h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">{p.category} • {p.weight}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="font-black text-[#5C3A21]">₹{p.sale_price || p.price}</span>
                  {p.sale_price && <span className="text-xs text-gray-400 line-through">₹{p.price}</span>}
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

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl my-8">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white rounded-t-3xl z-10">
              <h2 className="text-xl font-black">{form.id ? "Edit Product" : "Add New Product"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 bg-gray-100 rounded-full font-bold text-gray-500 hover:bg-gray-200">✕</button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-6">
              {/* Image Upload Area */}
              <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center">
                <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" id="gallery-upload" />
                <label htmlFor="gallery-upload" className="cursor-pointer flex flex-col items-center">
                  <span className="text-3xl mb-2">📸</span>
                  <span className="font-bold text-gray-700">Upload Product Images</span>
                  <span className="text-xs text-gray-500 mt-1">Select up to 4-5 images (First image is thumbnail)</span>
                  {uploading && <span className="text-sm font-bold text-blue-600 mt-2">Uploading... Please wait</span>}
                </label>
                {form.gallery.length > 0 && (
                  <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                    {form.gallery.map((img, i) => (
                      <div key={i} className="relative min-w-[60px]">
                        <img src={img} className="w-16 h-16 object-cover rounded-xl border border-gray-200" />
                        {i === 0 && <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">MAIN</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Product Name</label>
                  <input required className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl font-medium outline-none focus:border-[#5C3A21]" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Category</label>
                  <select className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl font-medium outline-none" value={form.category} onChange={e=>setForm({...form, category: e.target.value})}>
                    <option>Premium Combo</option>
                    <option>Daily Use</option>
                    <option>Gift Box</option>
                    <option>Single Item</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Weight / Size</label>
                  <input required className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl font-medium outline-none" placeholder="e.g. 1 Kg" value={form.weight} onChange={e=>setForm({...form, weight: e.target.value})} />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">MRP (Old Price)</label>
                    <input required type="number" className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl font-medium outline-none" value={form.price} onChange={e=>setForm({...form, price: e.target.value})} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Sale Price</label>
                    <input required type="number" className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl font-medium outline-none" value={form.sale_price} onChange={e=>setForm({...form, sale_price: e.target.value})} />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Description</label>
                  <textarea rows={3} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl font-medium outline-none" value={form.description} onChange={e=>setForm({...form, description: e.target.value})} />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex gap-6 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.in_stock} onChange={e=>setForm({...form, in_stock: e.target.checked})} className="w-5 h-5 accent-[#5C3A21]" />
                  <span className="font-bold text-sm text-gray-700">In Stock</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.is_active} onChange={e=>setForm({...form, is_active: e.target.checked})} className="w-5 h-5 accent-[#5C3A21]" />
                  <span className="font-bold text-sm text-gray-700">Visible on Website</span>
                </label>
              </div>

              <div className="pt-4 border-t border-gray-100 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-bold">Cancel</button>
                <button type="submit" disabled={loading || uploading} className="flex-1 bg-[#5C3A21] text-white py-4 rounded-xl font-bold disabled:opacity-50">
                  {loading ? "Saving..." : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
