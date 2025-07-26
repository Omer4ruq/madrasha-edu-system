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
      query: ({ id, noticeData }) => {
        const formData = new FormData();
        formData.append('notice_title', noticeData.notice_title.trim());
        formData.append('date', noticeData.date);
        formData.append('notice_description', noticeData.notice_description.trim());
        formData.append('expire_date', noticeData.expire_date);
        formData.append('academic_year', noticeData.academic_year);
        if (noticeData.file_attached) {
          formData.append('file_attached', noticeData.file_attached);
        } else if (noticeData.existing_file) {
          formData.append('file_attached', noticeData.existing_file); // Retain existing file URL if no new file
        }

        return {
          url: `/notices/${id}/`,
          method: 'PUT',
          body: formData,
        };
      },
      invalidatesTags: ['noticeApi'],
    }),

    // PATCH: Partially update an existing notice
    patchNotice: builder.mutation({
      query: ({ id, ...noticeData }) => ({
        url: `/notices/${id}/`,
        method: 'PATCH',
        body: noticeData,
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