import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Base URL for the API
const BASE_URL = 'https://demo.easydr.xyz/api';

// Helper function to get JWT token from localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

export const subjectAssignApi = createApi({
  reducerPath: 'subjectAssignApi',
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
  tagTypes: ['SubjectAssign'],
  endpoints: (builder) => ({
    // GET: Fetch subject assignments by class_id
    getSubjectAssign: builder.query({
      query: ({ class_id, ...filters }) => {
        const queryParams = new URLSearchParams({
          class_id: class_id || '',
          ...Object.fromEntries(
            Object.entries(filters).filter(([_, v]) => v !== '' && v !== null)
          ),
        });
        return `/subject-assign/?${queryParams.toString()}`;
      },
      transformResponse: (response) => ({
        subjects: response.results || response || [],
        total: response.count || 0,
        next: response.next || null,
        previous: response.previous || null,
      }),
      providesTags: ['SubjectAssign'],
    }),

    // GET: Fetch single subject assignment by ID
    getSubjectAssignById: builder.query({
      query: (id) => `/subject-assign/${id}/`,
      providesTags: ['SubjectAssign'],
    }),

    // POST: Create a new subject assignment
    createSubjectAssign: builder.mutation({
      query: (subjectData) => ({
        url: '/subject-assign/',
        method: 'POST',
        body: subjectData,
      }),
      invalidatesTags: ['SubjectAssign'],
    }),

    // PUT: Fully update an existing subject assignment
    updateSubjectAssign: builder.mutation({
      query: ({ id, ...subjectData }) => ({
        url: `/subject-assign/${id}/`,
        method: 'PUT',
        body: subjectData,
      }),
      invalidatesTags: ['SubjectAssign'],
    }),

    // PATCH: Partially update an existing subject assignment
    patchSubjectAssign: builder.mutation({
      query: ({ id, ...subjectData }) => ({
        url: `/subject-assign/${id}/`,
        method: 'PATCH',
        body: subjectData,
      }),
      invalidatesTags: ['SubjectAssign'],
    }),

    // DELETE: Delete a subject assignment
    deleteSubjectAssign: builder.mutation({
      query: (id) => ({
        url: `/subject-assign/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SubjectAssign'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetSubjectAssignQuery,
  useGetSubjectAssignByIdQuery,
  useCreateSubjectAssignMutation,
  useUpdateSubjectAssignMutation,
  usePatchSubjectAssignMutation,
  useDeleteSubjectAssignMutation,
} = subjectAssignApi;