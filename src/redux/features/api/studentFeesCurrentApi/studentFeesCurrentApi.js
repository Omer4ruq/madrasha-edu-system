import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = 'https://demo.easydr.xyz/api';

const getToken = () => {
  return localStorage.getItem('token');
};

export const studentFeesCurrentApi = createApi({
  reducerPath: 'studentFeesCurrentApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      const token = getToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['StudentFeesCurrent'],
  endpoints: (builder) => ({
    // GET: Fetch current fees for a specific student
    getStudentCurrentFees: builder.query({
      query: (id) => `/student-fees/${id}/fees/current/`,
      providesTags: ['StudentFeesCurrent'],
    }),
  }),
});

export const {
  useGetStudentCurrentFeesQuery,
} = studentFeesCurrentApi;