import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = 'https://demo.easydr.xyz/api';

const getToken = () => {
  return localStorage.getItem('token');
};

export const incomeItemsApi = createApi({
  reducerPath: 'incomeItemsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { endpoint }) => {
      const token = getToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      // Only set Content-Type to JSON for non-file-upload endpoints
      if (endpoint !== 'createIncomeItem' && endpoint !== 'updateIncomeItem') {
        headers.set('Content-Type', 'application/json');
      }
      return headers;
    },
  }),
  tagTypes: ['IncomeItems'],
  endpoints: (builder) => ({
    getIncomeItems: builder.query({
      query: () => '/income-items/',
      providesTags: ['IncomeItems'],
    }),
    getIncomeItemById: builder.query({
      query: (id) => `/income-items/${id}/`,
      providesTags: ['IncomeItems'],
    }),
  createIncomeItem: builder.mutation({
  query: (incomeItemData) => {
    const formData = new FormData();
    Object.entries(incomeItemData).forEach(([key, value]) => {
      if (key === 'attach_doc' && value instanceof File) {
        formData.append(key, value);
      } else if (value !== null && value !== undefined) {
        // Ensure numeric fields are sent as numbers
        if (['incometype_id', 'fund_id', 'transaction_book_id', 'transaction_number', 'academic_year', 'created_by', 'updated_by'].includes(key)) {
          formData.append(key, parseInt(value));
        } else if (key === 'amount') {
          formData.append(key, parseFloat(value));
        } else {
          formData.append(key, value);
        }
      }
    });
    return {
      url: '/income-items/',
      method: 'POST',
      body: formData,
    };
  },
  invalidatesTags: ['IncomeItems'],
}),
updateIncomeItem: builder.mutation({
  query: ({ id, ...incomeItemData }) => {
    const formData = new FormData();
    Object.entries(incomeItemData).forEach(([key, value]) => {
      if (key === 'attach_doc' && value instanceof File) {
        formData.append(key, value);
      } else if (value !== null && value !== undefined) {
        // Ensure numeric fields are sent as numbers
        if (['incometype_id', 'fund_id', 'transaction_book_id', 'transaction_number', 'academic_year', 'created_by', 'updated_by'].includes(key)) {
          formData.append(key, parseInt(value));
        } else if (key === 'amount') {
          formData.append(key, parseFloat(value));
        } else {
          formData.append(key, value);
        }
      }
    });
    return {
      url: `/income-items/${id}/`,
      method: 'PUT',
      body: formData,
    };
  },
  invalidatesTags: ['IncomeItems'],
}),
    deleteIncomeItem: builder.mutation({
      query: (id) => ({
        url: `/income-items/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['IncomeItems'],
    }),
  }),
});

export const {
  useGetIncomeItemsQuery,
  useGetIncomeItemByIdQuery,
  useCreateIncomeItemMutation,
  useUpdateIncomeItemMutation,
  useDeleteIncomeItemMutation,
} = incomeItemsApi;