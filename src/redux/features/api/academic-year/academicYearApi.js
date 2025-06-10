import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';


const BASE_URL = 'https://easydr.xyz/api';


const getToken = () => {
  return localStorage.getItem('token'); 
};

export const academicYearApi = createApi({
  reducerPath: 'academicYearApi',
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
  tagTypes: ['academicYearApi'],
  endpoints: (builder) => ({
    // GET: Fetch all academicYearApis
    getAcademicYearApi: builder.query({
      query: () => '/academicyear/',
      providesTags: ['academicYearApi'],
    }),

    // GET: Fetch single academicYearApi by ID
    getAcademicYearApiById: builder.query({
      query: (id) => `/academicyear/${id}/`,
      providesTags: ['academicYearApi'],
    }),

    // POST: Create a new academicYearApi
    createAcademicYearApi: builder.mutation({
      query: (academicYearApiData) => ({
        url: '/academicyear/',
        method: 'POST',
        body: academicYearApiData,
      }),
      invalidatesTags: ['academicYearApi'],
    }),

    // PUT: Update an existing academicYearApi
    updateAcademicYearApi: builder.mutation({
      query: ({ id, ...academicYearApiData }) => ({
        url: `/academicyear/${id}/`,
        method: 'PUT',
        body: academicYearApiData,
      }),
      invalidatesTags: ['academicYearApi'],
    }),

    // DELETE: Delete an academicYearApi
    deleteAcademicYearApi: builder.mutation({
      query: (id) => ({
        url: `/academicyear/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['academicYearApi'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetAcademicYearApiQuery,
  useGetAcademicYearApiByIdQuery,
  useCreateAcademicYearApiMutation,
  useUpdateAcademicYearApiMutation,
  useDeleteAcademicYearApiMutation,
} = academicYearApi;