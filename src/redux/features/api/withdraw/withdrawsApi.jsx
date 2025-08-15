import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import BASE_URL from '../../../../utilitis/apiConfig';

const getToken = () => localStorage.getItem('token');

export const withdrawsApi = createApi({
  reducerPath: 'withdrawsApi',
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
  tagTypes: ['Withdraws'],
  endpoints: (builder) => ({
    // GET: Fetch all withdraws
    getWithdraws: builder.query({
      query: () => '/withdraws/',
      providesTags: ['Withdraws'],
    }),

    // GET: Fetch a single withdraw by ID
    getWithdrawById: builder.query({
      query: (id) => `/withdraws/${id}/`,
      providesTags: ['Withdraws'],
    }),

    // POST: Create a new withdraw
    createWithdraw: builder.mutation({
      query: (data) => ({
        url: '/withdraws/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Withdraws'],
    }),

    // PUT: Update an existing withdraw
    updateWithdraw: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/withdraws/${id}/`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Withdraws'],
    }),

    // PATCH: Partially update a withdraw
    patchWithdraw: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/withdraws/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Withdraws'],
    }),

    // DELETE: Delete a withdraw
    deleteWithdraw: builder.mutation({
      query: (id) => ({
        url: `/withdraws/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Withdraws'],
    }),
  }),
});

export const {
  useGetWithdrawsQuery,
  useGetWithdrawByIdQuery,
  useCreateWithdrawMutation,
  useUpdateWithdrawMutation,
  usePatchWithdrawMutation,
  useDeleteWithdrawMutation,
} = withdrawsApi;