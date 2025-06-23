import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = 'https://demo.easydr.xyz/api';

const getToken = () => {
  return localStorage.getItem('token');
};

export const classSubjectsApi = createApi({
  reducerPath: 'classSubjectsApi',
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
  tagTypes: ['ClassSubjects'],
  endpoints: (builder) => ({
    // GET: Fetch all class subjects
    getClassSubjects: builder.query({
      query: () => '/class-subjects/',
      providesTags: ['ClassSubjects'],
    }),

    // GET: Fetch a single class subject by ID
    getClassSubjectById: builder.query({
      query: (id) => `/class-subjects/${id}/`,
      providesTags: ['ClassSubjects'],
    }),
  getClassSubjectsByClassId: builder.query({
      query: (classId) => `class-subjects/?class_subject__class_id=${classId}`,
    }),

    // POST: Create a new class subject
    createClassSubject: builder.mutation({
      query: (classSubjectData) => ({
        url: '/class-subjects/',
        method: 'POST',
        body: classSubjectData,
      }),
      invalidatesTags: ['ClassSubjects'],
    }),

    // PUT: Update an existing class subject
    updateClassSubject: builder.mutation({
      query: ({ id, ...classSubjectData }) => ({
        url: `/class-subjects/${id}/`,
        method: 'PUT',
        body: classSubjectData,
      }),
      invalidatesTags: ['ClassSubjects'],
    }),

    // PATCH: Partially update a class subject
    patchClassSubject: builder.mutation({
      query: ({ id, ...classSubjectData }) => ({
        url: `/class-subjects/${id}/`,
        method: 'PATCH',
        body: classSubjectData,
      }),
      invalidatesTags: ['ClassSubjects'],
    }),

    // DELETE: Delete a class subject
    deleteClassSubject: builder.mutation({
      query: (id) => ({
        url: `/class-subjects/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ClassSubjects'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetClassSubjectsQuery,
  useGetClassSubjectByIdQuery,
  useCreateClassSubjectMutation,
  useUpdateClassSubjectMutation,
  usePatchClassSubjectMutation,
  useDeleteClassSubjectMutation,
  useGetClassSubjectsByClassIdQuery,
} = classSubjectsApi;