import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Assuming your Django backend API is hosted at this base URL
const BASE_URL = 'https://demo.easydr.xyz/api';

// Helper function to get JWT token from localStorage or your preferred storage
const getToken = () => {
  return localStorage.getItem('token'); // Adjust based on your token storage method
};

export const studentRegistrationApi = createApi({
  reducerPath: 'studentRegistrationApi',
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
  tagTypes: ['studentRegistrationApi'],
  endpoints: (builder) => ({
    // GET: Fetch all studentRegistrationApis
    getstudentRegistrationApi: builder.query({
      query: () => '/student-section/',
      providesTags: ['studentRegistrationApi'],
    }),

    // GET: Fetch single studentRegistrationApi by ID set-student-password/
    getstudentRegistrationApiById: builder.query({
      query: (id) => `/student-section/${id}/`,
      providesTags: ['studentRegistrationApi'],
    }),

    // POST: Create a new studentRegistrationApi
    createStudentRegistrationApi: builder.mutation({
      query: (studentRegistrationApiData) => ({
        url: '/register/student/',
        method: 'POST',
        body: studentRegistrationApiData,
      }),
      invalidatesTags: ['studentRegistrationApi'],
    }),

    // PUT: Update an existing studentRegistrationApi
    updatestudentRegistrationApi: builder.mutation({
      query: ({ id, ...studentRegistrationApiData }) => ({
        url: `/student-section/${id}/`,
        method: 'PUT',
        body: studentRegistrationApiData,
      }),
      invalidatesTags: ['studentRegistrationApi'],
    }),

    // DELETE: Delete an studentRegistrationApi
    deletestudentRegistrationApi: builder.mutation({
      query: (id) => ({
        url: `/student-section/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['studentRegistrationApi'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetstudentRegistrationApiQuery,
  useGetstudentRegistrationApiByIdQuery,
  useCreateStudentRegistrationApiMutation,
  useUpdatestudentRegistrationApiMutation,
  useDeletestudentRegistrationApiMutation,
} = studentRegistrationApi;