import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = 'https://demo.easydr.xyz/api';

const getToken = () => {
  return localStorage.getItem('token');
};

export const groupListApi = createApi({
  reducerPath: 'groupListApi',
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
  tagTypes: ['GroupList'],
  endpoints: (builder) => ({
    // GET: Fetch all groups
    getGroupList: builder.query({
      query: () => '/group-list/',
      providesTags: ['GroupList'],
    }),

    // GET: Fetch a single group by ID
    getGroupById: builder.query({
      query: (id) => `/group-list/${id}/`,
      providesTags: ['GroupList'],
    }),

    // POST: Create a new group
    createGroup: builder.mutation({
      query: (groupData) => ({
        url: '/group-list/',
        method: 'POST',
        body: groupData,
      }),
      invalidatesTags: ['GroupList'],
    }),

    // PUT: Update an existing group
    updateGroup: builder.mutation({
      query: ({ id, ...groupData }) => ({
        url: `/group-list/${id}/`,
        method: 'PUT',
        body: groupData,
      }),
      invalidatesTags: ['GroupList'],
    }),

    // PATCH: Partially update a group
    patchGroup: builder.mutation({
      query: ({ id, ...groupData }) => ({
        url: `/group-list/${id}/`,
        method: 'PATCH',
        body: groupData,
      }),
      invalidatesTags: ['GroupList'],
    }),

    // DELETE: Delete a group
    deleteGroup: builder.mutation({
      query: (id) => ({
        url: `/group-list/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['GroupList'],
    }),
  }),
});

export const {
  useGetGroupListQuery,
  useGetGroupByIdQuery,
  useCreateGroupMutation,
  useUpdateGroupMutation,
  usePatchGroupMutation,
  useDeleteGroupMutation,
} = groupListApi;