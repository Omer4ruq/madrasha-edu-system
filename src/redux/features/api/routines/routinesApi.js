import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import BASE_URL from '../../../../utilitis/apiConfig';


const getToken = () => {
  return localStorage.getItem('token');
};

export const routinesApi = createApi({
  reducerPath: 'routinesApi',
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
  tagTypes: ['Routines'],
  endpoints: (builder) => ({
    // GET: Fetch all routines
    getRoutines: builder.query({
      query: () => '/routines/',
      providesTags: ['Routines'],
    }),

    // GET: Fetch a single routine by ID
    getRoutineById: builder.query({
      query: (id) => `/routines/${id}/`,
      providesTags: ['Routines'],
    }),

    // POST: Create a new routine
    createRoutine: builder.mutation({
      query: (routineData) => ({
        url: '/routines/',
        method: 'POST',
        body: routineData,
      }),
      invalidatesTags: ['Routines'],
    }),

    // PUT: Update an existing routine
    updateRoutine: builder.mutation({
      query: ({ id, ...routineData }) => ({
        url: `/routines/${id}/`,
        method: 'PUT',
        body: routineData,
      }),
      invalidatesTags: ['Routines'],
    }),

    // PATCH: Partially update routine
    patchRoutine: builder.mutation({
      query: ({ id, ...routineData }) => ({
        url: `/routines/${id}/`,
        method: 'PATCH',
        body: routineData,
      }),
      invalidatesTags: ['Routines'],
    }),

    // DELETE: Delete a routine
    deleteRoutine: builder.mutation({
      query: (id) => ({
        url: `/routines/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Routines'],
    }),
  }),
});

export const {
  useGetRoutinesQuery,
  useGetRoutineByIdQuery,
  useCreateRoutineMutation,
  useUpdateRoutineMutation,
  usePatchRoutineMutation,
  useDeleteRoutineMutation,
} = routinesApi;