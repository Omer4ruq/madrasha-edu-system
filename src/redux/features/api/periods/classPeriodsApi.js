import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = 'https://demo.easydr.xyz/api';

const getToken = () => {
  return localStorage.getItem('token');
};

export const classPeriodsApi = createApi({
  reducerPath: 'classPeriodsApi',
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
  tagTypes: ['ClassPeriods'],
  endpoints: (builder) => ({
    // GET: Fetch all class periods
    getClassPeriods: builder.query({
      query: () => '/class-periods/',
      providesTags: ['ClassPeriods'],
    }),

    // GET: Fetch class periods by class ID
    getClassPeriodsByClassId: builder.query({
      query: (classId) => `/class-periods/?class_id=${classId}`,
      providesTags: ['ClassPeriods'],
    }),

    // GET: Fetch a single class period by ID
    getClassPeriodById: builder.query({
      query: (id) => `/class-periods/${id}/`,
      providesTags: ['ClassPeriods'],
    }),

    // POST: Create a new class period
    createClassPeriod: builder.mutation({
      query: (periodData) => ({
        url: '/class-periods/',
        method: 'POST',
        body: periodData,
      }),
      invalidatesTags: ['ClassPeriods'],
    }),

    // PUT: Update class period using full body (no ID in URL)
    updateClassPeriod: builder.mutation({
      query: (periodData) => ({
        url: '/class-periods/',
        method: 'PUT',
        body: periodData,
      }),
      invalidatesTags: ['ClassPeriods'],
    }),

    // PATCH: Partially update a class period by ID
    patchClassPeriod: builder.mutation({
      query: ({ id, ...periodData }) => ({
        url: `/class-periods/${id}/`,
        method: 'PATCH',
        body: periodData,
      }),
      invalidatesTags: ['ClassPeriods'],
    }),

    // DELETE: Delete a class period by ID
    deleteClassPeriod: builder.mutation({
      query: (id) => ({
        url: `/class-periods/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ClassPeriods'],
    }),
  }),
});

export const {
  useGetClassPeriodsQuery,
  useGetClassPeriodsByClassIdQuery,
  useGetClassPeriodByIdQuery,
  useCreateClassPeriodMutation,
  useUpdateClassPeriodMutation,
  usePatchClassPeriodMutation,
  useDeleteClassPeriodMutation,
} = classPeriodsApi;