import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import BASE_URL from '../../../../utilitis/apiConfig';

const getToken = () => {
  return localStorage.getItem('token');
};

export const staffRegistrationApi = createApi({
  reducerPath: 'staffRegistrationApi',
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
  tagTypes: ['staffRegistrationApi'],
  endpoints: (builder) => ({
  

  

    // POST: Create a new staffRegistrationApi
    createStaffRegistrationApi: builder.mutation({
      query: (staffRegistrationApiData) => ({
        url: '/register/staff/',
        method: 'POST',
        body: staffRegistrationApiData,
      }),
      invalidatesTags: ['staffRegistrationApi'],
    }),

  }),
});

// Export hooks for usage in components
export const {

  useCreateStaffRegistrationApiMutation,

} = staffRegistrationApi;