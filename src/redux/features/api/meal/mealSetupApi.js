import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Assuming your Django backend API is hosted at this base URL
const BASE_URL = 'https://demo.easydr.xyz/api';

// Helper function to get JWT token from localStorage or your preferred storage
const getToken = () => {
  return localStorage.getItem('token'); // Adjust based on your token storage method
};

export const mealSetupApi = createApi({
  reducerPath: 'mealSetupApi',
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
  tagTypes: ['mealSetupApi'],
  endpoints: (builder) => ({
    // GET: Fetch all mealSetupApis
    getMealSetupApi: builder.query({
      query: () => '/meal-setup/',
      providesTags: ['mealSetupApi'],
    }),

    // GET: Fetch single mealSetupApi by ID  
    getMealSetupApiById: builder.query({
      query: (id) => `/meal-setup/${id}/`,
      providesTags: ['mealSetupApi'],
    }),

    // POST: Create a new mealSetupApi
    createMealSetupApi: builder.mutation({
      query: (mealSetupApiData) => ({
        url: '/meal-setup/',
        method: 'POST',
        body: mealSetupApiData,
      }),
      invalidatesTags: ['mealSetupApi'],
    }),

    // PUT: Update an existing mealSetupApi
    updateMealSetupApi: builder.mutation({
      query: ({ id, ...mealSetupApiData }) => ({
        url: `/meal-setup/${id}/`,
        method: 'PUT',
        body: mealSetupApiData,
      }),
      invalidatesTags: ['mealSetupApi'],
    }),

    // DELETE: Delete an mealSetupApi
    deleteMealSetupApi: builder.mutation({
      query: (id) => ({
        url: `/meal-setup/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['mealSetupApi'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetMealSetupApiQuery,
  useGetMealSetupApiByIdQuery,
  useCreateMealSetupApiMutation,
  useUpdateMealSetupApiMutation,
  useDeleteMealSetupApiMutation,
} = mealSetupApi;