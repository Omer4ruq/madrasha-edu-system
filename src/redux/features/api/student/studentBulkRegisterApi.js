import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import BASE_URL from '../../../../utilitis/apiConfig';

const getToken = () => {
  return localStorage.getItem('token');
};

export const studentBulkRegisterApi = createApi({
  reducerPath: 'studentBulkRegisterApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState, endpoint }) => {
      const token = getToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      // Only set Content-Type to application/json for non-file-upload endpoints
      if (endpoint !== 'createStudentBulkRegistrationApi') {
        headers.set('Content-Type', 'application/json');
      }
      return headers;
    },
  }),
  tagTypes: ['studentBulkRegisterApi'],
  endpoints: (builder) => ({
    // POST: Create a new student bulk registration
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