import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import BASE_URL from '../../../../utilitis/apiConfig';


const getToken = () => {
  return localStorage.getItem('token');
};

export const mealItemApi = createApi({
  reducerPath: 'mealItemApi',
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
  tagTypes: ['mealItemApi'],
  endpoints: (builder) => ({
    // GET: Fetch all mealItemApis
    getMealItemApi: builder.query({
      query: () => '/meal-items/',
      providesTags: ['mealItemApi'],
    }),

    // GET: Fetch single mealItemApi by ID 
    getMealItemApiById: builder.query({
      query: (id) => `/meal-items/${id}/`,
      providesTags: ['mealItemApi'],
    }),

    // POST: Create a new mealItemApi
    createMealItemApi: builder.mutation({
      query: (mealItemApiData) => ({
        url: '/meal-items/',
        method: 'POST',
        body: mealItemApiData,
      }),
      invalidatesTags: ['mealItemApi'],
    }),

    // PUT: Update an existing mealItemApi
    updateMealItemApi: builder.mutation({
      query: ({ id, ...mealItemApiData }) => ({
        url: `/meal-items/${id}/`,
        method: 'PUT',
        body: mealItemApiData,
      }),
      invalidatesTags: ['mealItemApi'],
    }),

    // DELETE: Delete an mealItemApi
    deleteMealItemApi: builder.mutation({
      query: (id) => ({
        url: `/meal-items/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['mealItemApi'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetMealItemApiQuery,
  useGetMealItemApiByIdQuery,
  useCreateMealItemApiMutation,
  useUpdateMealItemApiMutation,
  useDeleteMealItemApiMutation,
} = mealItemApi;