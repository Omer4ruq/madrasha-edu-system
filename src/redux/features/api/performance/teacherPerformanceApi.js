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
      return headers;
    },
  }),
  tagTypes: ['TeacherPerformances'],
  endpoints: (builder) => ({
    // GET: Fetch all teacher performances
    getTeacherPerformances: builder.query({
      query: () => '/teacher-performances/',
      providesTags: ['TeacherPerformances'],
    }),
    // GET: Fetch a single teacher performance by ID
    getTeacherPerformanceById: builder.query({
      query: (id) => `/teacher-performances/${id}/`,
      providesTags: ['TeacherPerformances'],
    }),
    // POST: Create a new teacher performance
    createTeacherPerformance: builder.mutation({
      query: (performanceData) => ({
        url: '/teacher-performances/',
        method: 'POST',
        body: performanceData,
      }),
      invalidatesTags: ['TeacherPerformances'],
    }),
    // PUT: Update a teacher performance by ID
    updateTeacherPerformance: builder.mutation({
      query: ({ id, ...performanceData }) => ({
        url: `/teacher-performances/${id}/`,
        method: 'PUT',
        body: performanceData,
      }),
      invalidatesTags: ['TeacherPerformances'],
    }),
    // PATCH: Partially update a teacher performance by ID
    patchTeacherPerformance: builder.mutation({
      query: ({ id, ...performanceData }) => ({
        url: `/teacher-performances/${id}/`,
        method: 'PATCH',
        body: performanceData,
      }),
      invalidatesTags: ['TeacherPerformances'],
    }),
    // DELETE: Delete a teacher performance by ID
    deleteTeacherPerformance: builder.mutation({
      query: (id) => ({
        url: `/teacher-performances/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['TeacherPerformances'],
    }),
  }),
});

export const {
  useGetTeacherPerformancesQuery,
  useGetTeacherPerformanceByIdQuery,
  useCreateTeacherPerformanceMutation,
  useUpdateTeacherPerformanceMutation,
  usePatchTeacherPerformanceMutation,
  useDeleteTeacherPerformanceMutation,
} = teacherPerformanceApi;