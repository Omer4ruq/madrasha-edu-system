import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import BASE_URL from '../../../../utilitis/apiConfig';


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
      query: ({ page = 1 } = {}) => `/expense-items/?page=${page}`,
      providesTags: ['ExpenseItems'],
      transformResponse: (response) => {
        return {
          count: response.count || 0,
          next: response.next || null,
          previous: response.previous || null,
          results: Array.isArray(response.results) ? response.results : [],
        };
      },
    }),

    // ✅ New: Fetch all paginated data like incomeItemsApi
    getAllExpenseItems: builder.query({
      async queryFn(_arg, { dispatch }, _extraOptions, fetchWithBQ) {
        let allResults = [];
        let nextPage = `${BASE_URL}/expense-items/?page=1`;
        let page = 1;

        while (nextPage) {
          try {
            const response = await fetchWithBQ(`/expense-items/?page=${page}`);
            if (response.error) {
              throw response.error;
            }
            const data = response.data;
            allResults = [...allResults, ...data.results];
            nextPage = data.next;
            page += 1;
          } catch (error) {
            return { error };
          }
        }

        return {
          data: {
            count: allResults.length,
            next: null,
            previous: null,
            results: allResults,
          },
        };
      },
      providesTags: ['ExpenseItems'],
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
            if (
              ['expensetype_id', 'fund_id', 'transaction_book_id', 'transaction_number', 'academic_year', 'created_by', 'updated_by'].includes(key)
            ) {
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
            if (
              ['expensetype_id', 'fund_id', 'transaction_book_id', 'transaction_number', 'academic_year', 'created_by', 'updated_by'].includes(key)
            ) {
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
  useGetAllExpenseItemsQuery, 
  useGetExpenseItemByIdQuery,
  useCreateExpenseItemMutation,
  useUpdateExpenseItemMutation,
  useDeleteExpenseItemMutation,
} = expenseItemsApi;
