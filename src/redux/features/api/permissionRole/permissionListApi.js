import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = 'https://demo.easydr.xyz/api';

const getToken = () => {
  return localStorage.getItem('token');
};

export const permissionListApi = createApi({
  reducerPath: 'permissionListApi',
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
  tagTypes: ['PermissionList'],
  endpoints: (builder) => ({
    // GET: Fetch all permissions
    getPermissionList: builder.query({
      query: () => '/permission-list/',
      providesTags: ['PermissionList'],
    }),

    // GET: Fetch a single permission by ID
    getPermissionById: builder.query({
      query: (id) => `/permission-list/${id}/`,
      providesTags: ['PermissionList'],
    }),

    // POST: Create a new permission
    createPermission: builder.mutation({
      query: (permissionData) => ({
        url: '/permission-list/',
        method: 'POST',
        body: permissionData,
      }),
      invalidatesTags: ['PermissionList'],
    }),

    // PUT: Update an existing permission
    updatePermission: builder.mutation({
      query: ({ id, ...permissionData }) => ({
        url: `/permission-list/${id}/`,
        method: 'PUT',
        body: permissionData,
      }),
      invalidatesTags: ['PermissionList'],
    }),

    // PATCH: Partially update a permission
    patchPermission: builder.mutation({
      query: ({ id, ...permissionData }) => ({
        url: `/permission-list/${id}/`,
        method: 'PATCH',
        body: permissionData,
      }),
      invalidatesTags: ['PermissionList'],
    }),

    // DELETE: Delete a permission
    deletePermission: builder.mutation({
      query: (id) => ({
        url: `/permission-list/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PermissionList'],
    }),
  }),
});

export const {
  useGetPermissionListQuery,
  useGetPermissionByIdQuery,
  useCreatePermissionMutation,
  useUpdatePermissionMutation,
  usePatchPermissionMutation,
  useDeletePermissionMutation,
} = permissionListApi;