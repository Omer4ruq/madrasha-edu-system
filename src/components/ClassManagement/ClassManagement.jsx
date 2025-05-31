import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

const ClassManagement = () => {
  return (
    <div className="">
      <div className="mx-auto">
        {/* <h2 className="text-2xl font-bold mb-6">Class Management</h2> */}
        {/* <div className="flex space-x-4 mb-6">
          <NavLink
            to="/class-management"
            end
            className={({ isActive }) =>
              isActive
                ? "bg-blue-600 text-white px-4 py-2 rounded"
                : "bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
            }
          >
            Add Classes
          </NavLink>
          <NavLink
            to="/class-management/add-section"
            className={({ isActive }) =>
              isActive
                ? "bg-blue-600 text-white px-4 py-2 rounded"
                : "bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
            }
          >
            Add Section
          </NavLink>
        </div> */}
        <Outlet />
      </div>
    </div>
  );
};

export default ClassManagement;