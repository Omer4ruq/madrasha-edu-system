import { Link } from "react-router-dom";

export default function ProfileMenu() {

  const linkedMenu = [
    {
      name: "Profile",
      link: "#"
    },
    {
      name: "Settings",
      link: "#"
    },
    {
      name: "Logout",
      link: "#"
    }
  ]
  return (
   <div className="absolute z-50 bg-[#DB9E30] shadow rounded top-9 md:top-10 right-0 w-32 md:w-40 text-[#441a05] font-medium text-start tracking-wide cursor-pointer">
    {
      linkedMenu.map((item, index) => (
        <Link key={index} to={item.link}>
          <p className={`px-3 md:px-4 py-[6px] hover:bg-bgGray ${index !=0 && "border-t-2"}`}>{item.name}</p>
        </Link>
      ))
    }
   </div>
  )
}
