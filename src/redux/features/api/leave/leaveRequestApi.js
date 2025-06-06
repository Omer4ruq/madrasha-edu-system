import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Assuming your Django backend API is hosted at this base URL
const BASE_URL = 'https://demo.easydr.xyz/api';

// Helper function to get JWT token from localStorage or your preferred storage
const getToken = () => {
  return localStorage.getItem('token'); // Adjust based on your token storage method
};

export const leaveRequestApi = createApi({
  reducerPath: 'leaveRequestApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      const token = getToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      // Let FormData set Content-Type automatically
      return headers;
    },
  }),
  tagTypes: ['leaveRequestApi'],
  endpoints: (builder) => ({
    // GET: Fetch all leaveRequestApis
    getLeaveRequestApi: builder.query({
      query: () => '/leave-requests/',
      providesTags: ['leaveRequestApi'],
    }),

    // GET: Fetch single leaveRequestApi by ID
    getLeaveRequestApiById: builder.query({
      query: (id) => `/leave-requests/${id}/`,
      providesTags: ['leaveRequestApi'],
    }),

    // POST: Create a new leaveRequestApi
    createLeaveRequestApi: builder.mutation({
      query: (formData) => ({
        url: '/leave-requests/',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['leaveRequestApi'],
    }),

    // PUT: Update an existing leaveRequestApi
    updateLeaveRequestApi: builder.mutation({
      query: ({ id, ...formData }) => ({
        url: `/leave-requests/${id}/`,
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: ['leaveRequestApi'],
    }),

    // DELETE: Delete an leaveRequestApi 
    deleteLeaveRequestApi: builder.mutation({
      query: (id) => ({
        url: `/leave-requests/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['leaveRequestApi'],
    }),
  }),
});

// Export hooks for usage in components 
export const {
  useGetLeaveRequestApiQuery,
  useGetLeaveRequestApiByIdQuery,
  useCreateLeaveRequestApiMutation,
  useUpdateLeaveRequestApiMutation,
  useDeleteLeaveRequestApiMutation,
} = leaveRequestApi;