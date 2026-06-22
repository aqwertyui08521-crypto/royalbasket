import { ShoppingCart, Menu, Search, Star, Info, Truck } from "lucide-react";

export default function Home() {
  const categories = [
    { name: "Dryfruit Combo", img: "🥜" },
    { name: "Almonds", img: "🌰" },
    { name: "Cashew Nuts", img: "🤍" },
    { name: "Walnuts", img: "🧠" },
  ];

  const products = [
    { id: 1, name: "Premium Dryfruits Combo 1Kg", price: 849, old_price: 1200, rating: 4.8, discount_tag: "29% OFF" },
    { id: 2, name: "Walnuts Without Shell Light", price: 275, old_price: 450, rating: 4.5, discount_tag: "38% OFF" },
    { id: 3, name: "Kashmiri Almonds (Badam)", price: 320, old_price: 500, rating: 4.9, discount_tag: "36% OFF" },
    { id: 4, name: "Organic Cashew Nuts Whole", price: 410, old_price: 600, rating: 4.7, discount_tag: "31% OFF" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 pb-20 font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Menu className="h-6 w-6 text-gray-700" />
          <h1 className="text-xl font-bold text-amber-800 tracking-tight">Royal Basket</h1>
        </div>
        <div className="relative bg-gray-100 p-2 rounded-full">
          <ShoppingCart className="h-5 w-5 text-gray-700" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold h-4 w-4 flex items-center justify-center rounded-full border border-white">2</span>
        </div>
      </header>

      {/* Search Bar */}
      <div className="bg-white px-4 py-3 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input type="text" placeholder="Search products..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-amber-600" />
        </div>
      </div>

      {/* Info Notice */}
      <div className="bg-amber-800 text-white text-xs py-2 px-4 flex items-center justify-center gap-2 font-medium">
        <Info className="h-4 w-4" /> REVIEW FINAL TOTAL BEFORE PAYMENT
      </div>

      <main className="px-4 py-4 space-y-6">
        {/* Banner Area */}
        <div className="w-full h-40 bg-gradient-to-r from-amber-700 to-amber-500 rounded-xl flex flex-col justify-center px-6 text-white shadow-md">
          <h2 className="text-2xl font-bold leading-tight">Mega Dryfruit<br/>Sale</h2>
          <p className="text-xs mt-2 opacity-90">FREE DELIVERY • PREMIUM QUALITY</p>
        </div>

        {/* Categories */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-amber-600">⚡</span>
            <h3 className="font-bold text-gray-800">Available Categories</h3>
          </div>
          <div className="flex justify-between overflow-x-auto pb-2 gap-4 hide-scrollbar">
            {categories.map((cat, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1 min-w-[70px]">
                <div className="h-16 w-16 bg-white rounded-full border-2 border-amber-100 shadow-sm flex items-center justify-center text-2xl">
                  {cat.img}
                </div>
                <span className="text-[10px] text-center font-medium text-gray-700 leading-tight">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 gap-3">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col">
              <div className="h-32 bg-gray-50 flex items-center justify-center relative">
                <span className="absolute top-2 left-2 bg-red-50 text-red-600 text-[9px] font-bold px-1.5 py-0.5 rounded">
                  {product.discount_tag}
                </span>
                <div className="h-20 w-20 bg-amber-100 rounded-full flex items-center justify-center text-3xl">🌰</div>
              </div>
              
              <div className="p-2.5 flex flex-col flex-1">
                <div className="flex items-center gap-1 mb-1 bg-amber-50 w-fit px-1 rounded">
                  <span className="text-[10px] font-bold text-amber-800">{product.rating}</span>
                  <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                </div>
                
                <h4 className="text-xs font-semibold text-gray-800 line-clamp-2 leading-tight flex-1">
                  {product.name}
                </h4>
                
                <div className="mt-2 flex items-end gap-1.5">
                  <span className="text-sm font-bold text-gray-900">₹{product.price}</span>
                  <span className="text-[10px] text-gray-400 line-through">₹{product.old_price}</span>
                </div>
                
                <div className="flex items-center gap-1 mt-1 text-[9px] text-green-700 font-medium">
                  <Truck className="h-3 w-3" /> Free Delivery
                </div>
                
                <button className="w-full mt-2 bg-white border border-amber-700 text-amber-800 font-bold py-1.5 rounded text-xs flex items-center justify-center gap-1 hover:bg-amber-50 transition">
                  ADD TO CART <span className="text-lg leading-none">+</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
