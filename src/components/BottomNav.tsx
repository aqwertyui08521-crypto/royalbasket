"use client";
import { usePathname, useRouter } from "next/navigation";
import { Home, Package, ShoppingCart, Headset } from "lucide-react";
import { useEffect, useState } from "react";

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      const savedCart = localStorage.getItem("royal_cart");
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        const count = Object.values(parsed).reduce((a: any, b: any) => a + b, 0) as number;
        setCartCount(count);
      } else {
        setCartCount(0);
      }
    };
    updateCount();
    window.addEventListener('storage', updateCount);
    const interval = setInterval(updateCount, 1000);
    return () => { window.removeEventListener('storage', updateCount); clearInterval(interval); };
  }, []);

  if (pathname.startsWith('/admin') || pathname.startsWith('/payment') || pathname.startsWith('/address')) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 z-[100] pb-1 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      <div onClick={() => router.push('/')} className={`flex flex-col items-center justify-center w-full h-full cursor-pointer transition-colors ${pathname === '/' ? 'text-[#5C3A21]' : 'text-gray-400 hover:text-gray-600'}`}>
        <Home className={`h-5 w-5 mb-1 ${pathname === '/' ? 'fill-[#5C3A21]/10' : ''}`} />
        <span className="text-[10px] font-bold">Home</span>
      </div>
      <div onClick={() => router.push('/products')} className={`flex flex-col items-center justify-center w-full h-full cursor-pointer transition-colors ${pathname === '/products' ? 'text-[#5C3A21]' : 'text-gray-400 hover:text-gray-600'}`}>
        <Package className={`h-5 w-5 mb-1 ${pathname === '/products' ? 'fill-[#5C3A21]/10' : ''}`} />
        <span className="text-[10px] font-bold">Products</span>
      </div>
      <div onClick={() => router.push('/cart')} className={`relative flex flex-col items-center justify-center w-full h-full cursor-pointer transition-colors ${pathname === '/cart' ? 'text-[#5C3A21]' : 'text-gray-400 hover:text-gray-600'}`}>
        <div className="relative">
          <ShoppingCart className={`h-5 w-5 mb-1 ${pathname === '/cart' ? 'fill-[#5C3A21]/10' : ''}`} />
          {cartCount > 0 && <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[8px] font-bold h-3.5 w-3.5 flex items-center justify-center rounded-full border border-white">{cartCount}</span>}
        </div>
        <span className="text-[10px] font-bold">Cart</span>
      </div>
      <div onClick={() => router.push('/support')} className={`flex flex-col items-center justify-center w-full h-full cursor-pointer transition-colors ${pathname === '/support' ? 'text-[#5C3A21]' : 'text-gray-400 hover:text-gray-600'}`}>
        <Headset className={`h-5 w-5 mb-1 ${pathname === '/support' ? 'fill-[#5C3A21]/10' : ''}`} />
        <span className="text-[10px] font-bold">Support</span>
      </div>
    </div>
  );
}
