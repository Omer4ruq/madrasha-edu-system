import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Assuming your Django backend API is hosted at this base URL
const BASE_URL = 'https://demo.easydr.xyz/api';

// Helper function to get JWT token from localStorage or your preferred storage
const getToken = () => {
  return localStorage.getItem('token'); // Adjust based on your token storage method
};

export const examApi = createApi({
  reducerPath: 'examApi',
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
  tagTypes: ['examApi'],
  endpoints: (builder) => ({
    // GET: Fetch all examApis
    getExamApi: builder.query({
      query: () => '/exams/',
      providesTags: ['examApi'],
    }),

    // GET: Fetch single examApi by ID
    getExamApiById: builder.query({
      query: (id) => `/exams/${id}/`,
      providesTags: ['examApi'],
    }),

    // POST: Create a new examApi
    createExamApi: builder.mutation({
      query: (examApiData) => ({
        url: '/exams/',
        method: 'POST',
        body: examApiData,
      }),
      invalidatesTags: ['examApi'],
    }),

    // PUT: Update an existing examApi
    updateExamApi: builder.mutation({
      query: ({ id, ...examApiData }) => ({
        url: `/exams/${id}/`,
        method: 'PUT',
        body: examApiData,
      }),
      invalidatesTags: ['examApi'],
    }),

    // DELETE: Delete an examApi
    deleteExamApi: builder.mutation({
      query: (id) => ({
        url: `/exams/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['examApi'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetExamApiQuery,
  useGetExamApiByIdQuery,
  useCreateExamApiMutation,
  useUpdateExamApiMutation,
  useDeleteExamApiMutation,
} = examApi;