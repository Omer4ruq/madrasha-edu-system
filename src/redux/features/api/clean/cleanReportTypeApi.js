import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import BASE_URL from '../../../../utilitis/apiConfig';


const getToken = () => {
  return localStorage.getItem('token'); 
};

export const cleanReportTypeApi = createApi({
  reducerPath: 'cleanReportTypeApi',
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
  tagTypes: ['cleanReportTypeApi'],
  endpoints: (builder) => ({
    // GET: Fetch all cleanReportTypeApis
    getCleanReportTypeApi: builder.query({
      query: () => '/clean-report-types/', 
      providesTags: ['cleanReportTypeApi'],
    }),

    // GET: Fetch single cleanReportTypeApi by ID
    getCleanReportTypeApiById: builder.query({
      query: (id) => `/clean-report-types/${id}/`,
      providesTags: ['cleanReportTypeApi'],
    }),

    // POST: Create a new cleanReportTypeApi
    createCleanReportTypeApi: builder.mutation({
      query: (cleanReportTypeApiData) => ({
        url: '/clean-report-types/',
        method: 'POST',
        body: cleanReportTypeApiData,
      }),
      invalidatesTags: ['cleanReportTypeApi'],
    }),

    // PUT: Update an existing cleanReportTypeApi
    updateCleanReportTypeApi: builder.mutation({
      query: ({ id, ...cleanReportTypeApiData }) => ({
        url: `/clean-report-types/${id}/`,
        method: 'PUT',
        body: cleanReportTypeApiData,
      }),
      invalidatesTags: ['cleanReportTypeApi'],
    }),

    // DELETE: Delete an cleanReportTypeApi
    deleteCleanReportTypeApi: builder.mutation({
      query: (id) => ({
        url: `/clean-report-types/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['cleanReportTypeApi'],
    }),
  }),
});

// Export hooks for usage in components 
export const {
  useGetCleanReportTypeApiQuery,
  useGetCleanReportTypeApiByIdQuery,
  useCreateCleanReportTypeApiMutation,
  useUpdateCleanReportTypeApiMutation,
  useDeleteCleanReportTypeApiMutation,
} = cleanReportTypeApi;