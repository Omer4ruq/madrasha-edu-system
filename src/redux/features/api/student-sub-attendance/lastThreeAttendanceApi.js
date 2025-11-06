import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import BASE_URL from '../../../../utilitis/apiConfig';

const getToken = () => localStorage.getItem('token');

export const lastThreeAttendanceApi = createApi({
  reducerPath: 'lastThreeAttendanceApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      const token = getToken();
      if (token) headers.set('Authorization', `Bearer ${token}`);
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['LastThreeAttendance'],

  endpoints: (builder) => ({
    getLastThreeAttendance: builder.query({
      query: ({ class_subject_id, class_id }) => {
        const params = new URLSearchParams();
        if (class_subject_id) params.set('class_subject_id', class_subject_id);
        if (class_id) params.set('class_id', class_id);
        return `/attendance-sub-last-three/?${params.toString()}`;
      },
      transformResponse: (res) => {
        if (Array.isArray(res)) return { attendance: res };
        return { attendance: res.results || res.attendance || [] };
      },
      providesTags: (result, error, arg) => [
        'LastThreeAttendance',
        { type: 'LastThreeAttendance', id: `${arg.class_subject_id}-${arg.class_id}` },
      ],
    }),
  }),
});

export const { useGetLastThreeAttendanceQuery } = lastThreeAttendanceApi;