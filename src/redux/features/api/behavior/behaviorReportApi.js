import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Assuming your Django backend API is hosted at this base URL
const BASE_URL = 'https://demo.easydr.xyz/api';

// Helper function to get JWT token from localStorage or your preferred storage
const getToken = () => {
  return localStorage.getItem('token'); // Adjust based on your token storage method
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
    // GET: Fetch all behavior reports 
    getBehaviorReportApi: builder.query({
      query: () => '/behavior-report/create/',
      providesTags: ['behaviorReportApi'],
    }),

    // GET: Fetch behavior reports by exam ID
    getBehaviorReportByExam: builder.query({
      query: (examId) => `/behavior-report/create/exam/${examId}/`,
      providesTags: ['behaviorReportApi'],
    }),

    // GET: Fetch single behavior report by ID
    getBehaviorReportApiById: builder.query({
      query: (id) => `/behavior-report/create/${id}/`,
      providesTags: ['behaviorReportApi'],
    }),

    // POST: Create a new behavior report
    createBehaviorReportApi: builder.mutation({
      query: (behaviorReportApiData) => ({
        url: '/behavior-report/create/create/',
        method: 'POST',
        body: behaviorReportApiData,
      }),
      invalidatesTags: ['behaviorReportApi'],
    }),

    // PUT: Update an existing behavior report
    updateBehaviorReportApi: builder.mutation({
      query: ({ id, ...behaviorReportApiData }) => ({
        url: `/behavior-report/create/update/${id}/`,
        method: 'PUT',
        body: behaviorReportApiData,
      }),
      invalidatesTags: ['behaviorReportApi'],
    }),

    // DELETE: Delete a behavior report
    deleteBehaviorReportApi: builder.mutation({
      query: (id) => ({
        url: `/behavior-report/create/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['behaviorReportApi'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetBehaviorReportApiQuery,
  useGetBehaviorReportByExamQuery,
  useGetBehaviorReportApiByIdQuery,
  useCreateBehaviorReportApiMutation,
  useUpdateBehaviorReportApiMutation,
  useDeleteBehaviorReportApiMutation,
} = behaviorReportApi;