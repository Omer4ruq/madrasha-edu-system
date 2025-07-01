import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import BASE_URL from '../../../../utilitis/apiConfig';


const getToken = () => {
  return localStorage.getItem('token'); 
};

export const studentRegistrationApi = createApi({
  reducerPath: 'studentRegistrationApi',
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
  tagTypes: ['studentRegistrationApi'],
  endpoints: (builder) => ({
  

  

    // POST: Create a new studentRegistrationApi
    createStudentRegistrationApi: builder.mutation({
      query: (studentRegistrationApiData) => ({
        url: '/register/student/',
        method: 'POST',
        body: studentRegistrationApiData,
      }),
      invalidatesTags: ['studentRegistrationApi'],
    }),

  }),
});

// Export hooks for usage in components
export const {

  useCreateStudentRegistrationApiMutation,

} = studentRegistrationApi;