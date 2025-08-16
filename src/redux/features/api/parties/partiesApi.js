import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import BASE_URL from '../../../../utilitis/apiConfig';

const getToken = () => localStorage.getItem('token');

export const partiesApi = createApi({
  reducerPath: 'partiesApi',
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
  tagTypes: ['Parties'],
  endpoints: (builder) => ({
    // GET: Fetch all parties
    getParties: builder.query({
      query: () => '/parties/',
      providesTags: ['Parties'],
    }),

    // GET: Fetch a single party by ID
    getPartyById: builder.query({
      query: (id) => `/parties/${id}/`,
      providesTags: ['Parties'],
    }),

    // POST: Create a new party
    createParty: builder.mutation({
      query: (data) => ({
        url: '/parties/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Parties'],
    }),

    // PUT: Update an existing party
    updateParty: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/parties/${id}/`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Parties'],
    }),

    // PATCH: Partially update a party
    patchParty: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/parties/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Parties'],
    }),

    // DELETE: Delete a party
    deleteParty: builder.mutation({
      query: (id) => ({
        url: `/parties/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Parties'],
    }),
  }),
});

export const {
  useGetPartiesQuery,
  useGetPartyByIdQuery,
  useCreatePartyMutation,
  useUpdatePartyMutation,
  usePatchPartyMutation,
  useDeletePartyMutation,
} = partiesApi;