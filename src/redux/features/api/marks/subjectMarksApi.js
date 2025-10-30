import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import BASE_URL from '../../../../utilitis/apiConfig';

const getToken = () => localStorage.getItem('token');

export const subjectMarksApi = createApi({
  reducerPath: 'subjectMarksApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      const token = getToken();
      if (token) headers.set('Authorization', `Bearer ${token}`);
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['SubjectMarks'],
  endpoints: (builder) => ({
    // GET: Filter by exam, class, subject
    getFilteredSubjectMarks: builder.query({
      query: ({ exam_id, class_id, subject_id }) => {
        const params = new URLSearchParams();
        if (exam_id) params.append('exam_id', exam_id);
        if (class_id) params.append('class_id', class_id);
        if (subject_id) params.append('subject_id', subject_id);
        return `/subject-marks/?${params.toString()}`;
      },
      providesTags: (result, error, arg) => 
        arg ? [{ type: 'SubjectMarks', id: `${arg.exam_id}-${arg.class_id}-${arg.subject_id}` }] : ['SubjectMarks'],
    }),

    getSubjectMarkById: builder.query({
      query: (id) => `/subject-marks/${id}/`,
      providesTags: (result, error, id) => [{ type: 'SubjectMarks', id }],
    }),

    createSubjectMark: builder.mutation({
      query: (markData) => ({
        url: '/subject-marks/',
        method: 'POST',
        body: markData,
      }),
      invalidatesTags: (result, error, { exam, class_id }) => 
        [{ type: 'SubjectMarks', id: `${exam}-${class_id}` }],
    }),

    updateSubjectMark: builder.mutation({
      query: ({ id, ...markData }) => ({
        url: `/subject-marks/${id}/`,
        method: 'PUT',
        body: markData,
      }),
      invalidatesTags: (result, error, { exam, class_id }) => 
        [{ type: 'SubjectMarks', id: `${exam}-${class_id}` }],
    }),

    patchSubjectMark: builder.mutation({
      query: ({ id, ...markData }) => ({
        url: `/subject-marks/${id}/`,
        method: 'PATCH',
        body: markData,
      }),
      invalidatesTags: (result, error, { exam, class_id }) => 
        [{ type: 'SubjectMarks', id: `${exam}-${class_id}` }],
    }),

    deleteSubjectMark: builder.mutation({
      query: (id) => ({
        url: `/subject-marks/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: () => ['SubjectMarks'],
    }),
  }),
});

export const {
  useGetFilteredSubjectMarksQuery,
  useGetSubjectMarkByIdQuery,
  useCreateSubjectMarkMutation,
  useUpdateSubjectMarkMutation,
  usePatchSubjectMarkMutation,
  useDeleteSubjectMarkMutation,
} = subjectMarksApi;