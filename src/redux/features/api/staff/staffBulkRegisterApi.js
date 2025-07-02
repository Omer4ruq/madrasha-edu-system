import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import BASE_URL from '../../../../utilitis/apiConfig';

const getToken = () => {
  return localStorage.getItem('token');
};

export const staffBulkRegisterApi = createApi({
  reducerPath: 'staffBulkRegisterApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState, endpoint }) => {
      const token = getToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      // Only set Content-Type to application/json for non-file-upload endpoints
      if (endpoint !== 'createStaffsBulkRegistrationApi') {
        headers.set('Content-Type', 'application/json');
      }
      return headers;
    },
  }),
  tagTypes: ['staffBulkRegisterApi'],
  endpoints: (builder) => ({
    // POST: Create a new staff bulk registration
    createStaffsBulkRegistrationApi: builder.mutation({
      query: (staffBulkRegisterData) => ({
        url: '/staffs/bulk-register/',
        method: 'POST',
        body: staffBulkRegisterData,
      }),
      invalidatesTags: ['staffBulkRegisterApi'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useCreateStaffsBulkRegistrationApiMutation,
} = staffBulkRegisterApi;