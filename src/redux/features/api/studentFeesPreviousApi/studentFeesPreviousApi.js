import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = 'https://demo.easydr.xyz/api';

const getToken = () => {
  return localStorage.getItem('token');
};

export const studentFeesPreviousApi = createApi({
  reducerPath: 'studentFeesPreviousApi',
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
  tagTypes: ['StudentFeesPrevious'],
  endpoints: (builder) => ({
    // GET: Fetch previous fees for a specific student
    getStudentPreviousFees: builder.query({
      query: (id) => `/student-fees/${id}/fees/previous/`,
      providesTags: ['StudentFeesPrevious'],
    }),
  }),
});

export const {
  useGetStudentPreviousFeesQuery,
} = studentFeesPreviousApi;