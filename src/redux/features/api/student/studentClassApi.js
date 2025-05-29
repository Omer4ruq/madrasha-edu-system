import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Assuming your Django backend API is hosted at this base URL
const BASE_URL = 'https://demo.easydr.xyz/api';

// Helper function to get JWT token from localStorage or your preferred storage
const getToken = () => {
  return localStorage.getItem('token'); // Adjust based on your token storage method
};

export const studentClassApi = createApi({
  reducerPath: 'studentClassApi',
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
  tagTypes: ['StudentClassApI'],
  endpoints: (builder) => ({
    // GET: Fetch all StudentClassApIs
    getStudentClassApI: builder.query({
      query: () => '/student-class/',
      providesTags: ['StudentClassApI'],
    }),

    // GET: Fetch single StudentClassApI by ID
    getStudentClassApIById: builder.query({
      query: (id) => `/student-class/${id}/`,
      providesTags: ['StudentClassApI'],
    }),

    // POST: Create a new StudentClassApI
    createStudentClassApI: builder.mutation({
      query: (StudentClassApIData) => ({
        url: '/student-class/',
        method: 'POST',
        body: StudentClassApIData,
      }),
      invalidatesTags: ['StudentClassApI'],
    }),

    // PUT: Update an existing StudentClassApI
    updateStudentClassApI: builder.mutation({
      query: ({ id, ...StudentClassApIData }) => ({
        url: `/student-class/${id}/`,
        method: 'PUT',
        body: StudentClassApIData,
      }),
      invalidatesTags: ['StudentClassApI'],
    }),

    // DELETE: Delete an StudentClassApI
    deleteStudentClassApI: builder.mutation({
      query: (id) => ({
        url: `/student-class/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['StudentClassApI'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetStudentClassApIQuery,
  useGetStudentClassApIByIdQuery,
  useCreateStudentClassApIMutation,
  useUpdateStudentClassApIMutation,
  useDeleteStudentClassApIMutation,
} = studentClassApi;