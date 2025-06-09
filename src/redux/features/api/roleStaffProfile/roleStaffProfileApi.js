import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = 'https://demo.easydr.xyz/api';

const getToken = () => {
  return localStorage.getItem('token');
};

export const roleStaffProfileApi = createApi({
  reducerPath: 'roleStaffProfileApi',
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
  tagTypes: ['roleStaffProfileApi'],
  endpoints: (builder) => ({
    getRoleStaffProfileApi: builder.query({
      query: () => '/performance-names/',
      providesTags: ['roleStaffProfileApi'],
    }),
    getRoleStaffProfileApiById: builder.query({
      query: (id) => `/performance-names/${id}/`,
      providesTags: ['roleStaffProfileApi'],
    }),
    createRoleStaffProfileApi: builder.mutation({
      query: (roleStaffProfileApiData) => ({
        url: '/performance-names/',
        method: 'POST',
        body: roleStaffProfileApiData,
      }),
      invalidatesTags: ['roleStaffProfileApi'],
    }),
    updateRoleStaffProfileApi: builder.mutation({
      query: ({ id, ...roleStaffProfileApiData }) => ({
        url: `/performance-names/${id}/`,
        method: 'PUT',
        body: roleStaffProfileApiData,
      }),
      invalidatesTags: ['roleStaffProfileApi'],
    }),
    deleteRoleStaffProfileApi: builder.mutation({
      query: (id) => ({
        url: `/performance-names/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['roleStaffProfileApi'],
    }),
  }),
});

export const {
  useGetRoleStaffProfileApiQuery,
  useGetRoleStaffProfileApiByIdQuery,
  useCreateRoleStaffProfileApiMutation,
  useUpdateRoleStaffProfileApiMutation,
  useDeleteRoleStaffProfileApiMutation,
} = roleStaffProfileApi;