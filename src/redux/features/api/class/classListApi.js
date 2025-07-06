import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import BASE_URL2 from '../../../../utilitis/apiConfig2';
// import BASE_URL from '../../../../utilitis/apiConfig';
 

const getToken = () => {
  return localStorage.getItem('token');
};

export const classListApi = createApi({
  reducerPath: 'classListApi',
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
  tagTypes: [ 'ClassListApi'],
  endpoints: (builder) => ({
   
    // GET: Fetch all Class types
    getClassListApi: builder.query({
      query: () => '/gstudentclass/',
      providesTags: ['ClassListApi'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  
  useGetClassListApiQuery,
} = classListApi;