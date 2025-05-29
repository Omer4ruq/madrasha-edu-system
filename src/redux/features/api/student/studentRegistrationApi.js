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
  

  

    // POST: Create a new studentRegistrationApi
    createStudentRegistrationApi: builder.mutation({
      query: (studentRegistrationApiData) => ({
        url: '/register/student/',
        method: 'POST',
        body: studentRegistrationApiData,
      }),
      invalidatesTags: ['studentRegistrationApi'],
    }),

  }),
});

// Export hooks for usage in components
export const {

  useCreateStudentRegistrationApiMutation,

} = studentRegistrationApi;