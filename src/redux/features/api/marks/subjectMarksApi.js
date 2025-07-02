import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import BASE_URL from '../../../../utilitis/apiConfig';


const getToken = () => {
  return localStorage.getItem('token');
};

export const subjectMarksApi = createApi({
  reducerPath: 'subjectMarksApi',
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
  tagTypes: ['SubjectMarks'],
  endpoints: (builder) => ({
    // GET: Fetch all subject marks
    getSubjectMarks: builder.query({
      query: () => '/subject-marks/',
      providesTags: ['SubjectMarks'],
    }),

    // GET: Fetch a single subject mark by ID
    getSubjectMarkById: builder.query({
      query: (id) => `/subject-marks/${id}/`,
      providesTags: ['SubjectMarks'],
    }),

    // POST: Create a new subject mark
    createSubjectMark: builder.mutation({
      query: (markData) => ({
        url: '/subject-marks/',
        method: 'POST',
        body: markData,
      }),
      invalidatesTags: ['SubjectMarks'],
    }),

    // PUT: Update an existing subject mark
    updateSubjectMark: builder.mutation({
      query: ({ id, ...markData }) => ({
        url: `/subject-marks/${id}/`,
        method: 'PUT',
        body: markData,
      }),
      invalidatesTags: ['SubjectMarks'],
    }),

    // PATCH: Partially update a subject mark
    patchSubjectMark: builder.mutation({
      query: ({ id, ...markData }) => ({
        url: `/subject-marks/${id}/`,
        method: 'PATCH',
        body: markData,
      }),
      invalidatesTags: ['SubjectMarks'],
    }),

    // DELETE: Delete a subject mark
    deleteSubjectMark: builder.mutation({
      query: (id) => ({
        url: `/subject-marks/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SubjectMarks'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetSubjectMarksQuery,
  useGetSubjectMarkByIdQuery,
  useCreateSubjectMarkMutation,
  useUpdateSubjectMarkMutation,
  usePatchSubjectMarkMutation,
  useDeleteSubjectMarkMutation,
} = subjectMarksApi;