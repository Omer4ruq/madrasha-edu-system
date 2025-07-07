import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import BASE_URL2 from '../../../../utilitis/apiConfig2';

const getToken = () => {
  return localStorage.getItem('token');
};

export const instituteTypeApi = createApi({
  reducerPath: 'instituteTypeApi',
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
  tagTypes: [ 'InstituteType'],
  endpoints: (builder) => ({
   


 

   



    // GET: Fetch all institute types
    getInstituteTypes: builder.query({
      query: () => '/institutetype/',
      providesTags: ['InstituteType'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  
  useGetInstituteTypesQuery,
} = instituteTypeApi;