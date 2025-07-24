// import React from 'react';
// import { Navigate, Outlet } from 'react-router-dom';
// import { useSelector } from 'react-redux';

// const SuperAdminRoute = () => {
//   const { role } = useSelector((state) => state.auth);
  
//   // Check if user has SuperAdmin role
//   const isSuperAdmin = role && (role.includes('SuperAdmin') || role === 'SuperAdmin');
  
//   if (!isSuperAdmin) {
//     // Redirect to dashboard or show access denied page
//     return <Navigate to="/dashboard" replace />;
//   }
  
//   return <Outlet />;
// };

// export default SuperAdminRoute;

import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { hasSuperAdminRole } from "./utilitis/roleUtils";


export function SuperAdminRoute({ children }) {
  const { role } = useSelector((state) => state.auth);
  
  if (!hasSuperAdminRole(role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}