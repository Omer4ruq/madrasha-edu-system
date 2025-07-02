import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import BASE_URL from '../../../../utilitis/apiConfig';


const getToken = () => {
  return localStorage.getItem('token');
};

export const examRoutineApi = createApi({
  reducerPath: 'examRoutineApi',
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
  tagTypes: ['ExamSchedules'],
  endpoints: (builder) => ({
    getExamSchedules: builder.query({
      query: ({ exam_name, class_name, academic_year }) => ({
        url: '/exam-schedules/',
        params: { exam_name, class_name, academic_year },
      }),
      providesTags: ['ExamSchedules'],
    }),
    getExamSchedulesById: builder.query({
      query: (id) => `/exam-schedules/${id}/`,
      providesTags: ['ExamSchedules'],
    }),
    createExamSchedules: builder.mutation({
      query: (routineData) => ({
        url: '/exam-schedules/',
        method: 'POST',
        body: routineData,
      }),
      invalidatesTags: ['ExamSchedules'],
    }),
    updateExamSchedules: builder.mutation({
      query: ({ id, exam_date, start_time, end_time, exam_name, class_name, subject_id, academic_year }) => ({
        url: `/exam-schedules/${id}/`,
        method: 'PUT',
        body: { exam_date, start_time, end_time, exam_name, class_name, subject_id, academic_year },
      }),
      invalidatesTags: ['ExamSchedules'],
    }),
    deleteExamSchedules: builder.mutation({
      query: (id) => ({
        url: `/exam-schedules/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ExamSchedules'],
    }),
  }),
});

export const {
  useGetExamSchedulesQuery,
  useGetExamSchedulesByIdQuery,
  useCreateExamSchedulesMutation,
  useUpdateExamSchedulesMutation,
  useDeleteExamSchedulesMutation,
} = examRoutineApi;