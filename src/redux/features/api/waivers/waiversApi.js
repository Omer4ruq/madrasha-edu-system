import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Assuming your Django backend API is hosted at this base URL
const BASE_URL = 'https://demo.easydr.xyz/api';

// Helper function to get JWT token from localStorage or your preferred storage
const getToken = () => {
  return localStorage.getItem('token'); // Adjust based on your token storage method
};

export const waiversApi = createApi({
  reducerPath: 'waiversApi',
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
  tagTypes: ['Waivers'],
  endpoints: (builder) => ({
    // GET: Fetch all waivers
    getWaivers: builder.query({
      query: () => '/waivers/',
      providesTags: ['Waivers'],
    }),

    // GET: Fetch single waiver by ID
    getWaiverById: builder.query({
      query: (id) => `/waivers/${id}/`,
      providesTags: ['Waivers'],
    }),

    // POST: Create a new waiver
    createWaiver: builder.mutation({
      query: (waiverData) => ({
        url: '/waivers/',
        method: 'POST',
        body: waiverData,
      }),
      invalidatesTags: ['Waivers'],
    }),

    // PUT: Update an existing waiver
    updateWaiver: builder.mutation({
      query: ({ id, ...waiverData }) => ({
        url: `/waivers/${id}/`,
        method: 'PUT',
        body: waiverData,
      }),
      invalidatesTags: ['Waivers'],
    }),

    // DELETE: Delete a waiver
    deleteWaiver: builder.mutation({
      query: (id) => ({
        url: `/waivers/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Waivers'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetWaiversQuery,
  useGetWaiverByIdQuery,
  useCreateWaiverMutation,
  useUpdateWaiverMutation,
  useDeleteWaiverMutation,
} = waiversApi;