import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { instituteApi } from './features/api/institute/instituteApi';
import { instituteTypeApi } from './features/api/institute/instituteTypeApi';
import { studentClassApi } from './features/api/student/studentClassApi';
import { classListApi } from './features/api/class/classListApi';
import { studentSectionApi } from './features/api/student/studentSectionApi';
import { studentShiftApi } from './features/api/student/studentShiftApi';
import { classConfigApi } from './features/api/class/classConfigApi';
import { studentRegistrationApi } from './features/api/student/studentRegistrationApi';
import { staffRegistrationApi } from './features/api/staff/staffRegistration';
import { studentListApi } from './features/api/student/studentListApi';
import { staffListApi } from './features/api/staff/staffListApi';
import { behaviorTypeApi } from './features/api/behavior/behaviorTypeApi';
import { mealsNameApi } from './features/api/meal/mealsNameApi';
import { mealItemApi } from './features/api/meal/mealItemApi';
import { mealSetupApi } from './features/api/meal/mealSetupApi';
import { behaviorMarksApi } from './features/api/behavior/behaviorMarksApi';
import { examApi } from './features/api/exam/examApi';
import { leaveApi } from './features/api/leave/leaveApi';
import { leaveQuotasApi } from './features/api/leave/leaveQuotasApi';
import { leaveRequestApi } from './features/api/leave/leaveRequestApi';
import { cleanReportApi } from './features/api/clean/cleanReportApi';
import { behaviorReportApi } from './features/api/behavior/behaviorReportApi';
import { studentActiveApi } from './features/api/student/studentActiveApi';
import { jointUsersApi } from './features/api/jointUsers/jointUsersApi';
import { performanceApi } from './features/api/performance/performanceApi';
import { teacherPerformanceApi } from './features/api/performance/teacherPerformanceApi';
import { roleStaffProfileApi } from './features/api/roleStaffProfile/roleStaffProfileApi';
import { fundsApi } from './features/api/funds/fundsApi';
import { subfundsApi } from './features/api/subFunds/subFundsApi';
import { incomeHeadsApi } from './features/api/income-heads/incomeHeadsApi';
import { expenseHeadsApi } from './features/api/expense-heads/expenseHeadsApi';
import { feeHeadsApi } from './features/api/fee-heads/feeHeadsApi';
import { feePackagesApi } from './features/api/fee-packages/feePackagesApi';
import { incomeItemsApi } from './features/api/income-items/incomeItemsApi';
import { expenseItemsApi } from './features/api/expense-items/expenseItemsApi';
import { waiversApi } from './features/api/waivers/waiversApi';
import { academicYearApi } from './features/api/academic-year/academicYearApi';
import { transactionBooksApi } from './features/api/transaction-books/transactionBooksApi';
import { feesNameApi } from './features/api/fees-name/feesName';
import { gfeeSubheadsApi } from './features/api/gfee-subheads/gfeeSubheadsApi';
import { feesApi } from './features/api/fees/feesApi';
import { studentFeesCurrentApi } from './features/api/studentFeesCurrentApi/studentFeesCurrentApi';
import { studentFeesPreviousApi } from './features/api/studentFeesPreviousApi/studentFeesPreviousApi';
import { deleteFeesApi } from './features/api/deleteFees/deleteFeesApi';
import { studentSubAttendanceApi } from './features/api/student-sub-attendance/studentSubAttendanceApi';
import { subjectAssignApi } from './features/api/subject-assign/subjectAssignApi';







export const store = configureStore({
  reducer: {
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
    .concat(studentSubAttendanceApi.middleware)
    .concat(subjectAssignApi.middleware)
    
});

// Enable refetchOnFocus/refetchOnReconnect behaviors
setupListeners(store.dispatch);