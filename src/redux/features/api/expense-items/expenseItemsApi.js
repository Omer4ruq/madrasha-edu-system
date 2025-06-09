import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Assuming your Django backend API is hosted at this base URL
const BASE_URL = 'https://demo.easydr.xyz/api';

// Helper function to get JWT token from localStorage or your preferred storage
const getToken = () => {
  return localStorage.getItem('token'); // Adjust based on your token storage method
};

export const expenseItemsApi = createApi({
  reducerPath: 'expenseItemsApi',
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
  tagTypes: ['ExpenseItems'],
  endpoints: (builder) => ({
    // GET: Fetch all expense items
    getExpenseItems: builder.query({
      query: () => '/expense-items/',
      providesTags: ['ExpenseItems'],
    }),

    // GET: Fetch single expense item by ID
    getExpenseItemById: builder.query({
      query: (id) => `/expense-items/${id}/`,
      providesTags: ['ExpenseItems'],
    }),

    // POST: Create a new expense item
    createExpenseItem: builder.mutation({
      query: (expenseItemData) => ({
        url: '/expense-items/',
        method: 'POST',
        body: expenseItemData,
      }),
      invalidatesTags: ['ExpenseItems'],
    }),

    // PUT: Update an existing expense item
    updateExpenseItem: builder.mutation({
      query: ({ id, ...expenseItemData }) => ({
        url: `/expense-items/${id}/`,
        method: 'PUT',
        body: expenseItemData,
      }),
      invalidatesTags: ['ExpenseItems'],
    }),

    // DELETE: Delete an expense item
    deleteExpenseItem: builder.mutation({
      query: (id) => ({
        url: `/expense-items/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ExpenseItems'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetExpenseItemsQuery,
  useGetExpenseItemByIdQuery,
  useCreateExpenseItemMutation,
  useUpdateExpenseItemMutation,
  useDeleteExpenseItemMutation,
} = expenseItemsApi;