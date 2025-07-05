import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = 'https://demo.easydr.xyz/api';

const getToken = () => {
  return localStorage.getItem('token');
};

export const roleTypesApi = createApi({
  reducerPath: 'roleTypesApi',
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
  tagTypes: ['RoleTypes'],
  endpoints: (builder) => ({
    // GET: Fetch all role types
    getRoleTypes: builder.query({
      query: () => '/role-types/',
      providesTags: ['RoleTypes'],
    }),

    // GET: Fetch a single role type by ID
    getRoleTypeById: builder.query({
      query: (id) => `/role-types/${id}/`,
      providesTags: ['RoleTypes'],
    }),

    // POST: Create a new role type
    createRoleType: builder.mutation({
      query: (roleTypeData) => ({
        url: '/role-types/',
        method: 'POST',
        body: roleTypeData,
      }),
      invalidatesTags: ['RoleTypes'],
    }),

    // PUT: Update an existing role type
    updateRoleType: builder.mutation({
      query: ({ id, ...roleTypeData }) => ({
        url: `/role-types/${id}/`,
        method: 'PUT',
        body: roleTypeData,
      }),
      invalidatesTags: ['RoleTypes'],
    }),

    // PATCH: Partially update a role type
    patchRoleType: builder.mutation({
      query: ({ id, ...roleTypeData }) => ({
        url: `/role-types/${id}/`,
        method: 'PATCH',
        body: roleTypeData,
      }),
      invalidatesTags: ['RoleTypes'],
    }),

    // DELETE: Delete a role type
    deleteRoleType: builder.mutation({
      query: (id) => ({
        url: `/role-types/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['RoleTypes'],
    }),
  }),
});

export const {
  useGetRoleTypesQuery,
  useGetRoleTypeByIdQuery,
  useCreateRoleTypeMutation,
  useUpdateRoleTypeMutation,
  usePatchRoleTypeMutation,
  useDeleteRoleTypeMutation,
} = roleTypesApi;