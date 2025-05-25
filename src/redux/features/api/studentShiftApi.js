import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Assuming your Django backend API is hosted at this base URL
const BASE_URL = 'https://demo.easydr.xyz/api';

// Helper function to get JWT token from localStorage or your preferred storage
const getToken = () => {
  return localStorage.getItem('token'); // Adjust based on your token storage method
};

export const studentShiftApi = createApi({
  reducerPath: 'studentShiftApi',
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
  tagTypes: ['studentShiftApi'],
  endpoints: (builder) => ({
    // GET: Fetch all studentShiftApis
    getStudentShiftApi: builder.query({
      query: () => '/student-shift/',
      providesTags: ['studentShiftApi'],
    }),

    // GET: Fetch single studentShiftApi by ID
    getStudentShiftApiById: builder.query({
      query: (id) => `/student-shift/${id}/`,
      providesTags: ['studentShiftApi'],
    }),

    // POST: Create a new studentShiftApi
    createStudentShiftApi: builder.mutation({
      query: (studentShiftApiData) => ({
        url: '/student-shift/',
        method: 'POST',
        body: studentShiftApiData,
      }),
      invalidatesTags: ['studentShiftApi'],
    }),

    // PUT: Update an existing studentShiftApi
    updateStudentShiftApi: builder.mutation({
      query: ({ id, ...studentShiftApiData }) => ({
        url: `/student-shift/${id}/`,
        method: 'PUT',
        body: studentShiftApiData,
      }),
      invalidatesTags: ['studentShiftApi'],
    }),

    // DELETE: Delete an studentShiftApi
    deleteStudentShiftApi: builder.mutation({
      query: (id) => ({
        url: `/student-shift/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['studentShiftApi'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetStudentShiftApiQuery,
  useGetStudentShiftApiByIdQuery,
  useCreateStudentShiftApiMutation,
  useUpdateStudentShiftApiMutation,
  useDeleteStudentShiftApiMutation,
} = studentShiftApi;