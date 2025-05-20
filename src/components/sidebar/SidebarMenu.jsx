import { useState } from "react";
import { useTranslation } from "react-i18next";
import mainMenu from "../../data/mainMenu";
import SidebarMenuItem from "./SidebarMenuItem";

export default function SidebarMenu() {
  //make sure only one dropdown is open at a time
  const [itemId, setItemId] = useState(null);

  // console.log("1");

  const {t} = useTranslation();

  return (
    <ul className="text-white py-6">
      {/* if item has no icon then it a header item. directly print list element for the header. for actual menu items, pass the component. */}
      {mainMenu.map((item) => (
        <>
          {item.icon ? (
            <SidebarMenuItem
              key={item.id}
              item={item}
              itemId={itemId}
              setItemId={setItemId}
            />
          ) : (
            <li
              key={item.id}
              className="text-[#ffffff70] uppercase font-bold text-sm leading-10 tracking-wide pt-5 px-6"
            >
              {t(item.title)}
            </li>
          )}
        </>
      ))}
    </ul>
  );
}
