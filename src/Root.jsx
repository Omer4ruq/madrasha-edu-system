import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import App from "./App";
import LeaveType from "./components/attendance/leave-type/LeaveType";
import Home from "./components/homePage/Home";
import EditInstituteInfo from "./components/instituteProfile/EditInstituteInfo";
import InstituteProfile from "./components/instituteProfile/InstituteProfile";
import Dummy from "./components/to-be-deleted (trash templates)/Dummy";
import ClassManagement from "./components/ClassManagement/ClassManagement";
import AddSection from "./components/ClassManagement/AddSection";
import AddClass from "./components/ClassManagement/AddClass";
import AddShift from "./components/ClassManagement/AddShift";
import AddClassConfig from "./components/ClassManagement/AddClassConfig.jsx";
import AddBehaviorType from "./components/behavior/AddBehaviorType";
import AddBehaviorMarks from "./components/behavior/AddBehaviorMarks";
import CleanReport from "./components/clean/CleanReport";
import AddExamTypes from "./components/exam/examType/AddExamTypes";
import AddMealsType from "./components/meals/AddMealsType";
import AddLeaveType from "./components/leave/AddLeaveType";
import AddLeaveRequest from "./components/leave/AddLeaveRequest";
<<<<<<< HEAD
import { useEffect } from "react";
import PerformanceType from "./components/performance/PerformanceType";

// 🧠 Custom layout to handle reload redirection
const RootLayout = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const redirectMap = {
      "/talimat/class-management/add-section": "/talimat/class-management",
      "/talimat/class-management/add-shift": "/talimat/class-management",
      "/talimat/class-management/add-config": "/talimat/class-management",
      "/darul-iqam/settings/leave-type": "/darul-iqam/settings",
      "/darul-iqam/settings/meal-type": "/darul-iqam/settings",
    };

    const parentPath = redirectMap[pathname];
    if (parentPath && window.performance?.navigation.type === 1) {
      window.location.replace(parentPath);
    }
  }, [pathname]);

  return <Outlet />;
};
=======
>>>>>>> 9b6cda81f28561d9707cccd57c3fe91b1cf6b607

function Root() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <App />,
      errorElement: <Dummy />,
      children: [
        {
          path: "/",
          element: <Navigate to="/dashboard" replace />,
        },
        {
          path: "dashboard",
          element: <Home />,
        },
        {
          path: "institute-profile",
          element: <InstituteProfile />,
        },
        {
          path: "institute-profile/edit-info",
          element: <EditInstituteInfo />,
        },
        {
          path: "darul-iqam",
          children: [
            {
              path: "settings",
              children: [
                {
<<<<<<< HEAD
                  path: "/darul-iqam/settings",
                  children: [
                    {
                      index: true,
                      element: <AddBehaviorType />,
                    },
                    {
                      path: "/darul-iqam/settings/leave-type",
                      element: <AddLeaveType />,
                    },
                    {
                      path: "/darul-iqam/settings/meal-type",
                      element: <AddMealsType />,
                    },
                     {
                      path: "/darul-iqam/settings/performance-type",
                      element: <PerformanceType />,
                    },
                  ],
=======
                  index: true,
                  element: <AddBehaviorType />,
>>>>>>> 9b6cda81f28561d9707cccd57c3fe91b1cf6b607
                },
                {
                  path: "leave-type",
                  element: <AddLeaveType />,
                },
                {
                  path: "meal-type",
                  element: <AddMealsType />,
                },
                {
                  path: "*",
                  element: <Navigate to="/darul-iqam/settings" replace />,
                },
              ],
            },
            {
              path: "behavior-marks",
              element: <AddBehaviorMarks />,
            },
            {
              path: "clean-report",
              element: <CleanReport />,
            },
            {
              path: "leave-request",
              element: <AddLeaveRequest />,
            },
          ],
        },
        {
          path: "talimat",
          children: [
            {
              path: "settings",
              children: [
                {
                  index: true,
                  element: <AddExamTypes />,
                },
                {
                  path: "*",
                  element: <Navigate to="/talimat/settings" replace />,
                },
              ],
            },
            {
              path: "class-management",
              element: <ClassManagement />,
              children: [
                {
                  index: true,
                  element: <AddClass />,
                },
                {
                  path: "add-section",
                  element: <AddSection />,
                },
                {
                  path: "add-shift",
                  element: <AddShift />,
                },
                {
                  path: "add-config",
                  element: <AddClassConfig />,
                },
                {
                  path: "*",
                  element: <Navigate to="/talimat/class-management" replace />,
                },
              ],
            },
          ],
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default Root;
