import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { logout } from "../../redux/features/slice/authSlice";

export default function ProfileMenu() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    const currentPath = window.location.pathname;
    localStorage.setItem("redirect_after_login", currentPath);
    dispatch(logout());
    navigate("/login");
    toast.success("সফলভাবে লগআউট হয়েছে!");
  };

  // user না থাকলে কিছুই দেখাবে না
  if (!user) return null;

  const linkedMenu = [
    {
      name: "প্রোফাইল",
      link: "/profile"
    },
    {
      name: "সেটিংস",
      link: "/settings"
    },
    {
      name: "লগআউট",
      action: handleLogout
    }
  ];

  return (
    <div className="absolute z-50 bg-[#DB9E30] shadow rounded top-9 md:top-10 right-0 w-32 md:w-40 text-[#441a05] font-medium text-start tracking-wide cursor-pointer">
      {linkedMenu.map((item, index) =>
        item.link ? (
          <Link key={index} to={item.link}>
            <p className={`px-3 md:px-4 py-[6px] hover:bg-bgGray ${index !== 0 ? "border-t-2" : ""}`}>
              {item.name}
            </p>
          </Link>
        ) : (
          <p
            key={index}
            onClick={item.action}
            className={`px-3 md:px-4 py-[6px] hover:bg-bgGray ${index !== 0 ? "border-t-2" : ""}`}
          >
            {item.name}
          </p>
        )
      )}
    </div>
  );
}
