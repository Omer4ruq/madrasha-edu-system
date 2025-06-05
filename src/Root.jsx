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
import PerformanceType from "./components/performance/PerformanceType";

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
                  index: true,
                  element: <AddBehaviorType />,
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
                  path: "performance-type",
                  element: <PerformanceType />,
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
