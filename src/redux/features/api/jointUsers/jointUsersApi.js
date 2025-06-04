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
  }),
});

export const { useGetJointUserByIdQuery } = jointUsersApi;
