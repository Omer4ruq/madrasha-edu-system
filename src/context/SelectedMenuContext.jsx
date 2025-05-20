// src/context/SelectedMenuContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import mainMenu from "../data/mainMenu"; // Import your menu data

const SelectedMenuContext = createContext();

export function SelectedMenuProvider({ children }) {
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const location = useLocation();

  // Find the active menu item based on current location if none is selected
  useEffect(() => {
    if (!selectedMenuItem) {
      const findMatchingMenuItem = (items, path) => {
        // First look for exact matches
        for (const item of items) {
          // Check direct match
          if (item.link === path) {
            return item;
          }
          
          // Check first level children
          if (item.children) {
            for (const child of item.children) {
              if (child.link === path) {
                return {
                  ...item,
                  activeChild: child
                };
              }
              
              // Check second level children
              if (child.children) {
                for (const grandchild of child.children) {
                  if (grandchild.link === path) {
                    return {
                      ...item,
                      activeChild: {
                        ...child,
                        activeChild: grandchild
                      }
                    };
                  }
                }
              }
            }
          }
        }
        return null;
      };
      
      const activeItem = findMatchingMenuItem(mainMenu, location.pathname);
      if (activeItem) {
        setSelectedMenuItem(activeItem);
      }
    }
  }, [location.pathname, selectedMenuItem]);

  return (
    <SelectedMenuContext.Provider value={{ selectedMenuItem, setSelectedMenuItem }}>
      {children}
    </SelectedMenuContext.Provider>
  );
}

export function useSelectedMenu() {
  return useContext(SelectedMenuContext);
}