import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = 'https://demo.easydr.xyz/api';

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
  tagTypes: ['ExamSchedules'], // Consistent tag type
  endpoints: (builder) => ({
    // GET: Fetch all exam schedules
    getExamSchedules: builder.query({
      query: () => '/exam-schedules/',
      providesTags: ['ExamSchedules'],
    }),

    // GET: Fetch a single exam schedule by ID
    getExamSchedulesById: builder.query({
      query: (id) => `/exam-schedules/${id}/`,
      providesTags: ['ExamSchedules'],
    }),

    // POST: Create a new exam schedule
    createExamSchedules: builder.mutation({
      query: (routineData) => ({
        url: '/exam-schedules/',
        method: 'POST',
        body: routineData,
      }),
      invalidatesTags: ['ExamSchedules'],
    }),

    // PUT: Update an existing exam schedule
    updateExamSchedules: builder.mutation({
      query: ({ id, ...routineData }) => ({
        url: `/exam-schedules/${id}/`,
        method: 'PUT',
        body: routineData,
      }),
      invalidatesTags: ['ExamSchedules'],
    }),

    // PATCH: Partially update exam schedule
    patchExamSchedules: builder.mutation({
      query: ({ id, ...routineData }) => ({
        url: `/exam-schedules/${id}/`,
        method: 'PATCH',
        body: routineData,
      }),
      invalidatesTags: ['ExamSchedules'],
    }),

    // DELETE: Delete an exam schedule
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
  usePatchExamSchedulesMutation,
  useDeleteExamSchedulesMutation,
} = examRoutineApi;