import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Assuming your Django backend API is hosted at this base URL
const BASE_URL = 'https://demo.easydr.xyz/api';

// Helper function to get JWT token from localStorage or your preferred storage
const getToken = () => {
  return localStorage.getItem('token'); // Adjust based on your token storage method
};

export const behaviorMarksApi = createApi({
  reducerPath: 'behaviorMarksApi',
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
  tagTypes: ['behaviorMarksApi'],
  endpoints: (builder) => ({
    // GET: Fetch all behaviorMarksApis
    getBehaviorMarksApi: builder.query({
      query: () => '/behavior-marks/',
      providesTags: ['behaviorMarksApi'],
    }),

    // GET: Fetch single behaviorMarksApi by ID
    getBehaviorMarksApiById: builder.query({
      query: (id) => `/behavior-marks/${id}/`,
      providesTags: ['behaviorMarksApi'],
    }),

    // POST: Create a new behaviorMarksApi
    createBehaviorMarksApi: builder.mutation({
      query: (behaviorMarksApiData) => ({
        url: '/behavior-marks/',
        method: 'POST',
        body: behaviorMarksApiData,
      }),
      invalidatesTags: ['behaviorMarksApi'],
    }),

    // PUT: Update an existing behaviorMarksApi
    updateBehaviorMarksApi: builder.mutation({
      query: ({ id, ...behaviorMarksApiData }) => ({
        url: `/behavior-marks/${id}/`,
        method: 'PUT',
        body: behaviorMarksApiData,
      }),
      invalidatesTags: ['behaviorMarksApi'],
    }),

    // DELETE: Delete an behaviorMarksApi
    deleteBehaviorMarksApi: builder.mutation({
      query: (id) => ({
        url: `/behavior-marks/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['behaviorMarksApi'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetBehaviorMarksApiQuery,
  useGetBehaviorMarksApiByIdQuery,
  useCreateBehaviorMarksApiMutation,
  useUpdateBehaviorMarksApiMutation,
  useDeleteBehaviorMarksApiMutation,
} = behaviorMarksApi;