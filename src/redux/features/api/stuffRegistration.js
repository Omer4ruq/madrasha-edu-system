import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Assuming your Django backend API is hosted at this base URL
const BASE_URL = 'https://demo.easydr.xyz/api';

// Helper function to get JWT token from localStorage or your preferred storage
const getToken = () => {
  return localStorage.getItem('token'); // Adjust based on your token storage method
};

export const stuffRegistrationApi = createApi({
  reducerPath: 'stuffRegistrationApi',
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
  tagTypes: ['stuffRegistrationApi'],
  endpoints: (builder) => ({
  

  

    // POST: Create a new stuffRegistrationApi
    createStuffRegistrationApi: builder.mutation({
      query: (stuffRegistrationApiData) => ({
        url: '/register/staff/',
        method: 'POST',
        body: stuffRegistrationApiData,
      }),
      invalidatesTags: ['stuffRegistrationApi'],
    }),

  }),
});

// Export hooks for usage in components
export const {

  useCreateStuffRegistrationApiMutation,

} = stuffRegistrationApi;