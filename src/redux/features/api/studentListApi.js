import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Assuming your Django backend API is hosted at this base URL
const BASE_URL = 'https://demo.easydr.xyz/api';

// Helper function to get JWT token from localStorage or your preferred storage
const getToken = () => {
  return localStorage.getItem('token'); // Adjust based on your token storage method
};

export const studentListApi = createApi({
  reducerPath: 'studentListApi',
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
  tagTypes: ['StudentListApI'],
  endpoints: (builder) => ({
    // GET: Fetch all StudentListApIs
    getStudentListApI: builder.query({
      query: () => '/student-list/',
      providesTags: ['StudentListApI'],
    }),

    // GET: Fetch single StudentListApI by ID
    getStudentListApIById: builder.query({
      query: (id) => `/student-list/${id}/`,
      providesTags: ['StudentListApI'],
    }),

    // POST: Create a new StudentListApI
    createStudentListApI: builder.mutation({
      query: (StudentListApIData) => ({
        url: '/student-list/',
        method: 'POST',
        body: StudentListApIData,
      }),
      invalidatesTags: ['StudentListApI'],
    }),

    // PUT: Update an existing StudentListApI
    updateStudentListApI: builder.mutation({
      query: ({ id, ...StudentListApIData }) => ({
        url: `/student-list/${id}/`,
        method: 'PUT',
        body: StudentListApIData,
      }),
      invalidatesTags: ['StudentListApI'],
    }),

    // DELETE: Delete an StudentListApI
    deleteStudentListApI: builder.mutation({
      query: (id) => ({
        url: `/student-list/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['StudentListApI'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetStudentListApIQuery,
  useGetStudentListApIByIdQuery,
  useCreateStudentListApIMutation,
  useUpdateStudentListApIMutation,
  useDeleteStudentListApIMutation,
} = studentListApi;