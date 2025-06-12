import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Base URL for the Django backend API
const BASE_URL = 'https://demo.easydr.xyz/api'; 

// Helper function to get JWT token from localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

export const classListApi = createApi({
  reducerPath: 'classListApi',
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
  tagTypes: [ 'ClassListApi'],
  endpoints: (builder) => ({
   
    // GET: Fetch all Class types
    getClassListApi: builder.query({
      query: () => '/student-class/',
      providesTags: ['ClassListApi'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  
  useGetClassListApiQuery,
} = classListApi;