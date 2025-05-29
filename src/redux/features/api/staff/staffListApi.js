import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Assuming your Django backend API is hosted at this base URL
const BASE_URL = 'https://demo.easydr.xyz/api';

// Helper function to get JWT token from localStorage or your preferred storage
const getToken = () => {
  return localStorage.getItem('token'); // Adjust based on your token storage method
};

export const staffListApi = createApi({
  reducerPath: 'staffListApi',
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
  tagTypes: ['staffListApI'],
  endpoints: (builder) => ({
    // GET: Fetch all staffListApIs
    getStaffListApI: builder.query({
      query: () => '/staff-list/',
      providesTags: ['staffListApI'],
    }),

    // GET: Fetch single staffListApI by ID
    getStaffListApIById: builder.query({
      query: (id) => `/staff-list/${id}/`,
      providesTags: ['staffListApI'],
    }),

    // POST: Create a new staffListApI
    createStaffListApI: builder.mutation({
      query: (staffListApIData) => ({
        url: '/staff-list/',
        method: 'POST',
        body: staffListApIData,
      }),
      invalidatesTags: ['staffListApI'],
    }),

    // PUT: Update an existing staffListApI
    updateStaffListApI: builder.mutation({
      query: ({ id, ...staffListApIData }) => ({
        url: `/staff-list/${id}/`,
        method: 'PUT',
        body: staffListApIData,
      }),
      invalidatesTags: ['staffListApI'],
    }),

    // DELETE: Delete an staffListApI
    deleteStaffListApI: builder.mutation({
      query: (id) => ({
        url: `/staff-list/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['staffListApI'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetStaffListApIQuery,
  useGetStaffListApIByIdQuery,
  useCreateStaffListApIMutation,
  useUpdateStaffListApIMutation,
  useDeleteStaffListApIMutation,
} = staffListApi;