import { FaBars } from "react-icons/fa6";
import LangSwitcher from "./LangSwitcher";
import Mail from "./Mail";
import Notifications from "./Notifications";
import Profile from "./Profile";
import SchoolName from "./SchoolName";
import { useState, useEffect } from "react";
import './topNavbar.css'
export default function TopNavbar({ setShowSidebar }) {
  const [isFloating, setIsFloating] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsFloating(true);
      } else {
        setIsFloating(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="sticky top-0 z-50">
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes scaleIn {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          .animate-fadeIn {
            animation: fadeIn 0.6s ease-out forwards;
          }
          .animate-scaleIn {
            animation: scaleIn 0.4s ease-out forwards;
          }
          .btn-glow:hover {
            box-shadow: 0 0 15px rgba(37, 99, 235, 0.4);
          }
          .floating-bars {
            background: rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(8px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            transform: scale(1.1);
            transition: all 0.3s ease;
          }

          /* Custom Scrollbar */
          ::-webkit-scrollbar {
            width: 8px;
          }
          ::-webkit-scrollbar-track {
            background: transparent;
          }
          ::-webkit-scrollbar-thumb {
            background: rgba(22, 31, 48, 0.26);
            border-radius: 10px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: rgba(10, 13, 21, 0.44);
          }
        `}
      </style>

      <div className="flex items-center justify-between bg-black/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 sm:p-3 shadow-xl animate-fadeIn">
        {/* School Name and Sidebar Toggle */}
        <div className="flex gap-3 sm:gap-4 items-center">
          <button
            className={`
              border border-white/30 rounded w-8 h-8 p-1.5 xl:hidden cursor-pointer
              transition-all duration-300 ease-in-out
              ${isFloating
                ? "fixed top-4 left-4 z-50 floating-bars text-white"
                : "text-white hover:bg-blue-600/20 btn-glow"
              }
            `}
            onClick={() => setShowSidebar((state) => !state)}
            aria-label="Toggle sidebar"
            title="Toggle sidebar"
          >
            <FaBars className="w-full h-full animate-scaleIn" />
          </button>
          <div className="animate-fadeIn">
            <SchoolName />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="animate-scaleIn" style={{ animationDelay: "0.1s" }}>
            <LangSwitcher />
          </div>
          <div className="animate-scaleIn" style={{ animationDelay: "0.2s" }}>
            <Mail />
          </div>
          <div className="animate-scaleIn" style={{ animationDelay: "0.3s" }}>
            <Notifications />
          </div>
          <div className="animate-scaleIn" style={{ animationDelay: "0.4s" }}>
            <Profile />
          </div>
        </div>
      </div>
    </div>
  );
}