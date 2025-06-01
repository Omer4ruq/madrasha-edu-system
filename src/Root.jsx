import { createBrowserRouter, RouterProvider } from "react-router-dom";
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
<<<<<<< HEAD
import ExamType from "./components/exam/examType/AddExamTypes";

import AddExamTypes from "./components/exam/examType/AddExamTypes";
import AddMealsType from "./components/meals/AddMealsType";
import AddLeaveType from "./components/leave/AddLeaveType";
import AddLeaveRequest from "./components/leave/AddLeaveRequest";


=======
>>>>>>> 3a423bc563c3e6b0d2125cd40f1a6a8de352a4a6

function Root() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <App />,
      errorElement: <Dummy />,
      children: [
        {
          path: "/",
          element: <Home />,
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
                  path: "behavior-type",
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
          element: <AddClassConfig />, // Ensure correct component
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
                  path: "exam-type",
                  element: <AddExamTypes />,
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
          ],
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}




export default Root;