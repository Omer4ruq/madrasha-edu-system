import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import BASE_URL from '../../../../utilitis/apiConfig';

const getToken = () => {
  return localStorage.getItem('token'); 
};

export const eventApi = createApi({
  reducerPath: 'eventApi',
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
  tagTypes: ['eventApi'],
  endpoints: (builder) => ({
    // GET: Fetch all events
    getEvents: builder.query({
      query: () => '/events/',
      providesTags: ['eventApi'],
    }),

    // GET: Fetch single event by ID
    getEventById: builder.query({
      query: (id) => `/events/${id}/`,
      providesTags: ['eventApi'],
    }),

    // POST: Create a new event
    createEvent: builder.mutation({
      query: (eventData) => ({
        url: '/events/',
        method: 'POST',
        body: eventData,
      }),
      invalidatesTags: ['eventApi'],
    }),

    // PUT: Update an existing event
    updateEvent: builder.mutation({
      query: ({ id, ...eventData }) => ({
        url: `/events/${id}/`,
        method: 'PUT',
        body: eventData,
      }),
      invalidatesTags: ['eventApi'],
    }),

    // PATCH: Partially update an existing event
    patchEvent: builder.mutation({
      query: ({ id, ...eventData }) => ({
        url: `/events/${id}/`,
        method: 'PATCH',
        body: eventData,
      }),
      invalidatesTags: ['eventApi'],
    }),

    // DELETE: Delete an event
    deleteEvent: builder.mutation({
      query: (id) => ({
        url: `/events/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['eventApi'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetEventsQuery,
  useGetEventByIdQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  usePatchEventMutation,
  useDeleteEventMutation,
} = eventApi;