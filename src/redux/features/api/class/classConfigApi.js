import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Assuming your Django backend API is hosted at this base URL
const BASE_URL = 'https://demo.easydr.xyz/api';

// Helper function to get JWT token from localStorage or your preferred storage
const getToken = () => {
  return localStorage.getItem('token'); // Adjust based on your token storage method
};

export const classConfigApi = createApi({
  reducerPath: 'classConfigApi',
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
  tagTypes: ['classConfigApi'],
  endpoints: (builder) => ({
    // GET: Fetch all classConfigApis /
    getclassConfigApi: builder.query({
      query: () => '/class-config/',
      providesTags: ['classConfigApi'],
    }),

    // GET: Fetch single classConfigApi by ID
    getClassConfigApiById: builder.query({
      query: (id) => `/class-config/${id}/`,
      providesTags: ['classConfigApi'],
    }),

    // POST: Create a new classConfigApi
    createClassConfigApi: builder.mutation({
      query: (classConfigApiData) => ({
        url: '/class-config/',
        method: 'POST',
        body: classConfigApiData,
      }),
      invalidatesTags: ['classConfigApi'],
    }),

    // PUT: Update an existing classConfigApi
    updateClassConfigApi: builder.mutation({
      query: ({ id, ...classConfigApiData }) => ({
        url: `/class-config/${id}/`,
        method: 'PUT',
        body: classConfigApiData,
      }),
      invalidatesTags: ['classConfigApi'],
    }),

    // DELETE: Delete an classConfigApi
    deleteClassConfigApi: builder.mutation({
      query: (id) => ({
        url: `/class-config/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['classConfigApi'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetclassConfigApiQuery,
  useGetClassConfigApiByIdQuery,
  useCreateClassConfigApiMutation,
  useUpdateClassConfigApiMutation,
  useDeleteClassConfigApiMutation,
} = classConfigApi;