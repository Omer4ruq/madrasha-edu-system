import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = 'https://demo.easydr.xyz/api';

const getToken = () => {
  return localStorage.getItem('token');
};

export const teacherPerformanceApi = createApi({
  reducerPath: 'teacherPerformanceApi',
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
  tagTypes: ['teacherPerformanceApi'],
  endpoints: (builder) => ({
    getTeacherPerformanceApi: builder.query({
      query: () => '/performance-names/',
      providesTags: ['teacherPerformanceApi'],
    }),
    getTeacherPerformanceApiById: builder.query({
      query: (id) => `/performance-names/${id}/`,
      providesTags: ['teacherPerformanceApi'],
    }),
    createTeacherPerformanceApi: builder.mutation({
      query: (teacherPerformanceApiData) => ({
        url: '/performance-names/',
        method: 'POST',
        body: teacherPerformanceApiData,
      }),
      invalidatesTags: ['teacherPerformanceApi'],
    }),
    updateTeacherPerformanceApi: builder.mutation({
      query: ({ id, ...teacherPerformanceApiData }) => ({
        url: `/performance-names/${id}/`,
        method: 'PUT',
        body: teacherPerformanceApiData,
      }),
      invalidatesTags: ['teacherPerformanceApi'],
    }),
    deleteTeacherPerformanceApi: builder.mutation({
      query: (id) => ({
        url: `/performance-names/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['teacherPerformanceApi'],
    }),
  }),
});

export const {
  useGetTeacherPerformanceApiQuery,
  useGetTeacherPerformanceApiByIdQuery,
  useCreateTeacherPerformanceApiMutation,
  useUpdateTeacherPerformanceApiMutation,
  useDeleteTeacherPerformanceApiMutation,
} = teacherPerformanceApi;