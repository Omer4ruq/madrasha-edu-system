import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import BASE_URL from '../../../../utilitis/apiConfig';


const getToken = () => {
  return localStorage.getItem('token'); 
};

export const cleanReportApi = createApi({
  reducerPath: 'cleanReportApi',
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
  tagTypes: ['cleanReportApi'],
  endpoints: (builder) => ({
    // GET: Fetch all cleanReportApis
    getCleanReportApi: builder.query({
      query: () => '/clean-reports/', 
      providesTags: ['cleanReportApi'],
    }),

    // GET: Fetch single cleanReportApi by ID
    getCleanReportApiById: builder.query({
      query: (id) => `/clean-reports/${id}/`,
      providesTags: ['cleanReportApi'],
    }),

    // POST: Create a new cleanReportApi
    createCleanReportApi: builder.mutation({
      query: (cleanReportApiData) => ({
        url: '/clean-reports/',
        method: 'POST',
        body: cleanReportApiData,
      }),
      invalidatesTags: ['cleanReportApi'],
    }),

    // PUT: Update an existing cleanReportApi
    updateCleanReportApi: builder.mutation({
      query: ({ id, ...cleanReportApiData }) => ({
        url: `/clean-reports/${id}/`,
        method: 'PUT',
        body: cleanReportApiData,
      }),
      invalidatesTags: ['cleanReportApi'],
    }),

    // DELETE: Delete an cleanReportApi
    deleteCleanReportApi: builder.mutation({
      query: (id) => ({
        url: `/clean-reports/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['cleanReportApi'],
    }),
  }),
});

// Export hooks for usage in components 
export const {
  useGetCleanReportApiQuery,
  useGetCleanReportApiByIdQuery,
  useCreateCleanReportApiMutation,
  useUpdateCleanReportApiMutation,
  useDeleteCleanReportApiMutation,
} = cleanReportApi;