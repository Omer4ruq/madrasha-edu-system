import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { FaAngleDown } from "react-icons/fa6";
import { NavLink, useLocation } from "react-router-dom";

import Icons from "./Icons";
import { useSelectedMenu } from "../../context/SelectedMenuContext";
import slideDown from "../../utilitis/slideDown";
import slideUp from "../../utilitis/slideUp";
import getParents from "../../utilitis/getParents";

export default function SidebarMenuItem({ item, itemId, setItemId, level = 1 }) {
  const [isOpen, setIsOpen] = useState(false);
  const { setSelectedMenuItem } = useSelectedMenu();
  const { t } = useTranslation();
  const location = useLocation();
  const submenuRef = useRef(null);

  // Menu classes inspired by Menu.jsx
  const menuClasses = {
    main: "nk-menu",
    item: "nk-menu-item",
    link: "nk-menu-link",
    toggle: "nk-menu-toggle",
    sub: "nk-menu-sub",
    subparent: "has-sub",
    active: "active",
    current: "current-page",
  };

  // Check if this menu item or any of its children are active
  const isChildActive = (children) => {
    if (!children) return false;
    return children.some(
      (child) =>
        child.link === location.pathname ||
        (child.children && isChildActive(child.children))
    );
  };

  const isActive = item.link === location.pathname || isChildActive(item.children);

  // Open menu if active and sync with itemId
  useEffect(() => {
    if (isActive && !isOpen) {
      setIsOpen(true);
      setItemId(item.id);
      if (item.children) {
        setSelectedMenuItem(item);
        if (submenuRef.current) {
          slideDown(submenuRef.current, 400);
        }
      }
    } else if (!isActive && isOpen && item.id !== itemId) {
      setIsOpen(false);
      if (submenuRef.current) {
        slideUp(submenuRef.current, 400);
      }
    }
  }, [isActive, item.id, itemId, setItemId, setSelectedMenuItem, location.pathname]);

  // Close other dropdowns when this one is opened
  const closeSiblings = (elm) => {
    const parent = elm.parentElement;
    const siblings = parent.parentElement.children;
    Array.from(siblings).forEach((sibling) => {
      if (sibling !== parent) {
        sibling.classList.remove(menuClasses.active);
        if (sibling.classList.contains(menuClasses.subparent)) {
          const subitems = sibling.querySelectorAll(`.${menuClasses.sub}`);
          subitems.forEach((child) => {
            child.parentElement.classList.remove(menuClasses.active);
            slideUp(child, 400);
          });
        }
      }
    });
  };

  // Toggle dropdown
  const handleMenuClick = (e) => {
    e.preventDefault();
    if (item.children) {
      setIsOpen((prev) => !prev);
      setItemId(item.id);
      setSelectedMenuItem(item);
      if (submenuRef.current) {
        if (!isOpen) {
          slideDown(submenuRef.current, 400);
          closeSiblings(submenuRef.current.parentElement);
        } else {
          slideUp(submenuRef.current, 400);
        }
      }
    }
  };

  // Update active states on route change
  useEffect(() => {
    const links = document.querySelectorAll(`.${menuClasses.link}`);
    links.forEach((link) => {
      if (link.classList.contains(menuClasses.active)) {
        closeSiblings(link);
        link.parentElement.classList.add(menuClasses.active);
      } else {
        link.parentElement.classList.remove(menuClasses.active);
      }
    });

    const allLinks = document.querySelectorAll(`.${menuClasses.link}`);
    allLinks.forEach((item) => {
      const activeRouterLink = item.classList.contains(menuClasses.active);
      if (activeRouterLink) {
        const parents = getParents(item, `.${menuClasses.main}`, menuClasses.item);
        parents.forEach((parentElement) => {
          parentElement.classList.add(menuClasses.active, menuClasses.current);
          const subItem = parentElement.querySelector(`.${menuClasses.sub}`);
          if (subItem) {
            slideDown(subItem, 400);
          }
        });
      } else {
        item.parentElement.classList.remove(menuClasses.active, menuClasses.current);
      }
    });
  }, [location.pathname]);

  // Adjust padding based on level
  const paddingLeft = level === 1 ? "px-6" : `pl-[calc(theme(spacing.6)+theme(spacing.9)*${level - 1})]`;

  return (
    <li
      className={`py-0.5 group/item ${item.children ? menuClasses.subparent : ""} ${
        isOpen || isActive ? "bg-[#00000010] text-[#db9e30]" : ""
      }`}
    >
      {item.children ? (
        <a
          href="#expand"
          className={`${menuClasses.toggle} flex items-center py-2.5 ${paddingLeft} font-heading font-bold tracking-snug text-[#ffffffab] hover:text-white group-hover/item:text-white duration-200 relative`}
          onClick={handleMenuClick}
        >
          {item.icon && level === 1 && (
            <span className="font-normal tracking-normal w-9 inline-flex flex-grow-0 flex-shrink-0 text-[#ffffff85] group-[.active]/item:text-[#db9e30] group-hover/item:text-[#db9e30]">
              <Icons name={item.icon} className="text-2xl leading-none transition-all duration-300" />
            </span>
          )}
          <span className="flex-grow-1 inline-block whitespace-nowrap transition-all duration-300 text-[#ffffffab] group-[.active]/item:text-[#db9e30] group-hover/item:text-white">
            {t(item.title)}
          </span>
          <FaAngleDown
            className={`text-base leading-none text-[#ffffff85] group-[.active]/item:text-[#db9e30] absolute right-5 top-1/2 -translate-y-1/2 transition-all duration-300 ${
              isOpen ? "rotate-90" : ""
            }`}
          />
        </a>
      ) : (
        <NavLink
          to={item.link || "#"}
          className={`${menuClasses.link} flex items-center py-2.5 ${paddingLeft} font-heading font-bold tracking-snug text-[#ffffffab] hover:text-white group-hover/item:text-white duration-200 relative`}
          onClick={() => {
            setItemId(item.id);
            setSelectedMenuItem(item);
          }}
          end
        >
          {item.icon && level === 1 && (
            <span className="font-normal tracking-normal w-9 inline-flex flex-grow-0 flex-shrink-0 text-[#ffffff85] group-[.active]/item:text-[#db9e30] group-hover/item:text-[#db9e30]">
              <Icons name={item.icon} className="text-2xl leading-none transition-all duration-300" />
            </span>
          )}
          <span className="flex-grow-1 inline-block whitespace-nowrap transition-all duration-300 text-[#ffffffab] group-[.active]/item:text-[#db9e30] group-hover/item:text-white">
            {t(item.title)}
          </span>
        </NavLink>
      )}
      {item.children && (
        <ul
          ref={submenuRef}
          className={`${menuClasses.sub} hidden py-2 before:content-[''] before:block before:absolute before:z-1 before:left-[30px] before:top-10 before:bottom-0 before:border-l before:border-solid before:border-[#ffffff35]`}
        >
          {item.children.map((child) => (
            <SidebarMenuItem
              key={child.id}
              item={child}
              itemId={itemId}
              setItemId={setItemId}
              level={level + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}