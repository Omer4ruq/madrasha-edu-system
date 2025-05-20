import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaAngleDown } from "react-icons/fa6";
import { Link, useLocation } from "react-router-dom";
import DropDownSearch from "./DropDownSearch";
import Icons from "./Icons";

export default function SidebarSearchMenuItem({ item, searchTerm }) {
  const [isOpen, setIsOpen] = useState(true);

  const {t} = useTranslation();

  function handleMenuClick() {
    setIsOpen((state) => !state);
  }

  // if the item has a DropDown, means no link attached than keep the current link
  const currentPath = useLocation();

  //here starts the searching code
  let show = structuredClone(item);

  //if in title, show the item fully. Means keep the variable show as it is. 
  const existInTitle = t(item.title).toLowerCase().includes(searchTerm.toLowerCase());  

  // if not in title, check children.
  if(!existInTitle) {

    //Case 1: if item has no children, check on it directly.
    if (!item.children) return null;

    //Case 2 : if item has children (1st level), show as opened
    if (item.children) {
      const existing = item.children.filter((child) => {
        const doesExist = t(child.title).toLowerCase().includes(searchTerm.toLowerCase());

        if (doesExist) return true;

        // Case 3: if item has children (2nd level), search on that
        if(child.children) {
          const existing2 = child.children?.filter((childL2) => {
            const doesExist2 = t(childL2.title).toLowerCase().includes(searchTerm.toLowerCase());

             if (doesExist2) return true;
          })

          // i can only detect if the 2nd nested layer contains that word or not. But can not change the show variable. Because using filter we return only true of false. If true that whole child is taken. So, by checking the nested layer we can just indicate that whether to keep the nested layer or not. But which one to show out the options of that nested layer is to be decided at the second layer component. 
          if (existing2.length > 0)  return true; 
        }

        // if not found, even at nested level 2, return false.
        return false;
      });
      
      if (existing.length > 0) {
        show.children = existing; 
      } else { return null; }
    }
  }
  
  
  return (
    <li
      className={`leading-10 group/main text-[#ffffff85] hover:text-[#ffffffab] hover:bg-[#00000010] duration-200 relative ${
        isOpen && "bg-[#00000010] text-[#b4a0d2]"
      }`}
    >
      <Link to={show?.link ? show.link : currentPath}>
        <div className="flex gap-2 items-center px-6" onClick={handleMenuClick}>
          <Icons name={show.icon} />
          <h4
            className={`text-[#ffffffab] group-hover/main:text-white duration-200 flex-1 ${
              isOpen && "text-[#fff]"
            }`}
          >
            {t(show.title)}
          </h4>
          {show?.children && (
            <FaAngleDown
              className={`font-thin text-sm duration-200 ${
                isOpen && "rotate-180"
              }`}
            />
          )}
        </div>
        {isOpen && show?.children && (
          <ul className="py-2 before:content-[''] before:block before:absolute before:z-1 before:left-[30px] before:top-10 before:bottom-0 before:border-l before:border-solid before:border-[#ffffff35]">
            {show.children.map((dropdown) => (
              <DropDownSearch
                key={dropdown.id}
                data={dropdown}
                searchTerm={searchTerm}
              />
            ))}
          </ul>
        )}
      </Link>
    </li>
  );
}
