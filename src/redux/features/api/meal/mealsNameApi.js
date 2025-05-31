import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Assuming your Django backend API is hosted at this base URL
const BASE_URL = 'https://demo.easydr.xyz/api';

// Helper function to get JWT token from localStorage or your preferred storage
const getToken = () => {
  return localStorage.getItem('token'); // Adjust based on your token storage method
};

export const mealsNameApi = createApi({
  reducerPath: 'mealsNameApi',
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
  tagTypes: ['mealsNameApi'],
  endpoints: (builder) => ({
    // GET: Fetch all mealsNameApis
    getMealsNameApi: builder.query({
      query: () => '/meal-names/',
      providesTags: ['mealsNameApi'],
    }),

    // GET: Fetch single mealsNameApi by ID
    getMealsNameApiById: builder.query({
      query: (id) => `/meal-names/${id}/`,
      providesTags: ['mealsNameApi'],
    }),

    // POST: Create a new mealsNameApi 
    createMealsNameApi: builder.mutation({
      query: (mealsNameApiData) => ({
        url: '/meal-names/',
        method: 'POST',
        body: mealsNameApiData,
      }),
      invalidatesTags: ['mealsNameApi'],
    }),

    // PUT: Update an existing mealsNameApi
    updateMealsNameApi: builder.mutation({
      query: ({ id, ...mealsNameApiData }) => ({
        url: `/meal-names/${id}/`,
        method: 'PUT',
        body: mealsNameApiData,
      }),
      invalidatesTags: ['mealsNameApi'],
    }),

    // DELETE: Delete an mealsNameApi
    deleteMealsNameApi: builder.mutation({
      query: (id) => ({
        url: `/meal-names/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['mealsNameApi'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetMealsNameApiQuery,
  useGetMealsNameApiByIdQuery,
  useCreateMealsNameApiMutation,
  useUpdateMealsNameApiMutation,
  useDeleteMealsNameApiMutation,
} = mealsNameApi;