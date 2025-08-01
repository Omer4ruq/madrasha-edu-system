import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { instituteApi } from "./features/api/institute/instituteApi";
import { instituteTypeApi } from "./features/api/institute/instituteTypeApi";
import { studentClassApi } from "./features/api/student/studentClassApi";
import { classListApi } from "./features/api/class/classListApi";
import { studentSectionApi } from "./features/api/student/studentSectionApi";
import { studentShiftApi } from "./features/api/student/studentShiftApi";
import { classConfigApi } from "./features/api/class/classConfigApi";
import { studentRegistrationApi } from "./features/api/student/studentRegistrationApi";
import { staffRegistrationApi } from "./features/api/staff/staffRegistration";
import { studentListApi } from "./features/api/student/studentListApi";
import { staffListApi } from "./features/api/staff/staffListApi";
import { behaviorTypeApi } from "./features/api/behavior/behaviorTypeApi";
import { mealsNameApi } from "./features/api/meal/mealsNameApi";
import { mealItemApi } from "./features/api/meal/mealItemApi";
import { mealSetupApi } from "./features/api/meal/mealSetupApi";
import { behaviorMarksApi } from "./features/api/behavior/behaviorMarksApi";
import { examApi } from "./features/api/exam/examApi";
import { leaveApi } from "./features/api/leave/leaveApi";
import { leaveQuotasApi } from "./features/api/leave/leaveQuotasApi";
import { leaveRequestApi } from "./features/api/leave/leaveRequestApi";
import { cleanReportApi } from "./features/api/clean/cleanReportApi";
import { behaviorReportApi } from "./features/api/behavior/behaviorReportApi";
import { studentActiveApi } from "./features/api/student/studentActiveApi";
import { jointUsersApi } from "./features/api/jointUsers/jointUsersApi";
import { performanceApi } from "./features/api/performance/performanceApi";
import { teacherPerformanceApi } from "./features/api/performance/teacherPerformanceApi";
import { roleStaffProfileApi } from "./features/api/roleStaffProfile/roleStaffProfileApi";
import { fundsApi } from "./features/api/funds/fundsApi";
import { subfundsApi } from "./features/api/subFunds/subFundsApi";
import { incomeHeadsApi } from "./features/api/income-heads/incomeHeadsApi";
import { expenseHeadsApi } from "./features/api/expense-heads/expenseHeadsApi";
import { feeHeadsApi } from "./features/api/fee-heads/feeHeadsApi";
import { feePackagesApi } from "./features/api/fee-packages/feePackagesApi";
import { incomeItemsApi } from "./features/api/income-items/incomeItemsApi";
import { expenseItemsApi } from "./features/api/expense-items/expenseItemsApi";
import { waiversApi } from "./features/api/waivers/waiversApi";
import { academicYearApi } from "./features/api/academic-year/academicYearApi";
import { transactionBooksApi } from "./features/api/transaction-books/transactionBooksApi";
import { feesNameApi } from "./features/api/fees-name/feesName";
import { feesApi } from "./features/api/fees/feesApi";
import { studentFeesCurrentApi } from "./features/api/studentFeesCurrentApi/studentFeesCurrentApi";
import { studentFeesPreviousApi } from "./features/api/studentFeesPreviousApi/studentFeesPreviousApi";
import { deleteFeesApi } from "./features/api/deleteFees/deleteFeesApi";
import { mealStatusApi } from "./features/api/meal/mealStatusApi";
import { studentSubAttendanceApi } from "./features/api/student-sub-attendance/studentSubAttendanceApi";
import { subjectAssignApi } from "./features/api/subject-assign/subjectAssignApi";
import { classSubjectsApi } from "./features/api/class-subjects/classSubjectsApi";
import { subjectMarkConfigsApi } from "./features/api/marks/subjectMarkConfigsApi";
import { gmarkTypeApi } from "./features/api/marks/gmarktype";
import { subjectMarksApi } from "./features/api/marks/subjectMarksApi";
import { classPeriodsApi } from "./features/api/periods/classPeriodsApi";
import { instituteLatestApi } from "./features/api/institute/instituteLatestApi";
import { classExamStudentApi } from "./features/api/class-exam-students/classExamStudentApi ";
import { teacherSubjectAssignsApi } from "./features/api/teacherSubjectAssigns/teacherSubjectAssignsApi";
import { eventApi } from "./features/api/event/eventApi";
import { routinesApi } from "./features/api/routines/routinesApi";
import { examRoutineApi } from "./features/api/routines/examRoutineApi";
import { gsubjectApi } from "./features/api/class-subjects/gsubjectApi";
import { gfeeSubheadsApi } from "./features/api/gfee-subheads/gfeeSubheadsApi";
import { studentBulkRegisterApi } from "./features/api/student/studentBulkRegisterApi";
import { staffBulkRegisterApi } from "./features/api/staff/staffBulkRegisterApi";
import { groupListApi } from "./features/api/permissionRole/groupListApi";
import { permissionListApi } from "./features/api/permissionRole/permissionListApi";
import { groupsApi } from "./features/api/permissionRole/groupsApi";
import { loginApi } from "./features/api/auth/loginApi";
import { cleanReportTypeApi } from "./features/api/clean/cleanReportTypeApi";
import { roleTypesApi } from "./features/api/roleType/roleTypesApi";
import authReducer from './features/slice/authSlice';
import { gradeRuleApi } from "./features/api/result/gradeRuleApi";
import { noticeApi } from "./features/api/notice/noticeApi";

export const store = configureStore({
  reducer: {


    auth: authReducer,


    [instituteApi.reducerPath]: instituteApi.reducer,
    [instituteTypeApi.reducerPath]: instituteTypeApi.reducer,
    [studentClassApi.reducerPath]: studentClassApi.reducer,
    [classListApi.reducerPath]: classListApi.reducer,
    [studentSectionApi.reducerPath]: studentSectionApi.reducer,
    [studentShiftApi.reducerPath]: studentShiftApi.reducer,
    [classConfigApi.reducerPath]: classConfigApi.reducer,
    [studentRegistrationApi.reducerPath]: studentRegistrationApi.reducer,
    [staffRegistrationApi.reducerPath]: staffRegistrationApi.reducer,
    [studentListApi.reducerPath]: studentListApi.reducer,
    [studentActiveApi.reducerPath]: studentActiveApi.reducer,
    [staffListApi.reducerPath]: staffListApi.reducer,
    [behaviorTypeApi.reducerPath]: behaviorTypeApi.reducer,
    [behaviorMarksApi.reducerPath]: behaviorMarksApi.reducer,
    [mealsNameApi.reducerPath]: mealsNameApi.reducer,
    [mealItemApi.reducerPath]: mealItemApi.reducer,
    [mealSetupApi.reducerPath]: mealSetupApi.reducer,
    [mealStatusApi.reducerPath]: mealStatusApi.reducer,
    [examApi.reducerPath]: examApi.reducer,
    [leaveApi.reducerPath]: leaveApi.reducer,
    [leaveQuotasApi.reducerPath]: leaveQuotasApi.reducer,
    [leaveRequestApi.reducerPath]: leaveRequestApi.reducer,
    [cleanReportApi.reducerPath]: cleanReportApi.reducer,
    [behaviorReportApi.reducerPath]: behaviorReportApi.reducer,
    [jointUsersApi.reducerPath]: jointUsersApi.reducer,
    [performanceApi.reducerPath]: performanceApi.reducer,
    [teacherPerformanceApi.reducerPath]: teacherPerformanceApi.reducer,
    [roleStaffProfileApi.reducerPath]: roleStaffProfileApi.reducer,
    [fundsApi.reducerPath]: fundsApi.reducer,
    [subfundsApi.reducerPath]: subfundsApi.reducer,
    [incomeHeadsApi.reducerPath]: incomeHeadsApi.reducer,
    [expenseHeadsApi.reducerPath]: expenseHeadsApi.reducer,
    [feeHeadsApi.reducerPath]: feeHeadsApi.reducer,
    [feePackagesApi.reducerPath]: feePackagesApi.reducer,
    [incomeItemsApi.reducerPath]: incomeItemsApi.reducer,
    [expenseItemsApi.reducerPath]: expenseItemsApi.reducer,
    [waiversApi.reducerPath]: waiversApi.reducer,
    [academicYearApi.reducerPath]: academicYearApi.reducer,
    [transactionBooksApi.reducerPath]: transactionBooksApi.reducer,
    [feesNameApi.reducerPath]: feesNameApi.reducer,
    [gfeeSubheadsApi.reducerPath]: gfeeSubheadsApi.reducer,
    [feesApi.reducerPath]: feesApi.reducer,
    [studentFeesCurrentApi.reducerPath]: studentFeesCurrentApi.reducer,
    [studentFeesPreviousApi.reducerPath]: studentFeesPreviousApi.reducer,
    [deleteFeesApi.reducerPath]: deleteFeesApi.reducer,
    [studentSubAttendanceApi.reducerPath]: studentSubAttendanceApi.reducer,
    [subjectAssignApi.reducerPath]: subjectAssignApi.reducer,
    [gsubjectApi.reducerPath]: gsubjectApi.reducer,
    [classSubjectsApi.reducerPath]: classSubjectsApi.reducer,
    [subjectMarkConfigsApi.reducerPath]: subjectMarkConfigsApi.reducer,
    [gmarkTypeApi.reducerPath]: gmarkTypeApi.reducer,
    [subjectMarksApi.reducerPath]: subjectMarksApi.reducer,
    [classPeriodsApi.reducerPath]: classPeriodsApi.reducer,
    [instituteLatestApi.reducerPath]: instituteLatestApi.reducer,
    [classExamStudentApi.reducerPath]: classExamStudentApi.reducer,
    [teacherSubjectAssignsApi.reducerPath]: teacherSubjectAssignsApi.reducer,
    [eventApi.reducerPath]: eventApi.reducer,
    [routinesApi.reducerPath]: routinesApi.reducer,
    [groupListApi.reducerPath]: groupListApi.reducer,
    [permissionListApi.reducerPath]: permissionListApi.reducer,
    [groupsApi.reducerPath]: groupsApi.reducer,
    [examRoutineApi.reducerPath]: examRoutineApi.reducer,
    [studentBulkRegisterApi.reducerPath]: studentBulkRegisterApi.reducer,
    [staffBulkRegisterApi.reducerPath]: staffBulkRegisterApi.reducer,
    [loginApi.reducerPath]: loginApi.reducer,
    [cleanReportTypeApi.reducerPath]: cleanReportTypeApi.reducer,
    [roleTypesApi.reducerPath]: roleTypesApi.reducer,
    [roleTypesApi.reducerPath]: roleTypesApi.reducer,
    [gradeRuleApi.reducerPath]: gradeRuleApi.reducer,
    [noticeApi.reducerPath]: noticeApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(instituteApi.middleware)
      .concat(instituteTypeApi.middleware)
      .concat(studentClassApi.middleware)
      .concat(classListApi.middleware)
      .concat(studentSectionApi.middleware)
      .concat(studentShiftApi.middleware)
      .concat(classConfigApi.middleware)
      .concat(studentRegistrationApi.middleware)
      .concat(staffRegistrationApi.middleware)
      .concat(studentListApi.middleware)
      .concat(staffListApi.middleware)
      .concat(studentActiveApi.middleware)
      .concat(behaviorTypeApi.middleware)
      .concat(behaviorMarksApi.middleware)
      .concat(mealsNameApi.middleware)
      .concat(mealItemApi.middleware)
      .concat(mealSetupApi.middleware)
      .concat(examApi.middleware)
      .concat(leaveApi.middleware)
      .concat(leaveQuotasApi.middleware)
      .concat(leaveRequestApi.middleware)
      .concat(cleanReportApi.middleware)
      .concat(behaviorReportApi.middleware)
      .concat(jointUsersApi.middleware)
      .concat(performanceApi.middleware)
      .concat(teacherPerformanceApi.middleware)
      .concat(roleStaffProfileApi.middleware)
      .concat(fundsApi.middleware)
      .concat(subfundsApi.middleware)
      .concat(incomeHeadsApi.middleware)
      .concat(expenseHeadsApi.middleware)
      .concat(feeHeadsApi.middleware)
      .concat(feePackagesApi.middleware)
      .concat(incomeItemsApi.middleware)
      .concat(expenseItemsApi.middleware)
      .concat(waiversApi.middleware)
      .concat(academicYearApi.middleware)
      .concat(transactionBooksApi.middleware)
      .concat(feesNameApi.middleware)
      .concat(gfeeSubheadsApi.middleware)
      .concat(feesApi.middleware)
      .concat(studentFeesCurrentApi.middleware)
      .concat(studentFeesPreviousApi.middleware)
      .concat(deleteFeesApi.middleware)
      .concat(mealStatusApi.middleware)
      .concat(studentSubAttendanceApi.middleware)
      .concat(subjectAssignApi.middleware)
      .concat(gsubjectApi.middleware)
      .concat(classSubjectsApi.middleware)
      .concat(subjectMarkConfigsApi.middleware)
      .concat(gmarkTypeApi.middleware)
      .concat(subjectMarksApi.middleware)
      .concat(classPeriodsApi.middleware)
      .concat(instituteLatestApi.middleware)
      .concat(classExamStudentApi.middleware)
      .concat(teacherSubjectAssignsApi.middleware)
      .concat(eventApi.middleware)
      .concat(routinesApi.middleware)
      .concat(examRoutineApi.middleware)
      .concat(staffBulkRegisterApi.middleware)
      .concat(studentBulkRegisterApi.middleware)
      .concat(loginApi.middleware)
      .concat(groupListApi.middleware)
      .concat(permissionListApi.middleware)
      .concat(groupsApi.middleware)
      .concat(cleanReportTypeApi.middleware)
      .concat(roleTypesApi.middleware)
      .concat(gradeRuleApi.middleware)
      .concat(noticeApi.middleware)
});

// Enable refetchOnFocus/refetchOnReconnect behaviors
setupListeners(store.dispatch);
