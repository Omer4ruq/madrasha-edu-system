import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Assuming your Django backend API is hosted at this base URL
const BASE_URL = 'https://demo.easydr.xyz/api';

// Helper function to get JWT token from localStorage or your preferred storage
const getToken = () => {
  return localStorage.getItem('token'); // Adjust based on your token storage method
};

export const feesNameApi = createApi({
  reducerPath: 'feesNameApi',
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
  tagTypes: ['FeesName'],
  endpoints: (builder) => ({
    // GET: Fetch all fee names
    getFeesNames: builder.query({
      query: () => '/fees-names/',
      providesTags: ['FeesName'],
    }),

    // GET: Fetch single fee name by ID
    getFeesNameById: builder.query({
      query: (id) => `/fees-names/${id}/`,
      providesTags: ['FeesName'],
    }),

    // POST: Create a new fee name
    createFeesName: builder.mutation({
      query: (feesNameData) => ({
        url: '/fees-names/',
        method: 'POST',
        body: feesNameData,
      }),
      invalidatesTags: ['FeesName'],
    }),

    // PUT: Update an existing fee name
    updateFeesName: builder.mutation({
      query: ({ id, ...feesNameData }) => ({
        url: `/fees-names/${id}/`,
        method: 'PUT',
        body: feesNameData,
      }),
      invalidatesTags: ['FeesName'],
    }),

    // DELETE: Delete a fee name
    deleteFeesName: builder.mutation({
      query: (id) => ({
        url: `/fees-names/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['FeesName'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetFeesNamesQuery,
  useGetFeesNameByIdQuery,
  useCreateFeesNameMutation,
  useUpdateFeesNameMutation,
  useDeleteFeesNameMutation,
} = feesNameApi;