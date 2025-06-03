import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { useSelectedMenu } from "../../context/SelectedMenuContext";

export default function Breadcrumb({ module, route, nestedRoute }) {
  const { selectedMenuItem, setSelectedMenuItem } = useSelectedMenu();
  const { t } = useTranslation();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.pathname);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const tabsContainerRef = useRef(null);

  // Update active tab when location changes
  useEffect(() => {
    setActiveTab(location.pathname);
  }, [location.pathname]);

  // Check for overflow (tabs)
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

  // Get the first-level children for top-right tabs
  const getFirstLevelChildren = () => {
    if (!selectedMenuItem || !selectedMenuItem.children) return [];
    return selectedMenuItem.children;
  };

  // Get the second-level children for content area tabs
  const getSecondLevelChildren = () => {
    if (
      !selectedMenuItem ||
      !selectedMenuItem.activeChild ||
      !selectedMenuItem.activeChild.children
    )
      return [];
    return selectedMenuItem.activeChild.children;
  };

  // Handle breadcrumb path display
  const getBreadcrumbPaths = () => {
    if (!selectedMenuItem) {
      return {
        module: module || null,
        route: route || null,
        modulePath: "/",
        routePath: null,
      };
    }

    let currentModule = selectedMenuItem.title;
    let currentRoute = null;
    let modulePath = `/${selectedMenuItem.link?.split("/")[1] || ""}`;
    let routePath = null;

    if (selectedMenuItem.activeChild) {
      currentRoute = selectedMenuItem.activeChild.title;
      routePath = selectedMenuItem.activeChild.link;
    } else {
      currentRoute = selectedMenuItem.title;
      routePath = selectedMenuItem.link;
    }

    return {
      module: currentModule,
      route: currentRoute,
      modulePath,
      routePath,
    };
  };

  const {
    module: breadcrumbModule,
    route: breadcrumbRoute,
    modulePath,
    routePath,
  } = getBreadcrumbPaths();
  const firstLevelTabs = getFirstLevelChildren();
  const secondLevelTabs = getSecondLevelChildren();

  // Scroll functions (top-right tabs)
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
    <div className="pl-2 md:pl-6 xl:pl-3 rounded-lg mt-6">
      <style>
        {`
          @keyframes scaleIn {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes underlineGrow {
            from { width: 0; }
            to { width: 100%; }
          }
          .animate-scaleIn {
            animation: scaleIn 0.4s ease-in-out forwards;
          }
          .animate-fadeIn {
            animation: fadeIn 0.4s ease-in-out forwards;
          }
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .tab-glow:hover {
            box-shadow: 0 0 10px rgba(219, 158, 48, 0.3);
          }
          .active-underline::after {
            content: '';
            display: block;
            width: 100%;
            height: 2px;
            background: #DB9E30;
            position: absolute;
            bottom: 0;
            left: 0;
            animation: underlineGrow 0.3s ease-out forwards;
          }
        `}
      </style>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between w-full gap-4">
        {/* Breadcrumb Path (Top-Left) */}
        {breadcrumbModule && (
          <h3 className="text-sm md:text-lg text-white capitalize flex-1 space-x-1 pl-3 font-medium">
            {breadcrumbModule === breadcrumbRoute ? null : (
              <span
                // to={modulePath}
                className={`${
                  breadcrumbRoute
                    ? "text-[#441a05] font-semibold transition-colors"
                    : "text-[#DB9E30] font-bold"
                }`}
              >
                {t(breadcrumbModule)}
                {breadcrumbRoute && " / "}
              </span>
            )}
            {breadcrumbRoute && (
              <span
                // to={routePath || modulePath}
                className="text-[#DB9E30] font-bold"
              >
                {t(breadcrumbRoute)}
              </span>
            )}
          </h3>
        )}

        {/* First-Level Tabs (Top-Right) */}
        {firstLevelTabs.length > 0 && (
          <div className="relative w-full md:w-1/2 flex items-center justify-end">
            {isOverflowing && (
              <button
                onClick={scrollLeft}
                className="absolute left-0 p-2 bg-white/80 text-[#441a05] rounded-full hover:bg-[#DB9E30] hover:text-white transition-colors z-10 animate-scaleIn focus:ring-2 ring-[#DB9E30]"
                aria-label="বামে স্ক্রল করুন"
                title="বামে স্ক্রল করুন"
                style={{ animationDelay: "0.1s" }}
              >
                <FaChevronLeft className="w-4 h-4" />
              </button>
            )}

            <div
              ref={tabsContainerRef}
              className="flex overflow-x-auto whitespace-nowrap no-scrollbar mx-6 gap-2 py-1"
            >
              {firstLevelTabs.map((child, index) => {
                const childPath = child.link || "#";
                const isActive = activeTab === childPath;

                return (
                  <NavLink
                    key={child.id}
                    to={childPath}
                    onClick={() => {
                      setSelectedMenuItem({
                        ...selectedMenuItem,
                        activeChild: child,
                      });
                    }}
                    className={({ isActive }) =>
                      `px-4 py-2 rounded-full text-xs md:text-sm capitalize transition-all duration-300 flex-shrink-0 tab-glow ${
                        isActive
                          ? "bg-[#DB9E30] text-white font-bold"
                          : "bg-white text-[#441a05] font-bold hover:bg-[#DB9E30] hover:text-white"
                      }`
                    }
                    style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                    aria-current="page"
                    title={t(child.title)}
                  >
                    {t(child.title)}
                  </NavLink>
                );
              })}
            </div>

            {isOverflowing && (
              <button
                onClick={scrollRight}
                className="absolute right-0 p-2 bg-white/80 text-[#441a05] rounded-full hover:bg-[#DB9E30] hover:text-white transition-colors z-10 animate-scaleIn focus:ring-2 ring-[#DB9E30]"
                aria-label="ডানে স্ক্রল করুন"
                title="ডানে স্ক্রল করুন"
                style={{ animationDelay: "0.1s" }}
              >
                <FaChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Second-Level Tabs (Content Area) */}
      {secondLevelTabs.length > 0 && (
        <div className="relative w-full mt-4 border-b pt-4 animate-fadeIn">
          <div className="flex flex-wrap gap-3 rounded-xl">
            {secondLevelTabs.map((child, index) => {
              const childPath = child.link || "#";
              const isActive = activeTab === childPath;

              return (
                <Link
                  key={child.id}
                  to={childPath}
                  onClick={() => {
                    setSelectedMenuItem({
                      ...selectedMenuItem,
                      activeChild: {
                        ...selectedMenuItem.activeChild,
                        activeChild: child,
                      },
                    });
                  }}
                  className={`relative px-4 sm:px-5 py-2 rounded-lg text-xs sm:text-base capitalize font-semibold transition-all duration-300 flex-shrink-0 animate-scaleIn ${
                    isActive
                      ? "text-[#DB9E30] active-underline"
                      : "text-[#441a05]/70 hover:text-[#DB9E30]"
                  }`}
                  style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                  aria-current={isActive ? "page" : undefined}
                  title={t(child.title)}
                >
                  {t(child.title)}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
