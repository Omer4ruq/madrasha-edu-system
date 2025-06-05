import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = 'https://demo.easydr.xyz/api';

const getToken = () => {
  return localStorage.getItem('token');
};

export const jointUsersApi = createApi({
  reducerPath: 'jointUsersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      const token = getToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['jointUsers'],
  endpoints: (builder) => ({
    // GET: Fetch single joint user by ID
    getJointUserById: builder.query({
      query: (id) => `/joint-users/${id}/`,
      providesTags: ['jointUsers'],
    }),
    // GET: Search joint users by name or user_id
    searchJointUsers: builder.query({
      query: (searchTerm) => `/joint-users/?search=${searchTerm}`,
      providesTags: ['jointUsers'],
      // Only trigger query if search term is 3+ characters
      queryFn: async (searchTerm, _api, _extraOptions, baseQuery) => {
        if (!searchTerm || searchTerm.length < 3) {
          return { data: [] }; // Return empty array if search term is less than 3 characters
        }
        return baseQuery(`/joint-users/?search=${searchTerm}`);
      },
    }),
  }),
});

export const { useGetJointUserByIdQuery, useSearchJointUsersQuery } = jointUsersApi;