import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import BASE_URL from '../../../../utilitis/apiConfig';


const getToken = () => {
  return localStorage.getItem('token'); 
};

export const expenseHeadsApi = createApi({
  reducerPath: 'expenseHeadsApi',
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
  tagTypes: ['ExpenseHeads'],
  endpoints: (builder) => ({
    // GET: Fetch all expense heads
    getExpenseHeads: builder.query({
      query: () => '/expense-heads/',
      providesTags: ['ExpenseHeads'],
    }),

    // GET: Fetch single expense head by ID
    getExpenseHeadById: builder.query({
      query: (id) => `/expense-heads/${id}/`,
      providesTags: ['ExpenseHeads'],
    }),

    // POST: Create a new expense head
    createExpenseHead: builder.mutation({
      query: (expenseHeadData) => ({
        url: '/expense-heads/',
        method: 'POST',
        body: expenseHeadData,
      }),
      invalidatesTags: ['ExpenseHeads'],
    }),

    // PUT: Update an existing expense head
    updateExpenseHead: builder.mutation({
      query: ({ id, ...expenseHeadData }) => ({
        url: `/expense-heads/${id}/`,
        method: 'PUT',
        body: expenseHeadData,
      }),
      invalidatesTags: ['ExpenseHeads'],
    }),

    // DELETE: Delete an expense head
    deleteExpenseHead: builder.mutation({
      query: (id) => ({
        url: `/expense-heads/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ExpenseHeads'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetExpenseHeadsQuery,
  useGetExpenseHeadByIdQuery,
  useCreateExpenseHeadMutation,
  useUpdateExpenseHeadMutation,
  useDeleteExpenseHeadMutation,
} = expenseHeadsApi;