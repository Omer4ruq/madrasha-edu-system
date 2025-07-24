import { useSelector } from "react-redux";
import mainMenu from "../../data/mainMenu";
import SidebarSearchMenuItem from "./SidebarSearchMenuItem";
import { hasSuperAdminRole } from "../../utilitis/roleUtils";


export default function SidebarSearchMenu({ searchTerm }) {
  const { role } = useSelector((state) => state.auth);
  
  // Filter menu items based on role (same logic as SidebarMenu)
  const filterMenuByRole = (menuItems) => {
    return menuItems.map(item => {
      if (!item.icon) {
        return item;
      }
      
      if (item.children) {
        const filteredChildren = item.children.filter(child => {
          const superAdminOnlyItems = [
            "/users/role-permission",
            "/users/role-types"
          ];
          
          if (superAdminOnlyItems.includes(child.link)) {
            return hasSuperAdminRole(role);
          }
          
          return true;
        });
        
        if (filteredChildren.length === 0 && item.children.length > 0) {
          return null;
        }
        
        return {
          ...item,
          children: filteredChildren
        };
      }
      
      return item;
    }).filter(Boolean);
  };

  const filteredMenu = filterMenuByRole(mainMenu);

  return (
    <ul className="text-white py-6">
      {filteredMenu.map((item) => (
        <>
          {item.icon && (
            <SidebarSearchMenuItem
              key={item.id}
              item={item}
              searchTerm={searchTerm}
            />
          )}
        </>
      ))}
    </ul>
  );
}