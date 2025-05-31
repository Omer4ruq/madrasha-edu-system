import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Assuming your Django backend API is hosted at this base URL
const BASE_URL = 'https://demo.easydr.xyz/api';

// Helper function to get JWT token from localStorage or your preferred storage
const getToken = () => {
  return localStorage.getItem('token'); // Adjust based on your token storage method
};

export const leaveApi = createApi({
  reducerPath: 'leaveApi',
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
  tagTypes: ['leaveApi'],
  endpoints: (builder) => ({
    // GET: Fetch all leaveApis
    getLeaveApi: builder.query({
      query: () => '/leave-types/',
      providesTags: ['leaveApi'],
    }),

    // GET: Fetch single leaveApi by ID
    getLeaveApiById: builder.query({
      query: (id) => `/leave-types/${id}/`,
      providesTags: ['leaveApi'],
    }),

    // POST: Create a new leaveApi
    createLeaveApi: builder.mutation({
      query: (leaveApiData) => ({
        url: '/leave-types/',
        method: 'POST',
        body: leaveApiData,
      }),
      invalidatesTags: ['leaveApi'],
    }),

    // PUT: Update an existing leaveApi
    updateLeaveApi: builder.mutation({
      query: ({ id, ...leaveApiData }) => ({
        url: `/leave-types/${id}/`,
        method: 'PUT',
        body: leaveApiData,
      }),
      invalidatesTags: ['leaveApi'],
    }),

    // DELETE: Delete an leaveApi 
    deleteLeaveApi: builder.mutation({
      query: (id) => ({
        url: `/leave-types/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['leaveApi'],
    }),
  }),
});

// Export hooks for usage in components 
export const {
  useGetLeaveApiQuery,
  useGetLeaveApiByIdQuery,
  useCreateLeaveApiMutation,
  useUpdateLeaveApiMutation,
  useDeleteLeaveApiMutation,
} = leaveApi;