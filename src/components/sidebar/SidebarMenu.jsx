import { useState } from "react";
import { useTranslation } from "react-i18next";
import mainMenu from "../../data/mainMenu";
import SidebarMenuItem from "./SidebarMenuItem";

export default function SidebarMenu() {
  const [itemId, setItemId] = useState(null);
  const { t } = useTranslation();

  return (
    <ul className="text-white py-6">
      {mainMenu.map((item) => (
        <li
          key={item.id}
          className={
            item.icon
              ? ""
              : "text-[#ffffff70] uppercase font-bold text-sm leading-10 tracking-wide pt-5 px-6"
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