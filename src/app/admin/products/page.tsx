"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient("https://npzfzlkvdxweiaewnnem.supabase.co", "sb_publishable_it_SC_2dJQ8K4n7K4DqYjw_AaVk59xz");

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("*").order("id", { ascending: false });
    if (data) setProducts(data);
  };

  return (
    <div className="p-6 font-sans text-black">
      <h1 className="text-2xl font-black mb-6">Admin Panel</h1>
      
      {/* Banner Upload Section */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6">
        <h2 className="font-bold mb-2">Upload Banners</h2>
        <input type="file" onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
                // Ekhane banner logic thakbe
                alert("Banner uploading...");
            }
        }} />
      </div>

      {/* Product List */}
      <div className="grid gap-4">
        {products.map((p) => (
          <div key={p.id} className="p-4 border rounded-xl flex justify-between items-center">
            <span className="font-bold">{p.name}</span>
            <button 
              onClick={() => router.push(`/admin/products/edit/${p.id}`)} 
              className="bg-black text-white px-4 py-2 rounded-lg font-bold"
            >
              Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
