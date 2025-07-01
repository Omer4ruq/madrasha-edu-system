import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import BASE_URL from '../../../../utilitis/apiConfig';





const getToken = () => {
  return localStorage.getItem('token'); 
};

export const behaviorMarksApi = createApi({
  reducerPath: 'behaviorMarksApi',
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
  tagTypes: ['behaviorMarksApi'],
  endpoints: (builder) => ({
    // GET: Fetch all behaviorMarksApis
    getBehaviorMarksApi: builder.query({
      query: () => '/behavior-marks/',
      providesTags: ['behaviorMarksApi'],
    }),

    // GET: Fetch single behaviorMarksApi by ID
    getBehaviorMarksApiById: builder.query({
      query: (id) => `/behavior-marks/${id}/`,
      providesTags: ['behaviorMarksApi'],
    }),

    // POST: Create a new behaviorMarksApi
    createBehaviorMarksApi: builder.mutation({
      query: (behaviorMarksApiData) => ({
        url: '/behavior-marks/',
        method: 'POST',
        body: behaviorMarksApiData,
      }),
      invalidatesTags: ['behaviorMarksApi'],
    }),

    // PUT: Update an existing behaviorMarksApi
    updateBehaviorMarksApi: builder.mutation({
      query: ({ id, ...behaviorMarksApiData }) => ({
        url: `/behavior-marks/${id}/`,
        method: 'PUT',
        body: behaviorMarksApiData,
      }),
      invalidatesTags: ['behaviorMarksApi'],
    }),

    // DELETE: Delete an behaviorMarksApi
    deleteBehaviorMarksApi: builder.mutation({
      query: (id) => ({
        url: `/behavior-marks/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['behaviorMarksApi'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetBehaviorMarksApiQuery,
  useGetBehaviorMarksApiByIdQuery,
  useCreateBehaviorMarksApiMutation,
  useUpdateBehaviorMarksApiMutation,
  useDeleteBehaviorMarksApiMutation,
} = behaviorMarksApi;