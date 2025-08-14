import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import BASE_URL from '../../../../utilitis/apiConfig';

const getToken = () => localStorage.getItem('token');

export const subjectConfigsApi = createApi({
  reducerPath: 'subjectConfigsApi',
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
  tagTypes: ['SubjectConfigs', 'SubjectConfigsRaw'],
  endpoints: (builder) => ({
    // GET: All subject configs
    getSubjectConfigs: builder.query({
      query: () => '/subject-configs/',
      providesTags: ['SubjectConfigs'],
    }),

    // GET: Single subject config by ID
    getSubjectConfigById: builder.query({
      query: (id) => `/subject-configs/?class_id=${id}`,
      providesTags: ['SubjectConfigs'],
    }),
    getSubjectConfigBySubject: builder.query({
      query: (subjectId) => `/subject-configs/?subject_id=${subjectId}`,
      providesTags: ['SubjectConfigs'],
    }),
    // POST: Create subject config
    createSubjectConfig: builder.mutation({
      query: (data) => ({
        url: '/subject-configs/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['SubjectConfigs'],
    }),

    // PUT: Update subject config
    updateSubjectConfig: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/subject-configs/${id}/`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['SubjectConfigs'],
    }),

    // PATCH: Partial update
    patchSubjectConfig: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/subject-configs/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['SubjectConfigs'],
    }),

    // DELETE: Remove subject config
    deleteSubjectConfig: builder.mutation({
      query: (id) => ({
        url: `/subject-configs/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SubjectConfigs'],
    }),

    // ✅ NEW: GET raw subject configs by class_id
    getRawSubjectConfigs: builder.query({
      query: (class_id) => `/subject-configs/raw/?class_id=${class_id}`,
      providesTags: ['SubjectConfigsRaw'],
    }),
  }),
});

export const {
  useGetSubjectConfigsQuery,
  useGetSubjectConfigByIdQuery,
  useCreateSubjectConfigMutation,
  useUpdateSubjectConfigMutation,
  usePatchSubjectConfigMutation,
  useDeleteSubjectConfigMutation,
  useGetRawSubjectConfigsQuery,
  useGetSubjectConfigBySubjectQuery,

} = subjectConfigsApi;