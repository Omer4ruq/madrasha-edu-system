import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import BASE_URL from '../../../../utilitis/apiConfig';





const getToken = () => {
  return localStorage.getItem('token'); 
};

export const behaviorTypeApi = createApi({
  reducerPath: 'behaviorTypeApi',
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
  tagTypes: ['behaviorTypeApi'],
  endpoints: (builder) => ({
    // GET: Fetch all behaviorTypeApis
    getBehaviorTypeApi: builder.query({
      query: () => '/behavior-report-type/',
      providesTags: ['behaviorTypeApi'],
    }),

    // GET: Fetch single behaviorTypeApi by ID
    getBehaviorTypeApiById: builder.query({
      query: (id) => `/behavior-report-type/${id}/`,
      providesTags: ['behaviorTypeApi'],
    }),

    // POST: Create a new behaviorTypeApi
    createBehaviorTypeApi: builder.mutation({
      query: (behaviorTypeApiData) => ({
        url: '/behavior-report-type/',
        method: 'POST',
        body: behaviorTypeApiData,
      }),
      invalidatesTags: ['behaviorTypeApi'],
    }),

    // PUT: Update an existing behaviorTypeApi
    updateBehaviorTypeApi: builder.mutation({
      query: ({ id, ...behaviorTypeApiData }) => ({
        url: `/behavior-report-type/${id}/`,
        method: 'PUT',
        body: behaviorTypeApiData,
      }),
      invalidatesTags: ['behaviorTypeApi'],
    }),

    // DELETE: Delete an behaviorTypeApi
    deleteBehaviorTypeApi: builder.mutation({
      query: (id) => ({
        url: `/behavior-report-type/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['behaviorTypeApi'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetBehaviorTypeApiQuery,
  useGetBehaviorTypeApiByIdQuery,
  useCreateBehaviorTypeApiMutation,
  useUpdateBehaviorTypeApiMutation,
  useDeleteBehaviorTypeApiMutation,
} = behaviorTypeApi;