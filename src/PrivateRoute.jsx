// PrivateRoute.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const PrivateRoute = () => {
  const token = useSelector((state) => state.auth.token) || localStorage.getItem("token");
  const location = useLocation();

  return token ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />;
};

export default PrivateRoute;
