import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import BASE_URL from '../../../../utilitis/apiConfig';

const getToken = () => localStorage.getItem('token');

export const liabilityEntriesApi = createApi({
  reducerPath: 'liabilityEntriesApi',
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
  tagTypes: ['LiabilityEntries'],
  endpoints: (builder) => ({
    // GET: Fetch all liability entries
    getLiabilityEntries: builder.query({
      query: () => '/liability-entries/',
      providesTags: ['LiabilityEntries'],
    }),

    // GET: Fetch a single liability entry by ID
    getLiabilityEntryById: builder.query({
      query: (id) => `/liability-entries/${id}/`,
      providesTags: ['LiabilityEntries'],
    }),

    // POST: Create a new liability entry
    createLiabilityEntry: builder.mutation({
      query: (data) => ({
        url: '/liability-entries/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['LiabilityEntries'],
    }),

    // PUT: Update an existing liability entry
    updateLiabilityEntry: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/liability-entries/${id}/`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['LiabilityEntries'],
    }),

    // PATCH: Partially update a liability entry
    patchLiabilityEntry: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/liability-entries/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['LiabilityEntries'],
    }),

    // DELETE: Delete a liability entry
    deleteLiabilityEntry: builder.mutation({
      query: (id) => ({
        url: `/liability-entries/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['LiabilityEntries'],
    }),
  }),
});

export const {
  useGetLiabilityEntriesQuery,
  useGetLiabilityEntryByIdQuery,
  useCreateLiabilityEntryMutation,
  useUpdateLiabilityEntryMutation,
  usePatchLiabilityEntryMutation,
  useDeleteLiabilityEntryMutation,
} = liabilityEntriesApi;