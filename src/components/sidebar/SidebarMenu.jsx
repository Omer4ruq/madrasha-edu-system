import { useState } from "react";
import { useTranslation } from "react-i18next";
import mainMenu from "../../data/mainMenu";
import SidebarMenuItem from "./SidebarMenuItem";

export default function SidebarMenu() {
  const [itemId, setItemId] = useState(null);
  const { t } = useTranslation();

  return (
    <ul className="nk-menu text-white py-6">
      {mainMenu.map((item) => (
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