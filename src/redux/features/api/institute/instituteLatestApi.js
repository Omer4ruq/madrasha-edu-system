import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = 'https://demo.easydr.xyz/api';

const getToken = () => {
  return localStorage.getItem('token');
};

export const instituteLatestApi = createApi({
  reducerPath: 'instituteLatestApi',
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
  tagTypes: ['Institute'],
  endpoints: (builder) => ({
    getInstituteLatest: builder.query({
      query: () => '/institute_latest/',
      providesTags: ['Institute'],
    }),

    getInstituteLatestById: builder.query({
      query: (id) => `/institute_latest/${id}/`,
      providesTags: ['Institute'],
    }),

    createInstituteLatest: builder.mutation({
      query: (data) => ({
        url: '/institute_latest/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Institute'],
    }),

    updateInstituteLatest: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/institute_latest/${id}/`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Institute'],
    }),

    deleteInstituteLatest: builder.mutation({
      query: (id) => ({
        url: `/institute_latest/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Institute'],
    }),
  }),
});

export const {
  useGetInstituteLatestQuery,
  useGetInstituteLatestByIdQuery,
  useCreateInstituteLatestMutation,
  useUpdateInstituteLatestMutation,
  useDeleteInstituteLatestMutation,
} = instituteLatestApi;
