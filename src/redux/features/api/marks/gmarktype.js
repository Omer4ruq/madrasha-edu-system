// services/gmarkTypeApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const gmarkTypeApi = createApi({
  reducerPath: 'gmarkTypeApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://easydr.xyz/api/' }),
  endpoints: (builder) => ({
    getGmarkTypes: builder.query({
      query: () => 'gmarktype/',
    }),
  }),
});

export const { useGetGmarkTypesQuery } = gmarkTypeApi;