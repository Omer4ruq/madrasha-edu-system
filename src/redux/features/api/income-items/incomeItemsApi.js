import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Assuming your Django backend API is hosted at this base URL
const BASE_URL = 'https://demo.easydr.xyz/api';

// Helper function to get JWT token from localStorage or your preferred storage
const getToken = () => {
  return localStorage.getItem('token'); // Adjust based on your token storage method
};

export const incomeItemsApi = createApi({
  reducerPath: 'incomeItemsApi',
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
  tagTypes: ['IncomeItems'],
  endpoints: (builder) => ({
    // GET: Fetch all income items
    getIncomeItems: builder.query({
      query: () => '/income-items/',
      providesTags: ['IncomeItems'],
    }),

    // GET: Fetch single income item by ID
    getIncomeItemById: builder.query({
      query: (id) => `/income-items/${id}/`,
      providesTags: ['IncomeItems'],
    }),

    // POST: Create a new income item
    createIncomeItem: builder.mutation({
      query: (incomeItemData) => ({
        url: '/income-items/',
        method: 'POST',
        body: incomeItemData,
      }),
      invalidatesTags: ['IncomeItems'],
    }),

    // PUT: Update an existing income item
    updateIncomeItem: builder.mutation({
      query: ({ id, ...incomeItemData }) => ({
        url: `/income-items/${id}/`,
        method: 'PUT',
        body: incomeItemData,
      }),
      invalidatesTags: ['IncomeItems'],
    }),

    // DELETE: Delete an income item
    deleteIncomeItem: builder.mutation({
      query: (id) => ({
        url: `/income-items/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['IncomeItems'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetIncomeItemsQuery,
  useGetIncomeItemByIdQuery,
  useCreateIncomeItemMutation,
  useUpdateIncomeItemMutation,
  useDeleteIncomeItemMutation,
} = incomeItemsApi;