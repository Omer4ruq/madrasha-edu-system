import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Assuming your Django backend API is hosted at this base URL
const BASE_URL = 'https://demo.easydr.xyz/api';

// Helper function to get JWT token from localStorage or your preferred storage
const getToken = () => {
  return localStorage.getItem('token'); // Adjust based on your token storage method
};

export const studentSectionApi = createApi({
  reducerPath: 'studentSectionApi',
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
  tagTypes: ['studentSectionApi'],
  endpoints: (builder) => ({
    // GET: Fetch all studentSectionApis
    getStudentSectionApi: builder.query({
      query: () => '/student-section/',
      providesTags: ['studentSectionApi'],
    }),

    // GET: Fetch single studentSectionApi by ID set-student-password/
    getStudentSectionApiById: builder.query({
      query: (id) => `/student-section/${id}/`,
      providesTags: ['studentSectionApi'],
    }),

    // POST: Create a new studentSectionApi
    createStudentSectionApi: builder.mutation({
      query: (studentSectionApiData) => ({
        url: '/student-section/',
        method: 'POST',
        body: studentSectionApiData,
      }),
      invalidatesTags: ['studentSectionApi'],
    }),

    // PUT: Update an existing studentSectionApi
    updateStudentSectionApi: builder.mutation({
      query: ({ id, ...studentSectionApiData }) => ({
        url: `/student-section/${id}/`,
        method: 'PUT',
        body: studentSectionApiData,
      }),
      invalidatesTags: ['studentSectionApi'],
    }),

    // DELETE: Delete an studentSectionApi
    deleteStudentSectionApi: builder.mutation({
      query: (id) => ({
        url: `/student-section/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['studentSectionApi'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetStudentSectionApiQuery,
  useGetStudentSectionApiByIdQuery,
  useCreateStudentSectionApiMutation,
  useUpdateStudentSectionApiMutation,
  useDeleteStudentSectionApiMutation,
} = studentSectionApi;