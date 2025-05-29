// src/App.jsx
import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Breadcrumb from "./components/common/Breadcrumb";
import Sidebar from "./components/sidebar/Sidebar";
import Footer from "./components/topNavbar/Footer";
import TopNavbar from "./components/topNavbar/TopNavbar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./i18n/i18n.js";
import { SelectedMenuProvider } from "./context/SelectedMenuContext";

export default function App() {
  const [showSidebar, setShowSidebar] = useState(false);
  const { pathname } = useLocation();

  const moduleName = pathname?.split("/")[1]?.replace(/-/g, " ");
  const routeName = pathname?.split("/")[2]?.replace(/-/g, " ");
  const nestedRouteName = pathname?.split("/")[3]?.replace(/-/g, " ");

  useEffect(() => {
    window.scrollTo(0, 0);
    setShowSidebar(false);
  }, [pathname]);

  return (
    <SelectedMenuProvider>
      <div className="font-roboto text-base font-normal text-gray-600 dark:text-gray-400 dark:bg-gray-800 relative">
        <Sidebar showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
        <div
          className={`relative text-textBlack flex flex-col justify-between min-h-screen transition-all duration-500 ease-in-out p-3 ml-0 xl:ml-72 ${
            showSidebar && "max-xl:opacity-65"
          }`}
        >
          {/* Background Image Layer */}
          <div
            className="fixed inset-0 bg-cover bg-center z-0"
            style={{
              backgroundImage: `url("https://shaha.ancorathemes.com/wp-content/uploads/2017/06/bg-16.jpg?id=371")`,
            }}
          ></div>
          {/* <div className="absolute inset-0 bg-black opacity-50 z-0"></div> */}

          {/* Content Layer */}
          <div className="relative z-10 w-full">
            <TopNavbar setShowSidebar={setShowSidebar} />
            {pathname.length > 1 && (
              <Breadcrumb
                module={moduleName}
                route={routeName}
                nestedRoute={nestedRouteName}
              />
            )}
            <Outlet />
          </div>

          {/* Footer */}
          <Footer />
        </div>

        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </div>
    </SelectedMenuProvider>
  );
}
