// services/gmarkTypeApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import BASE_URL2 from '../../../../utilitis/apiConfig2';

export const gmarkTypeApi = createApi({
  reducerPath: 'gmarkTypeApi',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL2 }),
  endpoints: (builder) => ({
    getGmarkTypes: builder.query({
      query: () => 'gmarktype/',
    }),
  }),
});

export const { useGetGmarkTypesQuery } = gmarkTypeApi;