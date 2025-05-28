import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelectedMenu } from "../../context/SelectedMenuContext";
import { useEffect, useState, useRef } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

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
  }, [selectedMenuItem]);

  // Construct URLs for module path
  const modulePath = module ? `/${module.replace(/\s/g, "-").toLowerCase()}` : "/";

  // Get the deepest selected child for tabs (handles nested dropdowns)
  const getSelectedChildren = () => {
    if (!selectedMenuItem) return [];
    let currentItem = selectedMenuItem;
    if (currentItem.activeChild && currentItem.activeChild.children) {
      currentItem = currentItem.activeChild;
    }
    return currentItem.children || [];
  };

  // Handle breadcrumb path display
  const getBreadcrumbPaths = () => {
    if (!selectedMenuItem) {
      return { module: module || null, route: route || null, nestedRoute: nestedRoute || null };
    }

    let currentModule = module || selectedMenuItem.title;
    let currentRoute = null;
    let currentNestedRoute = null;

    if (selectedMenuItem.activeChild) {
      currentRoute = selectedMenuItem.title;
      if (selectedMenuItem.activeChild.activeChild) {
        currentNestedRoute = selectedMenuItem.activeChild.activeChild.title;
      } else {
        currentNestedRoute = selectedMenuItem.activeChild.title;
      }
    } else {
      currentRoute = selectedMenuItem.title;
    }

    return {
      module: currentModule,
      route: currentRoute,
      nestedRoute: currentNestedRoute,
    };
  };

  const { module: breadcrumbModule, route: breadcrumbRoute, nestedRoute: breadcrumbNestedRoute } = getBreadcrumbPaths();
  const tabs = getSelectedChildren();

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


  // bg-black/10 backdrop-blur-sm

  return (
    <div className="pl-2 md:pl-6 xl:pl-5 rounded-lg mt-6">
  <div className="flex flex-col md:flex-row items-start md:items-center justify-between w-full gap-4 px-4">
    
    {/* Breadcrumb Path */}
    {breadcrumbModule && (
      <h3 className="text-sm md:text-lg text-white capitalize flex-1 space-x-1 font-medium">
        <Link
          to={modulePath}
          className={`${
            breadcrumbRoute
              ? "text-[#441a05] font-semibold hover:text-[#DB9E30] transition-colors"
              : "text-[#DB9E30] font-bold"
          }`}
        >
          {t(breadcrumbModule)}
          {breadcrumbRoute && " / "}
        </Link>
        {breadcrumbRoute && (
          <span
            className={`${
              breadcrumbNestedRoute
                ? "text-[#441a05] font-semibold hover:text-[#DB9E30] transition-colors"
                : "text-[#DB9E30] font-bold"
            }`}
          >
            {t(breadcrumbRoute)}
            {breadcrumbNestedRoute && " / "}
          </span>
        )}
        {breadcrumbNestedRoute && (
          <span className="text-[#DB9E30] font-bold">{t(breadcrumbNestedRoute)}</span>
        )}
      </h3>
    )}

    {/* Tabs with Scroll Arrows */}
    {tabs.length > 0 && (
      <div className="relative w-full md:w-1/2 flex items-center justify-end">
        {/* Left Arrow */}
        {isOverflowing && (
          <button
            onClick={scrollLeft}
            className="absolute left-0 p-2 bg-white/80 text-[#441a05] rounded-full hover:bg-[#DB9E30] hover:text-white shadow-md transition-colors z-10"
          >
            <FaChevronLeft />
          </button>
        )}

        {/* Tabs Container */}
        <div
          ref={tabsContainerRef}
          className="flex overflow-x-auto whitespace-nowrap no-scrollbar mx-6 gap-2 py-1"
        >
          {tabs.map((child) => {
            const childPath = child.link || "#";
            const isActive = activeTab === childPath;

            return (
              <Link
                key={child.id}
                to={childPath}
                className={`px-4 py-2 rounded-full text-xs md:text-sm capitalize transition-all duration-300 flex-shrink-0 ${
                  isActive
                    ? "bg-[#DB9E30] text-white font-bold shadow-md"
                    : "bg-white text-[#441a05] font-bold hover:bg-[#DB9E30] hover:text-white"
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
            className="absolute right-0 p-2 bg-white/80 text-[#441a05] rounded-full hover:bg-[#DB9E30] hover:text-white shadow-md transition-colors z-10"
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