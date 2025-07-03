import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = 'https://demo.easydr.xyz/api';

const getToken = () => {
  return localStorage.getItem('token');
};

export const groupsApi = createApi({
  reducerPath: 'groupsApi',
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
  tagTypes: ['Groups', 'GroupPermissions'],
  endpoints: (builder) => ({
    // GROUPS CRUD
    getGroups: builder.query({
      query: () => '/groups/',
      providesTags: ['Groups'],
    }),
    getGroupById: builder.query({
      query: (id) => `/groups/${id}/`,
      providesTags: ['Groups'],
    }),
    createGroup: builder.mutation({
      query: (groupData) => ({
        url: '/groups/',
        method: 'POST',
        body: groupData,
      }),
      invalidatesTags: ['Groups'],
    }),
    updateGroup: builder.mutation({
      query: ({ id, ...groupData }) => ({
        url: `/groups/${id}/`,
        method: 'PUT',
        body: groupData,
      }),
      invalidatesTags: ['Groups'],
    }),
    deleteGroup: builder.mutation({
      query: (id) => ({
        url: `/groups/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Groups'],
    }),

    // GROUP PERMISSIONS
    getGroupPermissions: builder.query({
      query: (groupId) => `/groups/${groupId}/permissions/`,
      providesTags: ['GroupPermissions'],
    }),
    updateGroupPermissions: builder.mutation({
      query: ({ groupId, permissions }) => ({
        url: `/groups/${groupId}/permissions/`,
        method: 'POST',
        body: permissions,
      }),
      invalidatesTags: ['GroupPermissions'],
    }),
       CreateGroupPermissions: builder.mutation({
      query: ({ groupId, permissions }) => ({
        url: `/groups/${groupId}/permissions/`,
        method: 'POST',
        body: permissions,
      }),
      invalidatesTags: ['GroupPermissions'],
    }),
  }),
});

export const {
  useGetGroupsQuery,
  useGetGroupByIdQuery,
  useCreateGroupMutation,
  useUpdateGroupMutation,
  useDeleteGroupMutation,
  useGetGroupPermissionsQuery,
  useUpdateGroupPermissionsMutation,
  useCreateGroupPermissionsMutation,
} = groupsApi;