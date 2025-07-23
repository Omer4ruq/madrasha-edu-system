import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import mainMenu from "../../data/mainMenu";
import SidebarMenuItem from "./SidebarMenuItem";
import { hasSuperAdminRole } from "../../utilitis/roleUtils";


export default function SidebarMenu() {
  const [itemId, setItemId] = useState(null);
  const { t } = useTranslation();
  const { role } = useSelector((state) => state.auth);
  
  // Filter menu items based on user role
  const filterMenuByRole = (menuItems) => {
    return menuItems.map(item => {
      // If item has no icon, it's a header - keep it as is
      if (!item.icon) {
        return item;
      }
      
      // Filter children based on role
      if (item.children) {
        const filteredChildren = item.children.filter(child => {
          // Check if this child requires SuperAdmin role
          const superAdminOnlyItems = [
            "/users/role-permission",
            "/users/role-types"
          ];
          
          if (superAdminOnlyItems.includes(child.link)) {
            return hasSuperAdminRole(role);
          }
          
          // For other items, show by default
          return true;
        });
        
        // If all children are filtered out and this is a parent-only item, hide it
        if (filteredChildren.length === 0 && item.children.length > 0) {
          return null;
        }
        
        return {
          ...item,
          children: filteredChildren
        };
      }
      
      return item;
    }).filter(Boolean); // Remove null items
  };

  const filteredMenu = filterMenuByRole(mainMenu);

  return (
    <ul className="nk-menu text-white py-6">
      {filteredMenu.map((item) => (
        <li
          key={item.id}
          className={
            item.icon
              ? "py-0.5"
              : "relative pt-5 px-6 text-[#ffffff70] uppercase font-bold text-sm leading-10 tracking-wide"
          }
        >
          {item.icon ? (
            <SidebarMenuItem
              item={item}
              itemId={itemId}
              setItemId={setItemId}
            />
          ) : (
            t(item.title)
          )}
        </li>
      ))}
    </ul>
  );
}