import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import BASE_URL2 from '../../../../utilitis/apiConfig2';


const getToken = () => {
  return localStorage.getItem('token'); 
};

export const gfeeSubheadsApi = createApi({
  reducerPath: 'gfeeSubheadsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL2,
    prepareHeaders: (headers) => {
      const token = getToken();
      // if (token) {
      //   headers.set('Authorization', `Bearer ${token}`);
      // }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['GfeeSubheads'],
  endpoints: (builder) => ({
    // GET: Fetch all gfee subheads 
    getGfeeSubheads: builder.query({
      query: () => '/gfee-subheads/',
      providesTags: ['GfeeSubheads'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetGfeeSubheadsQuery,
} = gfeeSubheadsApi;