import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = 'https://demo.easydr.xyz/api';

const getToken = () => {
  return localStorage.getItem('token');
};

export const behaviorReportApi = createApi({
  reducerPath: 'behaviorReportApi',
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
  tagTypes: ['behaviorReportApi'],
  endpoints: (builder) => ({
    getBehaviorReportApi: builder.query({
      query: () => '/behavior-report/create/',
      providesTags: ['behaviorReportApi'],
    }),
    getBehaviorReportApiById: builder.query({
      query: (id) => `/behavior-report/create/${id}/`,
      providesTags: ['behaviorReportApi'],
    }),
    createBehaviorReportApi: builder.mutation({
      query: (behaviorReportApiData) => ({
        url: '/behavior-report/create/',
        method: 'POST',
        body: behaviorReportApiData,
      }),
      invalidatesTags: ['behaviorReportApi'],
    }),
    updateBehaviorReportApi: builder.mutation({
      query: ({ id, ...behaviorReportApiData }) => ({
        url: `/behavior-report/update/${id}/`,
        method: 'PUT',
        body: behaviorReportApiData,
      }),
      invalidatesTags: ['behaviorReportApi'],
    }),
    deleteBehaviorReportApi: builder.mutation({
      query: (id) => ({
        url: `/behavior-report/create/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['behaviorReportApi'],
    }),
  }),
});

export const {
  useGetBehaviorReportApiQuery,
  useGetBehaviorReportApiByIdQuery,
  useCreateBehaviorReportApiMutation,
  useUpdateBehaviorReportApiMutation,
  useDeleteBehaviorReportApiMutation,
} = behaviorReportApi;