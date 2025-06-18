import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = 'https://demo.easydr.xyz/api';

const getToken = () => {
  return localStorage.getItem('token');
};

export const mealStatusApi = createApi({
  reducerPath: 'mealStatusApi',
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
  tagTypes: ['MealStatus'],
  endpoints: (builder) => ({
    // GET: Fetch all meal statuses
    getMealStatuses: builder.query({
      query: () => '/meal-status/',
      providesTags: ['MealStatus'],
    }),

    // GET: Fetch a single meal status by ID
    getMealStatusById: builder.query({
      query: (id) => `/meal-status/${id}/`,
      providesTags: ['MealStatus'],
    }),

    // POST: Create a new meal status
    createMealStatus: builder.mutation({
      query: (mealStatusData) => ({
        url: '/meal-status/',
        method: 'POST',
        body: mealStatusData,
      }),
      invalidatesTags: ['MealStatus'],
    }),

    // PUT: Update an existing meal status
    updateMealStatus: builder.mutation({
      query: ({ id, ...mealStatusData }) => ({
        url: `/meal-status/${id}/`,
        method: 'PUT',
        body: mealStatusData,
      }),
      invalidatesTags: ['MealStatus'],
    }),

    // DELETE: Delete a meal status
    deleteMealStatus: builder.mutation({
      query: (id) => ({
        url: `/meal-status/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['MealStatus'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetMealStatusesQuery,
  useGetMealStatusByIdQuery,
  useCreateMealStatusMutation,
  useUpdateMealStatusMutation,
  useDeleteMealStatusMutation,
} = mealStatusApi;