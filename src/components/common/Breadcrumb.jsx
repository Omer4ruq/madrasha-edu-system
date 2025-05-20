import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelectedMenu } from "../../context/SelectedMenuContext";
import { useEffect, useState, useRef } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { RxDividerVertical } from "react-icons/rx";

export default function Breadcrumb({ module, route, nestedRoute }) {
  const { selectedMenuItem } = useSelectedMenu();
  const { t } = useTranslation();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.pathname);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const tabsContainerRef = useRef(null);

  // Update active tab when location changes
  useEffect(() => {
    setActiveTab(location.pathname);
  }, [location.pathname]);

  // Check for overflow
  useEffect(() => {
    const checkOverflow = () => {
      if (tabsContainerRef.current) {
        const { scrollWidth, clientWidth } = tabsContainerRef.current;
        setIsOverflowing(scrollWidth > clientWidth);
      }
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [selectedMenuItem?.children]);

  // Construct URLs for module and route paths
  const modulePath = module ? `/${module?.replace(/\s/g, "-")}` : "/";

  // Handle breadcrumb path display
  const getBreadcrumbPaths = () => {
    if (!selectedMenuItem) return { module: null, route: null, nestedRoute: null };

    let currentModule = module;
    let currentRoute = null;
    let currentNestedRoute = null;

    if (selectedMenuItem.activeChild) {
      currentRoute = selectedMenuItem.title;
      if (selectedMenuItem.activeChild.activeChild) {
        currentNestedRoute = selectedMenuItem.activeChild.activeChild.title;
      } else {
        currentNestedRoute = selectedMenuItem.activeChild.title;
      }
    }

    return {
      module: currentModule,
      route: currentRoute || route,
      nestedRoute: currentNestedRoute || nestedRoute,
    };
  };

  const { module: breadcrumbModule, route: breadcrumbRoute, nestedRoute: breadcrumbNestedRoute } = getBreadcrumbPaths();

  // Scroll functions
  const scrollLeft = () => {
    if (tabsContainerRef.current) {
      tabsContainerRef.current.scrollBy({ left: -150, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (tabsContainerRef.current) {
      tabsContainerRef.current.scrollBy({ left: 150, behavior: "smooth" });
    }
  };

  return (
    <div className="pl-1 md:pl-4 xl:pl-2 my-5">
      <div className="flex-1 md:flex items-center justify-between">
        
        {/* Breadcrumb Path */}
        {breadcrumbModule && (
          <h3 className="text-xs md:text-lg text-white capitalize flex-1">
            <Link
              to={modulePath}
              className={`${
                breadcrumbRoute ? "text-white hover:text-primary" : "text-slate-50 font-bold"
              }`}
            >


              {breadcrumbModule} {breadcrumbRoute && "/ "}
            </Link>
            {breadcrumbRoute && (
              <span
                className={`${
                  breadcrumbNestedRoute ? "text-white hover:text-primary" : "text-slate-50 font-bold"
                }`}
              >
                {t(breadcrumbRoute)}
                {breadcrumbNestedRoute && " / "}
              </span>
            )}
            {breadcrumbNestedRoute && (
              <span className="text-primary font-bold">{t(breadcrumbNestedRoute)}</span>
            )}
          </h3>
        )}

        {/* Tabs with Scroll Arrows */}
        {selectedMenuItem?.children && selectedMenuItem.children.length > 0 && (
          <div className="w-full md:w-1/2 flex items-center relative mt-2 md:mt-0">
            {/* Left Arrow */}
            {isOverflowing && (
              <button
                onClick={scrollLeft}
                className="absolute left-0 p-2 bg-gray-200 text-gray-700 rounded-full hover:bg-primary hover:text-white transition-colors z-10"
              >
                <FaChevronLeft />
              </button>
            )}

            {/* Tabs Container */}
            <div
              ref={tabsContainerRef}
              className="flex overflow-x-auto whitespace-nowrap no-scrollbar mx-4 md:mx-10"
            >
              {selectedMenuItem.children.map((child) => {
                const childPath = child.link || "#";
                const isActive = activeTab === childPath;

                return (
                  <Link
                    key={child.id}
                    to={childPath}
                    className={`px-4 py-2 rounded-md text-xs md:text-sm capitalize transition-colors flex-shrink-0 mx-1 ${
                      isActive
                        ? "bg-primary text-white font-bold"
                        : "bg-gray-200 text-gray-700 hover:bg-primary hover:text-white"
                    }`}
                  >
                    {t(child.title)}
                  </Link>
                );
              })}
            </div>

            {/* Right Arrow */}
            {isOverflowing && (
              <button
                onClick={scrollRight}
                className="absolute right-0 p-2 bg-gray-200 text-gray-700 rounded-full hover:bg-primary hover:text-white transition-colors z-10"
              >
                <FaChevronRight />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}