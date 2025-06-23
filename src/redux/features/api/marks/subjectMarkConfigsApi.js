import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = 'https://demo.easydr.xyz/api';

const getToken = () => {
  return localStorage.getItem('token');
};

export const subjectMarkConfigsApi = createApi({
  reducerPath: 'subjectMarkConfigsApi',
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
  tagTypes: ['SubjectMarkConfigs'],
  endpoints: (builder) => ({
    // GET: Fetch all subject mark configs
    getSubjectMarkConfigs: builder.query({
      query: () => '/subject-mark-configs/',
      providesTags: ['SubjectMarkConfigs'],
    }),

    // GET: Fetch a single config by ID
    getSubjectMarkConfigById: builder.query({
      query: (id) => `/subject-mark-configs/${id}/`,
      providesTags: ['SubjectMarkConfigs'],
    }),

    // POST: Create a new subject mark config
    createSubjectMarkConfig: builder.mutation({
      query: (configData) => ({
        url: '/subject-mark-configs/',
        method: 'POST',
        body: configData,
      }),
      invalidatesTags: ['SubjectMarkConfigs'],
    }),

    // PUT: Update an existing subject mark config
    updateSubjectMarkConfig: builder.mutation({
      query: ({  ...configData }) => ({
        url: `/subject-mark-configs/`,
        method: 'PUT',
        body: configData,
      }),
      invalidatesTags: ['SubjectMarkConfigs'],
    }),

    // PATCH: Partially update subject mark config
    patchSubjectMarkConfig: builder.mutation({
      query: ({ id, ...configData }) => ({
        url: `/subject-mark-configs/${id}/`,
        method: 'PATCH',
        body: configData,
      }),
      invalidatesTags: ['SubjectMarkConfigs'],
    }),

    // DELETE: Delete a subject mark config
    deleteSubjectMarkConfig: builder.mutation({
      query: (id) => ({
        url: `/subject-mark-configs/`,
        method: 'DELETE',
        body: { id },
      }),
      invalidatesTags: ['SubjectMarkConfigs'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetSubjectMarkConfigsQuery,
  useGetSubjectMarkConfigByIdQuery,
  useCreateSubjectMarkConfigMutation,
  useUpdateSubjectMarkConfigMutation,
  usePatchSubjectMarkConfigMutation,
  useDeleteSubjectMarkConfigMutation,
} = subjectMarkConfigsApi;