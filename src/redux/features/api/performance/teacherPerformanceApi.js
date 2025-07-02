import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import BASE_URL from '../../../../utilitis/apiConfig';


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
      query: () => '/teacher-performances/',
      providesTags: ['teacherPerformanceApi'],
    }),
    getTeacherPerformanceApiById: builder.query({
      query: (id) => `/teacher-performances/${id}/`,
      providesTags: ['teacherPerformanceApi'],
    }),
    createTeacherPerformanceApi: builder.mutation({
      query: (teacherPerformanceApiData) => ({
        url: '/teacher-performances/',
        method: 'POST',
        body: teacherPerformanceApiData,
      }),
      invalidatesTags: ['teacherPerformanceApi'],
    }),
    updateTeacherPerformanceApi: builder.mutation({
      query: ({ id, ...teacherPerformanceApiData }) => ({
        url: `/teacher-performances/${id}/`,
        method: 'PUT',
        body: teacherPerformanceApiData,
      }),
      invalidatesTags: ['teacherPerformanceApi'],
    }),
    deleteTeacherPerformanceApi: builder.mutation({
      query: (id) => ({
        url: `/teacher-performances/${id}/`,
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