import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Base URL for the API
const BASE_URL = 'https://demo.easydr.xyz/api';

// Helper function to get JWT token from localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

export const studentSubAttendanceApi = createApi({
  reducerPath: 'studentSubAttendanceApi',
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
  tagTypes: ['StudentSubAttendance'],
  endpoints: (builder) => ({
    // GET: Fetch student subject attendance by class_subject_id
    getStudentSubAttendance: builder.query({
      query: ({ class_subject_id, ...filters }) => {
        const queryParams = new URLSearchParams({
          class_subject_id: class_subject_id || '',
          ...Object.fromEntries(
            Object.entries(filters).filter(([_, v]) => v !== '' && v !== null)
          ),
        });
        return `/student-sub-attendance/?${queryParams.toString()}`;
      },
      transformResponse: (response) => ({
        attendance: response.results || response || [],
        total: response.count || 0,
        next: response.next || null,
        previous: response.previous || null,
      }),
      providesTags: ['StudentSubAttendance'],
    }),

    // POST: Create a new student subject attendance record
    createStudentSubAttendance: builder.mutation({
      query: (attendanceData) => ({
        url: '/student-sub-attendance/',
        method: 'POST',
        body: attendanceData,
      }),
      invalidatesTags: ['StudentSubAttendance'],
    }),

    // PUT: Update an existing student subject attendance record
    updateStudentSubAttendance: builder.mutation({
      query: ({ id, ...attendanceData }) => ({
        url: `/student-sub-attendance/${id}/`,
        method: 'PUT',
        body: attendanceData,
      }),
      invalidatesTags: ['StudentSubAttendance'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetStudentSubAttendanceQuery,
  useCreateStudentSubAttendanceMutation,
  useUpdateStudentSubAttendanceMutation,
} = studentSubAttendanceApi;