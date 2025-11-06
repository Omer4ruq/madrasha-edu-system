import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import BASE_URL from '../../../../utilitis/apiConfig';

const getToken = () => localStorage.getItem('token');

export const studentSubAttendanceApi = createApi({
  reducerPath: 'studentSubAttendanceApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      const token = getToken();
      if (token) headers.set('Authorization', `Bearer ${token}`);
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['StudentSubAttendance'],

  endpoints: (builder) => ({
    getStudentSubAttendance: builder.query({
      query: ({ class_subject_id, class_id, date }) => {
        const params = new URLSearchParams();
        if (class_subject_id) params.set('class_subject_id', class_subject_id);
        if (class_id) params.set('class_id', class_id);
        if (date) params.set('date', date);
        return `/student-sub-attendance/?${params.toString()}`;
      },
      transformResponse: (res) => {
        if (Array.isArray(res)) return { attendance: res };
        return { attendance: res.results || res.attendance || [] };
      },
      providesTags: (result, error, arg) => [
        'StudentSubAttendance',
        { type: 'StudentSubAttendance', id: `${arg.class_subject_id}-${arg.class_id}-${arg.date}` },
      ],
    }),

    createStudentSubAttendance: builder.mutation({
      query: (payload) => ({
        url: '/student-sub-attendance/',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: (result, error, arg) => [
        'StudentSubAttendance',
        { type: 'StudentSubAttendance', id: `${arg.class_subject_id}-${arg.class_id}-${arg.date || new Date().toISOString().split('T')[0]}` },
      ],
    }),

    updateStudentSubAttendance: builder.mutation({
      query: (payload) => ({
        url: '/student-sub-attendance/',
        method: 'PUT',
        body: payload,
      }),
      invalidatesTags: (result, error, arg) => [
        'StudentSubAttendance',
        { type: 'StudentSubAttendance', id: `${arg.class_subject_id}-${arg.class_id}-${arg.date || new Date().toISOString().split('T')[0]}` },
      ],
    }),
  }),
});

export const {
  useGetStudentSubAttendanceQuery,
  useCreateStudentSubAttendanceMutation,
  useUpdateStudentSubAttendanceMutation,
} = studentSubAttendanceApi;