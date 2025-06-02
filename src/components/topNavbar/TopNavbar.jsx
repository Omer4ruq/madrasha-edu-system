import { FaBars } from "react-icons/fa6";
import LangSwitcher from "./LangSwitcher";
import Mail from "./Mail";
import Notifications from "./Notifications";
import Profile from "./Profile";
import SchoolName from "./SchoolName";
import { useState, useEffect } from "react";
import "./topNavbar.css";

export default function TopNavbar({ setShowSidebar }) {
  const [isFloating, setIsFloating] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsFloating(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="sticky top-0 z-50 w-full">
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
          .navbar-bg {
            background: rgba(0, 0, 0, 0.05);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.15);
            transition: all 0.3s ease;
          }
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

      {/* Top Navbar Container */}
      <div className={`w-full p-3 sm:p-3 shadow-xl rounded-xl transition-all duration-300 ${isFloating ? "navbar-bg" : "bg-black/10 backdrop-blur-sm border border-white/20"} flex items-center justify-between`}>
        {/* Left section */}
        <div className="flex gap-3 sm:gap-4 items-center">
          <button
            className="w-8 h-8 p-1.5 rounded border border-white/30 bg-[#DB9E30] text-white hover:bg-blue-600/20 btn-glow xl:hidden transition-all duration-300 ease-in-out"
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

        {/* Right section */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="animate-scaleIn" style={{ animationDelay: "0.1s" }}>
            {/* <LangSwitcher /> */}
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
