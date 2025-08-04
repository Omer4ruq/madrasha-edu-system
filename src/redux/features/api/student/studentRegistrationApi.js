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
      // headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['studentRegistrationApi'],
  endpoints: (builder) => ({
    // POST: Create a new student
    createStudentRegistrationApi: builder.mutation({
      query: (studentRegistrationApiData) => ({
        url: '/register/student/',
        method: 'POST',
        body: studentRegistrationApiData,
      }),
      invalidatesTags: ['studentRegistrationApi'],
    }),

    // PUT: Update an existing student
    updateStudentRegistrationApi: builder.mutation({
      query: ({ id, updatedData }) => ({
        url: `/register/student/${id}/`,
        method: 'PATCH',
        body: updatedData,
      }),
      invalidatesTags: ['studentRegistrationApi'],
    }),

    // GET: Fetch student by ID using query parameter
    getStudentById: builder.query({
      query: (id) => `/register/student/?id=${id}`,
      providesTags: ['studentRegistrationApi'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useCreateStudentRegistrationApiMutation,
  useUpdateStudentRegistrationApiMutation,
  useGetStudentByIdQuery,
} = studentRegistrationApi;