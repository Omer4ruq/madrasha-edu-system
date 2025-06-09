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
      query: () => '/role-staff-profiles/',
      providesTags: ['roleStaffProfileApi'],
    }),
    getRoleStaffProfileApiById: builder.query({
      query: (id) => `/role-staff-profiles/${id}/`,
      providesTags: ['roleStaffProfileApi'],
    }),
    createRoleStaffProfileApi: builder.mutation({
      query: (roleStaffProfileApiData) => ({
        url: '/role-staff-profiles/',
        method: 'POST',
        body: roleStaffProfileApiData,
      }),
      invalidatesTags: ['roleStaffProfileApi'],
    }),
    updateRoleStaffProfileApi: builder.mutation({
      query: ({ id, ...roleStaffProfileApiData }) => ({
        url: `/role-staff-profiles/${id}/`,
        method: 'PUT',
        body: roleStaffProfileApiData,
      }),
      invalidatesTags: ['roleStaffProfileApi'],
    }),
    deleteRoleStaffProfileApi: builder.mutation({
      query: (id) => ({
        url: `/role-staff-profiles/${id}/`,
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