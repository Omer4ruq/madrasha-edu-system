import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import BASE_URL from '../../../../utilitis/apiConfig';

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
    // GET: Fetch student subject attendance with all filter options
    getStudentSubAttendance: builder.query({
      query: ({ class_subject_id, class_id, academic_year_id, student_id, date, start_date, end_date, month }) => {
        const queryParams = new URLSearchParams();
        // Add filters only if they are provided and valid
        if (class_subject_id) queryParams.set('class_subject_id', class_subject_id);
        if (class_id) queryParams.set('class_id', class_id);
        if (academic_year_id) queryParams.set('academic_year_id', academic_year_id);
        if (student_id) queryParams.set('student_id', student_id);
        if (date) queryParams.set('date', date);
        if (start_date) queryParams.set('start_date', start_date);
        if (end_date) queryParams.set('end_date', end_date);
        if (month) queryParams.set('month', month);

        return `/student-sub-attendance/?${queryParams.toString()}`;
      },
      transformResponse: (response) => {
        // Handle both paginated and non-paginated responses
        if (Array.isArray(response)) {
          // Non-paginated response (like your sample)
          return {
            attendance: response,
            total: response.length,
            next: null,
            previous: null,
          };
        }
        // Paginated response (if applicable)
        return {
          attendance: response.results || response || [],
          total: response.count || 0,
          next: response.next || null,
          previous: response.previous || null,
        };
      },
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