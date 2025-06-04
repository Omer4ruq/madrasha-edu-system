import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = 'https://demo.easydr.xyz/api';

const getToken = () => {
  return localStorage.getItem('token');
};

export const performanceApi = createApi({
  reducerPath: 'performanceApi',
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
  tagTypes: ['performanceApi'],
  endpoints: (builder) => ({
    getPerformanceApi: builder.query({
      query: () => '/performance-names/',
      providesTags: ['performanceApi'],
    }),
    getPerformanceApiById: builder.query({
      query: (id) => `/performance-names/${id}/`,
      providesTags: ['performanceApi'],
    }),
    createPerformanceApi: builder.mutation({
      query: (performanceApiData) => ({
        url: '/performance-names/',
        method: 'POST',
        body: performanceApiData,
      }),
      invalidatesTags: ['performanceApi'],
    }),
    updatePerformanceApi: builder.mutation({
      query: ({ id, ...performanceApiData }) => ({
        url: `/performance-names/${id}/`,
        method: 'PUT',
        body: performanceApiData,
      }),
      invalidatesTags: ['performanceApi'],
    }),
    deletePerformanceApi: builder.mutation({
      query: (id) => ({
        url: `/performance-names/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['performanceApi'],
    }),
  }),
});

export const {
  useGetPerformanceApiQuery,
  useGetPerformanceApiByIdQuery,
  useCreatePerformanceApiMutation,
  useUpdatePerformanceApiMutation,
  useDeletePerformanceApiMutation,
} = performanceApi;