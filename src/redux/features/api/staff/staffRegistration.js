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

    // POST: Create a new staff
    createStaffRegistrationApi: builder.mutation({
      query: (staffRegistrationApiData) => ({
        url: '/register/staff/',
        method: 'POST',
        body: staffRegistrationApiData,
      }),
      invalidatesTags: ['staffRegistrationApi'],
    }),

    // PUT: Update an existing staff
    updateStaffRegistrationApi: builder.mutation({
      query: ({ id, updatedData }) => ({
        url: `/register/staff/${id}/`, // Make sure your backend expects the ID in URL
        method: 'PUT',
        body: updatedData,
      }),
      invalidatesTags: ['staffRegistrationApi'],
    }),

  }),
});

// Export hooks for usage in components
export const {
  useCreateStaffRegistrationApiMutation,
  useUpdateStaffRegistrationApiMutation,
} = staffRegistrationApi;
