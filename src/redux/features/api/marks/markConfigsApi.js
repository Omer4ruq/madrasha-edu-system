import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import BASE_URL from '../../../../utilitis/apiConfig';

const getToken = () => localStorage.getItem('token');

export const markConfigsApi = createApi({
  reducerPath: 'markConfigsApi',
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
  tagTypes: ['MarkConfigs', 'FilteredMarkConfigs'],
  endpoints: (builder) => ({
    // GET: Fetch all mark configs
    getMarkConfigs: builder.query({
      query: () => '/mark-configs/',
      providesTags: ['MarkConfigs'],
    }),

    // GET: Fetch a single mark config by ID (path param)
    getMarkConfigById: builder.query({
      query: (id) => `/mark-configs/${id}/`,
      providesTags: ['MarkConfigs'],
    }),

    // GET: Fetch by class_id (query param)
    getMarkConfigByClass: builder.query({
      query: ({ class_id }) => `/mark-configs/?class_id=${class_id}`,
      providesTags: ['MarkConfigs'],
    }),

    // GET: Fetch by subject_id (query param)
    getMarkConfigBySubject: builder.query({
      query: (subjectId) => `/mark-configs/?subject_id=${subjectId}`,
      providesTags: ['MarkConfigs'],
    }),

    // GET: Filter by ID (query param)
    getMarkConfigByFilterId: builder.query({
      query: (id) => `/mark-configs/?id=${id}`,
      providesTags: ['MarkConfigs'],
    }),

    // POST: Create a new mark config
    createMarkConfig: builder.mutation({
      query: (data) => ({
        url: '/mark-configs/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['MarkConfigs'],
    }),

    // PUT: Update an existing mark config
    updateMarkConfig: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/mark-configs/${id}/`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['MarkConfigs'],
    }),

    // PATCH: Partially update a mark config
    patchMarkConfig: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/mark-configs/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['MarkConfigs'],
    }),

    // DELETE: Delete a mark config
    deleteMarkConfig: builder.mutation({
      query: (id) => ({
        url: `/mark-configs/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['MarkConfigs'],
    }),

    // GET: Filter by class_id and subject_conf
    getFilteredMarkConfigs: builder.query({
      query: ({ class_id, subject_conf }) =>
        `/mark-configs/?class_id=${class_id}&subject_conf=${subject_conf ? subject_conf : ''}`,
      providesTags: ['FilteredMarkConfigs'],
    }),
  }),
});

export const {
  useGetMarkConfigsQuery,
  useGetMarkConfigByIdQuery,
  useGetMarkConfigByClassQuery,
  useGetMarkConfigBySubjectQuery,
  useGetMarkConfigByFilterIdQuery,
  useCreateMarkConfigMutation,
  useUpdateMarkConfigMutation,
  usePatchMarkConfigMutation,
  useDeleteMarkConfigMutation,
  useGetFilteredMarkConfigsQuery,
} = markConfigsApi;
