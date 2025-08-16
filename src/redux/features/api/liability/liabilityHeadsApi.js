import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import BASE_URL from '../../../../utilitis/apiConfig';

const getToken = () => localStorage.getItem('token');

export const liabilityHeadsApi = createApi({
  reducerPath: 'liabilityHeadsApi',
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
  tagTypes: ['LiabilityHeads'],
  endpoints: (builder) => ({
    // GET: Fetch all liability heads
    getLiabilityHeads: builder.query({
      query: () => '/liability-heads/',
      providesTags: ['LiabilityHeads'],
    }),

    // GET: Fetch a single liability head by ID
    getLiabilityHeadById: builder.query({
      query: (id) => `/liability-heads/${id}`,
      providesTags: ['LiabilityHeads'],
    }),

    // POST: Create a new liability head
    createLiabilityHead: builder.mutation({
      query: (data) => ({
        url: '/liability-heads/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['LiabilityHeads'],
    }),

    // PUT: Update an existing liability head
    updateLiabilityHead: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/liability-heads/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['LiabilityHeads'],
    }),

    // PATCH: Partially update a liability head
    patchLiabilityHead: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/liability-heads/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['LiabilityHeads'],
    }),

    // DELETE: Delete a liability head
    deleteLiabilityHead: builder.mutation({
      query: (id) => ({
        url: `/liability-heads/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['LiabilityHeads'],
    }),
  }),
});

export const {
  useGetLiabilityHeadsQuery,
  useGetLiabilityHeadByIdQuery,
  useCreateLiabilityHeadMutation,
  useUpdateLiabilityHeadMutation,
  usePatchLiabilityHeadMutation,
  useDeleteLiabilityHeadMutation,
} = liabilityHeadsApi;