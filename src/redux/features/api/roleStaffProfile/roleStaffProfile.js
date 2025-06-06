// src/features/teachers/teacherApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = 'https://demo.easydr.xyz/api';

const getToken = () => {
  return localStorage.getItem('token');
};

export const roleStaffProfile = createApi({
  reducerPath: 'roleStaffProfile',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      const token = getToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Teachers'],
  endpoints: (builder) => ({
    // GET: Fetch teacher profiles
    getTeachers: builder.query({
      query: () => '/role-staff-profiles/?role__name=Teacher',
      providesTags: ['Teachers'],
    }),
  }),
});

export const { useGetTeachersQuery } = roleStaffProfile;