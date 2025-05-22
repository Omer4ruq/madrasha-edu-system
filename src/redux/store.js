import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { instituteApi } from './features/api/instituteApi';
import { instituteTypeApi } from './features/api/instituteTypeApi';
import { studentClassApi } from './features/api/studentClassApi';
import { classListApi } from './features/api/classListApi';
import { studentSectionApi } from './features/api/studentSectionApi';
import { studentShiftApi } from './features/api/studentShiftApi';

export const store = configureStore({
  reducer: {
    [instituteApi.reducerPath]: instituteApi.reducer,
    [instituteTypeApi.reducerPath]: instituteTypeApi.reducer,
    [studentClassApi.reducerPath]: studentClassApi.reducer,
    [classListApi.reducerPath]: classListApi.reducer,
    [studentSectionApi.reducerPath]: studentSectionApi.reducer,
    [studentShiftApi.reducerPath]: studentShiftApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
    .concat(instituteApi.middleware)
    .concat(instituteTypeApi.middleware)
    .concat(studentClassApi.middleware)
    .concat(classListApi.middleware)
    .concat(studentSectionApi.middleware)
    .concat(studentShiftApi.middleware)
});

// Enable refetchOnFocus/refetchOnReconnect behaviors
setupListeners(store.dispatch);