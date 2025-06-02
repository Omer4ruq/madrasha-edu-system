
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
    // // GET: Fetch all behaviorReportApis
    // getBehaviorReportApi: builder.query({
    //   query: () => '/behavior-report/',
    //   providesTags: ['behaviorReportApi'],
    // }),

    // // GET: Fetch single behaviorReportApi by ID
    // getBehaviorReportApiById: builder.query({
    //   query: (id) => `/behavior-report/${id}/`,
    //   providesTags: ['behaviorReportApi'],
    // }),

    // POST: Create a new behaviorReportApi
    createBehaviorReportApi: builder.mutation({
      query: (behaviorReportApiData) => ({
        url: '/behavior-report/create/',
        method: 'POST',
        body: behaviorReportApiData,
      }),
      invalidatesTags: ['behaviorReportApi'],
    }),

    // PUT: Update an existing behaviorReportApi
    updateBehaviorReportApi: builder.mutation({
      query: ({ id, ...behaviorReportApiData }) => ({
        url: `/behavior-report/update/${id}/`,
        method: 'PUT',
        body: behaviorReportApiData,
      }),
      invalidatesTags: ['behaviorReportApi'],
    }),

    // // DELETE: Delete an behaviorReportApi
    // deleteBehaviorReportApi: builder.mutation({
    //   query: (id) => ({
    //     url: `/behavior-report/${id}/`,
    //     method: 'DELETE',
    //   }),
    //   invalidatesTags: ['behaviorReportApi'],
    // }),
  }),
});

// Export hooks for usage in components
export const {
//   useGetBehaviorReportApiQuery,
//   useGetBehaviorReportApiByIdQuery,
  useCreateBehaviorReportApiMutation,
  useUpdateBehaviorReportApiMutation,
//   useDeleteBehaviorReportApiMutation,
} = behaviorReportApi;