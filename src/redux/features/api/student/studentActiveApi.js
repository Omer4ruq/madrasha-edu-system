import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Assuming your Django backend API is hosted at this base URL
const BASE_URL = 'https://demo.easydr.xyz/api';

// Helper function to get JWT token from localStorage or your preferred storage
const getToken = () => {
  return localStorage.getItem('token'); // Adjust based on your token storage method
};

export const studentActiveApi = createApi({
  reducerPath: 'studentActiveApi',
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
  tagTypes: ['studentActiveApi'],
  endpoints: (builder) => ({
    // GET: Fetch all studentActiveApis
    getStudentActiveApi: builder.query({
      query: () => '/active-students/',
      providesTags: ['studentActiveApi'],
    }),

    // GET: Fetch single studentActiveApi by ID
    getStudentActiveApiById: builder.query({
      query: (id) => `/active-students/${id}/`,
      providesTags: ['studentActiveApi'],
    }),

    // POST: Create a new studentActiveApi
    createStudentActiveApi: builder.mutation({
      query: (studentActiveApiData) => ({
        url: '/active-students/',
        method: 'POST',
        body: studentActiveApiData,
      }),
      invalidatesTags: ['studentActiveApi'],
    }),

    // PUT: Update an existing studentActiveApi
    updateStudentActiveApi: builder.mutation({
      query: ({ id, ...studentActiveApiData }) => ({
        url: `/active-students/${id}/`,
        method: 'PUT',
        body: studentActiveApiData,
      }),
      invalidatesTags: ['studentActiveApi'],
    }),

    // DELETE: Delete an studentActiveApi 
    deleteStudentActiveApi: builder.mutation({
      query: (id) => ({
        url: `/active-students/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['studentActiveApi'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetStudentActiveApiQuery,
  useGetStudentActiveApiByIdQuery,
  useCreateStudentActiveApiMutation,
  useUpdateStudentActiveApiMutation,
  useDeleteStudentActiveApiMutation,
} = studentActiveApi;