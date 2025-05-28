// src/components/common/Breadcrumb.jsx
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelectedMenu } from "../../context/SelectedMenuContext";
import { useEffect, useState } from "react";

export default function Breadcrumb({ module, route, nestedRoute }) {
  const { selectedMenuItem } = useSelectedMenu();
  const { t } = useTranslation();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.pathname);

  // Update active tab when location changes
  useEffect(() => {
    setActiveTab(location.pathname);
  }, [location.pathname]);

  // Construct URLs for module and route paths
  const modulePath = module ? `/${module?.replace(/\s/g, "-")}` : "/";
  
  // Handle breadcrumb path display
  const getBreadcrumbPaths = () => {
    if (!selectedMenuItem) return { module: null, route: null, nestedRoute: null };
    
    let currentModule = module;
    let currentRoute = null;
    let currentNestedRoute = null;
    
    // If there's an active child, use its information
    if (selectedMenuItem.activeChild) {
      currentRoute = selectedMenuItem.title;
      
      // If there's a nested active child (second level)
      if (selectedMenuItem.activeChild.activeChild) {
        currentNestedRoute = selectedMenuItem.activeChild.activeChild.title;
      } else {
        currentNestedRoute = selectedMenuItem.activeChild.title;
      }
    }
    
    return {
      module: currentModule,
      route: currentRoute || route,
      nestedRoute: currentNestedRoute || nestedRoute
    };
  };

  const { module: breadcrumbModule, route: breadcrumbRoute, nestedRoute: breadcrumbNestedRoute } = getBreadcrumbPaths();

  return (
    <div className="pl-4 xl:pl-2 my-5">
      {/* Breadcrumb Path */}
      {breadcrumbModule && (
        <h3 className="text-lg text-white capitalize mb-2">
          <Link
            to={modulePath}
            className={`${
              breadcrumbRoute ? "text-white hover:text-#DB9E30" : "text-#DB9E30 font-bold"
            }`}
          >
            {breadcrumbModule} {breadcrumbRoute && "/ "}
          </Link>
          
          {breadcrumbRoute && (
            <span className={`${
              breadcrumbNestedRoute ? "text-white hover:text-#DB9E30" : "text-#DB9E30 font-bold"
            }`}>
              {t(breadcrumbRoute)}
              {breadcrumbNestedRoute && " / "}
            </span>
          )}
          
          {breadcrumbNestedRoute && (
            <span className="text-#DB9E30 font-bold">
              {t(breadcrumbNestedRoute)}
            </span>
          )}
        </h3>
      )}
      
      {/* Tabs from selected menu children */}
      {selectedMenuItem?.children && selectedMenuItem.children.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedMenuItem.children.map((child) => {
            const childPath = child.link || "#";
            const isActive = activeTab === childPath;
            
            return (
              <Link
                key={child.id}
                to={childPath}
                className={`px-4 py-2 rounded-md text-sm capitalize transition-colors ${
                  isActive
                    ? "bg-#DB9E30 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-#DB9E30 hover:text-white"
                }`}
              >
                {t(child.title)}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}