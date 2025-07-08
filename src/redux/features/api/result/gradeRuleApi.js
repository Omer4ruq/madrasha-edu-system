import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import BASE_URL from '../../../../utilitis/apiConfig';

const getToken = () => {
  return localStorage.getItem('token');
};

export const gradeRuleApi = createApi({
  reducerPath: 'gradeRuleApi',
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
  tagTypes: ['GradeRule'],
  endpoints: (builder) => ({
    // GET: Fetch all grade rules
    getGradeRules: builder.query({
      query: () => '/graderule/',
      providesTags: ['GradeRule'],
    }),

    // GET: Fetch a single grade rule by ID
    getGradeRuleById: builder.query({
      query: (id) => `/graderule/${id}/`,
      providesTags: ['GradeRule'],
    }),

    // POST: Create a new grade rule
    createGradeRule: builder.mutation({
      query: (gradeRuleData) => ({
        url: '/graderule/',
        method: 'POST',
        body: gradeRuleData,
      }),
      invalidatesTags: ['GradeRule'],
    }),

    // PUT: Update an existing grade rule
    updateGradeRule: builder.mutation({
      query: ({ id, ...gradeRuleData }) => ({
        url: `/graderule/${id}/`,
        method: 'PUT',
        body: gradeRuleData,
      }),
      invalidatesTags: ['GradeRule'],
    }),

    // PATCH: Partially update a grade rule
    patchGradeRule: builder.mutation({
      query: ({ id, ...gradeRuleData }) => ({
        url: `/graderule/${id}/`,
        method: 'PATCH',
        body: gradeRuleData,
      }),
      invalidatesTags: ['GradeRule'],
    }),

    // DELETE: Delete a grade rule
    deleteGradeRule: builder.mutation({
      query: (id) => ({
        url: `/graderule/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['GradeRule'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetGradeRulesQuery,
  useGetGradeRuleByIdQuery,
  useCreateGradeRuleMutation,
  useUpdateGradeRuleMutation,
  usePatchGradeRuleMutation,
  useDeleteGradeRuleMutation,
} = gradeRuleApi;