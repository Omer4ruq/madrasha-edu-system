import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = 'https://demo.easydr.xyz/api';

const getToken = () => {
  return localStorage.getItem('token');
};

export const expenseItemsApi = createApi({
  reducerPath: 'expenseItemsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { endpoint }) => {
      const token = getToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      if (endpoint !== 'createExpenseItem' && endpoint !== 'updateExpenseItem') {
        headers.set('Content-Type', 'application/json');
      }
      return headers;
    },
  }),
  tagTypes: ['ExpenseItems'],
  endpoints: (builder) => ({
    getExpenseItems: builder.query({
      query: (page = 1) => `/expense-items/?page=${page}`,
      providesTags: ['ExpenseItems'],
      transformResponse: (response) => {
        return {
          items: Array.isArray(response.results) ? response.results : [],
          count: response.count || 0,
          next: response.next || null,
          previous: response.previous || null,
        };
      },
    }),
    getExpenseItemById: builder.query({
      query: (id) => `/expense-items/${id}/`,
      providesTags: ['ExpenseItems'],
    }),
    createExpenseItem: builder.mutation({
      query: (expenseItemData) => {
        const formData = new FormData();
        Object.entries(expenseItemData).forEach(([key, value]) => {
          if (key === 'attach_doc' && value instanceof File) {
            formData.append(key, value);
          } else if (value !== null && value !== undefined) {
            if (['expensetype_id', 'fund_id', 'transaction_book_id', 'transaction_number', 'academic_year', 'created_by', 'updated_by'].includes(key)) {
              formData.append(key, parseInt(value));
            } else if (key === 'amount') {
              formData.append(key, parseFloat(value));
            } else {
              formData.append(key, value);
            }
          }
        });
        return {
          url: '/expense-items/',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['ExpenseItems'],
    }),
    updateExpenseItem: builder.mutation({
      query: ({ id, ...expenseItemData }) => {
        const formData = new FormData();
        Object.entries(expenseItemData).forEach(([key, value]) => {
          if (key === 'attach_doc' && value instanceof File) {
            formData.append(key, value);
          } else if (value !== null && value !== undefined) {
            if (['expensetype_id', 'fund_id', 'transaction_book_id', 'transaction_number', 'academic_year', 'created_by', 'updated_by'].includes(key)) {
              formData.append(key, parseInt(value));
            } else if (key === 'amount') {
              formData.append(key, parseFloat(value));
            } else {
              formData.append(key, value);
            }
          }
        });
        return {
          url: `/expense-items/${id}/`,
          method: 'PUT',
          body: formData,
        };
      },
      invalidatesTags: ['ExpenseItems'],
    }),
    deleteExpenseItem: builder.mutation({
      query: (id) => ({
        url: `/expense-items/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ExpenseItems'],
    }),
  }),
});

export const {
  useGetExpenseItemsQuery,
  useGetExpenseItemByIdQuery,
  useCreateExpenseItemMutation,
  useUpdateExpenseItemMutation,
  useDeleteExpenseItemMutation,
} = expenseItemsApi;