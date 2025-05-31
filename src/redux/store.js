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
import { behaviorMarksApi } from './features/api/behavior/behaviorMarksApi';
import { mealsNameApi } from './features/api/meal/mealsNameApi';
import { mealItemApi } from './features/api/meal/mealItemApi';
import { mealSetupApi } from './features/api/meal/mealSetupApi';




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
    [staffListApi.reducerPath]: staffListApi.reducer,
    [behaviorTypeApi.reducerPath]: behaviorTypeApi.reducer,
    [behaviorMarksApi.reducerPath]: behaviorMarksApi.reducer,
    [mealsNameApi.reducerPath]: mealsNameApi.reducer,
    [mealItemApi.reducerPath]: mealItemApi.reducer,
    [mealSetupApi.reducerPath]: mealSetupApi.reducer,
    
    
    
   
    
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
    .concat(behaviorTypeApi.middleware)
    .concat(behaviorMarksApi.middleware)
    .concat(mealsNameApi.middleware)
    .concat(mealItemApi.middleware)
    .concat(mealSetupApi.middleware)
    
});

// Enable refetchOnFocus/refetchOnReconnect behaviors
setupListeners(store.dispatch);