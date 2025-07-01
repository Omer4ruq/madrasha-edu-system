import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import BASE_URL from '../../../../utilitis/apiConfig';



const getToken = () => {
  return localStorage.getItem('token');
};

export const studentActiveApi = createApi({
  reducerPath: 'studentActiveApi',
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
  tagTypes: ['studentActiveApi'],
  endpoints: (builder) => ({
    // GET: Fetch all active students
    getStudentActiveApi: builder.query({
      query: () => '/active-students/',
      providesTags: ['studentActiveApi'],
    }),

    // GET: Fetch active students by class ID
    getStudentActiveByClass: builder.query({
      query: (classId) => `/active-students/?class_id=${classId}`,
      providesTags: ['studentActiveApi'],
    }),

    // GET: Fetch single active student by ID
    getStudentActiveApiById: builder.query({
      query: (id) => `/active-students/${id}/`,
      providesTags: ['studentActiveApi'],
    }),

    // POST: Create a new active student
    createStudentActiveApi: builder.mutation({
      query: (studentActiveApiData) => ({
        url: '/active-students/',
        method: 'POST',
        body: studentActiveApiData,
      }),
      invalidatesTags: ['studentActiveApi'],
    }),

    // PUT: Update an existing active student
    updateStudentActiveApi: builder.mutation({
      query: ({ id, ...studentActiveApiData }) => ({
        url: `/active-students/${id}/`,
        method: 'PUT',
        body: studentActiveApiData,
      }),
      invalidatesTags: ['studentActiveApi'],
    }),

    // DELETE: Delete an active student
    deleteStudentActiveApi: builder.mutation({
      query: (id) => ({
        url: `/active-students/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['studentActiveApi'],
    }),
  }),
});

export const {
  useGetStudentActiveApiQuery,
  useGetStudentActiveByClassQuery,
  useGetStudentActiveApiByIdQuery,
  useCreateStudentActiveApiMutation,
  useUpdateStudentActiveApiMutation,
  useDeleteStudentActiveApiMutation,
} = studentActiveApi;