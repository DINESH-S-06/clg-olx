import React from 'react';
import {
  MessageCircle,
  ShieldCheck,
  MapPin,
  Heart,
} from 'lucide-react';

export default function Footer({ onSelectCategory, onSelectLocation }) {
  return (
    <footer className="mt-16 bg-[#ebeeef] border-t border-slate-300 text-[#002f34]">
      
      {/* 1. Main 5-Column Navigation Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-xs">
          
          {/* Column 1 */}
          <div>
            <h4 className="font-black text-[#002f34] uppercase tracking-wider mb-3">
              Popular Categories
            </h4>
            <ul className="space-y-1.5 text-[#406367] font-medium">
              <li><button onClick={() => onSelectCategory('Books')} className="hover:text-[#002f34]">Books & Notes</button></li>
              <li><button onClick={() => onSelectCategory('Electronics')} className="hover:text-[#002f34]">Laptops & Calculators</button></li>
              <li><button onClick={() => onSelectCategory('Lab Equipment')} className="hover:text-[#002f34]">Lab Kits & Drafters</button></li>
              <li><button onClick={() => onSelectCategory('Furniture')} className="hover:text-[#002f34]">Hostel Furniture</button></li>
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <h4 className="font-black text-[#002f34] uppercase tracking-wider mb-3">
              Campus Locations
            </h4>
            <ul className="space-y-1.5 text-[#406367] font-medium">
              <li><button onClick={() => onSelectLocation('Hostel Block A (Boys)')} className="hover:text-[#002f34]">Hostel Block A (Boys)</button></li>
              <li><button onClick={() => onSelectLocation('Hostel Block B (Boys)')} className="hover:text-[#002f34]">Hostel Block B (Boys)</button></li>
              <li><button onClick={() => onSelectLocation('Hostel Block C (Girls)')} className="hover:text-[#002f34]">Hostel Block C (Girls)</button></li>
              <li><button onClick={() => onSelectLocation('Staff Quarters')} className="hover:text-[#002f34]">Staff Quarters</button></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h4 className="font-black text-[#002f34] uppercase tracking-wider mb-3">
              About Us
            </h4>
            <ul className="space-y-1.5 text-[#406367] font-medium">
              <li><a href="#" className="hover:text-[#002f34]">About Campus Connect</a></li>
              <li><a href="#" className="hover:text-[#002f34]">Safety Tips for Students</a></li>
              <li><a href="#" className="hover:text-[#002f34]">Hostel Handover Guide</a></li>
              <li><a href="#" className="hover:text-[#002f34]">Community Guidelines</a></li>
            </ul>
          </div>

          {/* Column 4 */}
          <div>
            <h4 className="font-black text-[#002f34] uppercase tracking-wider mb-3">
              Portals
            </h4>
            <ul className="space-y-1.5 text-[#406367] font-medium">
              <li><span className="text-[#002f34] font-bold">🎓 Student Login</span></li>
              <li><span className="text-[#002f34] font-bold">🏷️ Seller Center</span></li>
              <li><span className="text-[#002f34] font-bold">🏛️ Staff / Faculty</span></li>
              <li><span className="text-[#002f34] font-bold">⚡ Zero Commission</span></li>
            </ul>
          </div>

          {/* Column 5 */}
          <div>
            <h4 className="font-black text-[#002f34] uppercase tracking-wider mb-3">
              Connect With Us
            </h4>
            <div className="space-y-2 text-[#406367] font-medium">
              <p className="text-[11px] leading-relaxed">
                Connect directly with sellers across campus via verified WhatsApp chats.
              </p>
              <div className="pt-1 flex items-center gap-2 text-[#002f34] font-bold">
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp Enabled</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Dark Teal Bottom Copyright Strip */}
      <div className="bg-[#002f34] text-white py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-slate-300 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-black text-white tracking-wider">CAMPUS CONNECT</span>
            <span>•</span>
            <span>Free Classifieds in College Campus</span>
          </div>
          <div className="text-[11px] text-slate-400">
            © 2026 Campus Connect. Kongu Engineering College Edition.
          </div>
        </div>
      </div>
    </footer>
  );
}
