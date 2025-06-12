import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = 'https://demo.easydr.xyz/api';

const getToken = () => {
  return localStorage.getItem('token');
};

export const studentListApi = createApi({
  reducerPath: 'studentListApi',
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
  tagTypes: ['StudentList'],
  endpoints: (builder) => ({
    getStudentList: builder.query({
      query: ({ page = 1, 
        // page_size = 3,
         user_id, phone, class: className, section, shift, ...filters }) => {
        const queryParams = new URLSearchParams({
          page,
          // page_size,
          userid: user_id || '',
          phoneno: phone || '',
          class: className || '',
          section: section || '',
          shift: shift || '',
          ...Object.fromEntries(
            Object.entries(filters).filter(([_, v]) => v !== '' && v !== null)
          ),
        });
        return `/student-list/?${queryParams.toString()}`;
      },
      transformResponse: (response) => ({
        students: response.results,
        total: response.count,
        next: response.next,
        previous: response.previous,
      }),
      providesTags: ['StudentList'],
    }),

    getStudentListById: builder.query({
      query: (id) => `/student-list/${id}/`,
      providesTags: ['StudentList'],
    }),

    createStudentList: builder.mutation({
      query: (studentData) => ({
        url: '/student-list/',
        method: 'POST',
        body: studentData,
      }),
      invalidatesTags: ['StudentList'],
    }),

    updateStudentList: builder.mutation({
      query: ({ id, ...studentData }) => ({
        url: `/student-list/${id}/`,
        method: 'PUT',
        body: studentData,
      }),
      invalidatesTags: ['StudentList'],
    }),

    deleteStudentList: builder.mutation({
      query: (id) => ({
        url: `/student-list/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['StudentList'],
    }),
  }),
});

export const {
  useGetStudentListQuery,
  useGetStudentListByIdQuery,
  useCreateStudentListMutation,
  useUpdateStudentListMutation,
  useDeleteStudentListMutation,
} = studentListApi;