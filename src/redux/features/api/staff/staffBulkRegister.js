import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import BASE_URL from '../../../../utilitis/apiConfig';


const getToken = () => {
  return localStorage.getItem('token'); 
};

export const staffBulkRegister = createApi({
  reducerPath: 'staffBulkRegister',
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
  tagTypes: ['staffBulkRegister'],
  endpoints: (builder) => ({
  

  

    // POST: Create a new studentRegistrationApi
    createStaffsBulkRegistrationApi: builder.mutation({
      query: (staffBulkRegisterData) => ({
        url: '/staffs/bulk-register/',
        method: 'POST',
        body: staffBulkRegisterData,
      }),
      invalidatesTags: ['staffBulkRegister'],
    }),

  }),
});

// Export hooks for usage in components
export const {

  useCreateStaffsBulkRegistrationApiMutation,

} = staffBulkRegister;