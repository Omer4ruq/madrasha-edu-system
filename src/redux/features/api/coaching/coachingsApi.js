import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = 'https://demo.easydr.xyz/api';

const getToken = () => localStorage.getItem('token');

export const coachingsApi = createApi({
  reducerPath: 'coachingsApi',
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
  tagTypes: ['Coachings'],
  endpoints: (builder) => ({
    // GET: Fetch all coachings
    getCoachings: builder.query({
      query: () => '/coachings/',
      providesTags: ['Coachings'],
    }),

    // GET: Fetch a single coaching by ID
    getCoachingById: builder.query({
      query: (id) => `/coachings/${id}/`,
      providesTags: ['Coachings'],
    }),

    // POST: Create a new coaching
    createCoaching: builder.mutation({
      query: (coachingData) => ({
        url: '/coachings/',
        method: 'POST',
        body: coachingData,
      }),
      invalidatesTags: ['Coachings'],
    }),

    // PUT: Update an existing coaching
    updateCoaching: builder.mutation({
      query: ({ id, ...coachingData }) => ({
        url: `/coachings/${id}/`,
        method: 'PUT',
        body: coachingData,
      }),
      invalidatesTags: ['Coachings'],
    }),

    // PATCH: Partially update a coaching
    patchCoaching: builder.mutation({
      query: ({ id, ...coachingData }) => ({
        url: `/coachings/${id}/`,
        method: 'PATCH',
        body: coachingData,
      }),
      invalidatesTags: ['Coachings'],
    }),

    // DELETE: Delete a coaching
    deleteCoaching: builder.mutation({
      query: (id) => ({
        url: `/coachings/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Coachings'],
    }),
  }),
});

export const {
  useGetCoachingsQuery,
  useGetCoachingByIdQuery,
  useCreateCoachingMutation,
  useUpdateCoachingMutation,
  usePatchCoachingMutation,
  useDeleteCoachingMutation,
} = coachingsApi;