import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Base URL for the Django backend API
const BASE_URL = 'https://easydr.xyz/api'; // Updated to match institute type endpoint

// Helper function to get JWT token from localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

export const instituteTypeApi = createApi({
  reducerPath: 'instituteTypeApi',
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
  tagTypes: [ 'InstituteType'],
  endpoints: (builder) => ({
   


 

   



    // GET: Fetch all institute types
    getInstituteTypes: builder.query({
      query: () => '/institutetype/',
      providesTags: ['InstituteType'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  
  useGetInstituteTypesQuery,
} = instituteTypeApi;