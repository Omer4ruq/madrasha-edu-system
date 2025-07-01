import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import BASE_URL from '../../../../utilitis/apiConfig';


const getToken = () => {
  return localStorage.getItem('token'); 
};

export const studentBulkRegisterApi = createApi({
  reducerPath: 'studentBulkRegisterApi',
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
  tagTypes: ['studentBulkRegisterApi'],
  endpoints: (builder) => ({
  

  

    // POST: Create a new studentRegistrationApi
    createStudentBulkRegistrationApi: builder.mutation({
      query: (studentBulkRegisterApiData) => ({
        url: '/students/bulk-register/',
        method: 'POST',
        body: studentBulkRegisterApiData,
      }),
      invalidatesTags: ['studentBulkRegisterApi'],
    }),

  }),
});

// Export hooks for usage in components
export const {

  useCreateStudentBulkRegistrationApiMutation,

} = studentBulkRegisterApi;