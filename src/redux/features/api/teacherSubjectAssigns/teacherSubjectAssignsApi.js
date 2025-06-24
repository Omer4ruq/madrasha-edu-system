import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = 'https://demo.easydr.xyz/api';

const getToken = () => {
  return localStorage.getItem('token');
};

export const teacherSubjectAssignsApi = createApi({
  reducerPath: 'teacherSubjectAssignsApi',
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
  tagTypes: ['TeacherSubjectAssigns'],
  endpoints: (builder) => ({
    // GET: Fetch all teacher subject assignments
    getTeacherSubjectAssigns: builder.query({
      query: () => '/teacher-subject-assign/',
      providesTags: ['TeacherSubjectAssigns'],
    }),

    // GET: Fetch by class_id and subject_id
    getTeacherSubjectAssignsByClassAndSubject: builder.query({
      query: ({ classId, subjectId }) =>
        `/teacher-subject-assign/?class_id=${classId}&subject_id=${subjectId}`,
      providesTags: ['TeacherSubjectAssigns'],
    }),

    // GET: Fetch a single assignment by ID
    getTeacherSubjectAssignById: builder.query({
      query: (id) => `/teacher-subject-assign/${id}/`,
      providesTags: ['TeacherSubjectAssigns'],
    }),

    // POST: Create a new assignment
    createTeacherSubjectAssign: builder.mutation({
      query: (assignmentData) => ({
        url: '/teacher-subject-assign/',
        method: 'POST',
        body: assignmentData,
      }),
      invalidatesTags: ['TeacherSubjectAssigns'],
    }),

    // PUT: Update an assignment by ID
    updateTeacherSubjectAssign: builder.mutation({
      query: ({ id, ...assignmentData }) => ({
        url: `/teacher-subject-assign/${id}/`,
        method: 'PUT',
        body: assignmentData,
      }),
      invalidatesTags: ['TeacherSubjectAssigns'],
    }),

    // PATCH: Partially update assignment
    patchTeacherSubjectAssign: builder.mutation({
      query: ({ id, ...assignmentData }) => ({
        url: `/teacher-subject-assign/${id}/`,
        method: 'PATCH',
        body: assignmentData,
      }),
      invalidatesTags: ['TeacherSubjectAssigns'],
    }),

    // DELETE: Remove an assignment
    deleteTeacherSubjectAssign: builder.mutation({
      query: (id) => ({
        url: `/teacher-subject-assign/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['TeacherSubjectAssigns'],
    }),
  }),
});

export const {
  useGetTeacherSubjectAssignsQuery,
  useGetTeacherSubjectAssignsByClassAndSubjectQuery,
  useGetTeacherSubjectAssignByIdQuery,
  useCreateTeacherSubjectAssignMutation,
  useUpdateTeacherSubjectAssignMutation,
  usePatchTeacherSubjectAssignMutation,
  useDeleteTeacherSubjectAssignMutation,
} = teacherSubjectAssignsApi;