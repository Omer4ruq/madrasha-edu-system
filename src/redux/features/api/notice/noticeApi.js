import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import BASE_URL from '../../../../utilitis/apiConfig';

const getToken = () => {
  return localStorage.getItem('token');
};

export const noticeApi = createApi({
  reducerPath: 'noticeApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      const token = getToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    //   headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['noticeApi'],
  endpoints: (builder) => ({
    // GET: Fetch all notices
    getNotices: builder.query({
      query: () => '/notices/',
      providesTags: ['noticeApi'],
    }),

    // GET: Fetch single notice by ID
    getNoticeById: builder.query({
      query: (id) => `/notices/${id}/`,
      providesTags: ['noticeApi'],
    }),

    // POST: Create a new notice
    createNotice: builder.mutation({
      query: (noticeData) => ({
        url: '/notices/',
        method: 'POST',
        body: noticeData,
      }),
      invalidatesTags: ['noticeApi'],
    }),

    // PUT: Update an existing notice
    updateNotice: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/notices/${id}/`,
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: ['noticeApi'],
    }),

    // PATCH: Partially update an existing notice
    patchNotice: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/notices/${id}/`,
        method: 'PATCH',
        body: formData,
      }),
      invalidatesTags: ['noticeApi'],
    }),

    // DELETE: Delete a notice
    deleteNotice: builder.mutation({
      query: (id) => ({
        url: `/notices/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['noticeApi'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetNoticesQuery,
  useGetNoticeByIdQuery,
  useCreateNoticeMutation,
  useUpdateNoticeMutation,
  usePatchNoticeMutation,
  useDeleteNoticeMutation,
} = noticeApi;