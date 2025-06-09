// // src/App.jsx
// import { useEffect, useState } from "react";
// import { Outlet, useLocation } from "react-router-dom";
// import Breadcrumb from "./components/common/Breadcrumb";
// import Sidebar from "./components/sidebar/Sidebar";
// import Footer from "./components/topNavbar/Footer";
// import TopNavbar from "./components/topNavbar/TopNavbar";
// import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import "./i18n/i18n.js";
// import { SelectedMenuProvider } from "./context/SelectedMenuContext";
// import { Toaster } from "react-hot-toast";

// export default function App() {
//   const [showSidebar, setShowSidebar] = useState(false);
//   const { pathname } = useLocation();
  

//   const segments = pathname?.split("/") || [];
//   console.log('pathname',pathname)
//   const moduleName = segments[1]?.replace(/-/g, " ") || "";
//   const routeName = segments[2]?.replace(/-/g, " ") || "";
//   const nestedRouteName = segments[3]?.replace(/-/g, " ") || "";

//   useEffect(() => {
//     window.scrollTo(0, 0);
//     setShowSidebar(false);
//   }, [pathname]);

//   return (
//     <SelectedMenuProvider>
//       <div className="font-roboto text-base font-normal text-gray-600 dark:text-gray-400 dark:bg-gray-800 relative">
//         <Sidebar showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
//         <div
//           className={`relative text-textBlack flex flex-col justify-between min-h-screen transition-all duration-500 ease-in-out p-3 ml-0 xl:ml-72 ${
//             showSidebar && "max-xl:opacity-65"
//           }`}
//         >
//           {/* Background Image Layer */}
//           <div
//             className="fixed inset-0 bg-cover bg-center z-0"
//             style={{
//               backgroundImage: `url("https://shaha.ancorathemes.com/wp-content/uploads/2017/06/bg-16.jpg?id=371")`,
//             }}
//           ></div>
//           {/* <div className="absolute inset-0 bg-black opacity-50 z-0"></div> */}

//           {/* Content Layer */}
//           <div className="relative z-10 w-full">
//             <TopNavbar setShowSidebar={setShowSidebar} />
//             {pathname.length > 1 && (
//               <Breadcrumb
//               segments={segments}
//                 module={moduleName}
//                 route={routeName}
//                 nestedRoute={nestedRouteName}
//               />
//             )}
//             <Outlet />
//           </div>

//           {/* Footer */}
//           <Footer />
//         </div>

//         <Toaster
//           position="top-right"
//           reverseOrder={false}
//           // theme="colored"
//         />
//       </div>
//     </SelectedMenuProvider>
//   );
// }





// src/App.jsx (partial update)
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
import { Toaster } from "react-hot-toast";
import bgImg from '../public/images/bg.png'
// ... other imports

export default function App() {
  const [showSidebar, setShowSidebar] = useState(false);
  const { pathname } = useLocation();

  // Compute module, route, and nestedRoute
  const pathSegments = pathname.split("/").filter(segment => segment);
  const moduleName = pathSegments[0]?.replace(/-/g, " ") || "";
  const routeName = pathSegments[1]?.replace(/-/g, " ") || "";
  const nestedRouteName = pathSegments[2]?.replace(/-/g, " ") || "";

  useEffect(() => {
    window.scrollTo(0, 0);
    setShowSidebar(false);
  }, [pathname]);

  return (
    <SelectedMenuProvider>
      <div className="font-roboto text-base font-normal text-gray-600 dark:text-gray-400 dark:bg-gray-800 relative">
        <Sidebar showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
        <div className={`relative text-textBlack flex flex-col justify-between min-h-screen transition-all duration-500 ease-in-out p-3 ml-0 xl:ml-72 ${showSidebar && "max-xl:opacity-65"}`}>
          <div className="fixed inset-0 bg-cover bg-center z-0" style={{

            //  backgroundImage: `url("https://shaha.ancorathemes.com/wp-content/uploads/2017/06/bg-16.jpg?id=371")` 
             backgroundImage: `url(${bgImg})` 
             
             }}></div>
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
          <Footer />
        </div>
        <Toaster position="top-right" reverseOrder={false} />
      </div>
    </SelectedMenuProvider>
  );
}