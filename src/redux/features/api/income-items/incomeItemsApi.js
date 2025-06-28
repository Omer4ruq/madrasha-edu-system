import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = "https://demo.easydr.xyz/api";

const getToken = () => {
  return localStorage.getItem("token");
};

export const incomeItemsApi = createApi({
  reducerPath: "incomeItemsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { endpoint }) => {
      const token = getToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      // Only set Content-Type to JSON for non-file-upload endpoints
      if (endpoint !== "createIncomeItem" && endpoint !== "updateIncomeItem") {
        headers.set("Content-Type", "application/json");
      }
      return headers;
    },
  }),
  tagTypes: ["IncomeItems"],
  endpoints: (builder) => ({
    getIncomeItems: builder.query({
      query: ({ page = 1 } = {}) => `/income-items/?page=${page}`,
      providesTags: ["IncomeItems"],
      transformResponse: (response) => {
        return {
          count: response.count,
          next: response.next,
          previous: response.previous,
          results: response.results,
        };
      },
    }),
    getAllIncomeItems: builder.query({
      async queryFn(_arg, { dispatch }, _extraOptions, fetchWithBQ) {
        let allResults = [];
        let nextPage = `${BASE_URL}/income-items/?page=1`;
        let page = 1;

        while (nextPage) {
          try {
            const response = await fetchWithBQ(`/income-items/?page=${page}`);
            if (response.error) {
              throw response.error;
            }
            const data = response.data;
            allResults = [...allResults, ...data.results];
            nextPage = data.next;
            page += 1;
          } catch (error) {
            return { error };
          }
        }

        return {
          data: {
            count: allResults.length,
            next: null,
            previous: null,
            results: allResults,
          },
        };
      },
      providesTags: ["IncomeItems"],
    }),
    getIncomeItemById: builder.query({
      query: (id) => `/income-items/${id}/`,
      providesTags: ["IncomeItems"],
    }),
    createIncomeItem: builder.mutation({
      query: (incomeItemData) => {
        const formData = new FormData();
        Object.entries(incomeItemData).forEach(([key, value]) => {
          if (key === "attach_doc" && value instanceof File) {
            formData.append(key, value);
          } else if (value !== null && value !== undefined) {
            // Ensure numeric fields are sent as numbers
            if (
              [
                "incometype_id",
                "fund_id",
                "transaction_book_id",
                "transaction_number",
                "academic_year",
                "created_by",
                "updated_by",
              ].includes(key)
            ) {
              formData.append(key, parseInt(value));
            } else if (key === "amount") {
              formData.append(key, parseFloat(value));
            } else {
              formData.append(key, value);
            }
          }
        });
        return {
          url: "/income-items/",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["IncomeItems"],
    }),
    updateIncomeItem: builder.mutation({
      query: ({ id, ...incomeItemData }) => {
        const formData = new FormData();
        Object.entries(incomeItemData).forEach(([key, value]) => {
          if (key === "attach_doc" && value instanceof File) {
            formData.append(key, value);
          } else if (value !== null && value !== undefined) {
            // Ensure numeric fields are sent as numbers
            if (
              [
                "incometype_id",
                "fund_id",
                "transaction_book_id",
                "transaction_number",
                "academic_year",
                "created_by",
                "updated_by",
              ].includes(key)
            ) {
              formData.append(key, parseInt(value));
            } else if (key === "amount") {
              formData.append(key, parseFloat(value));
            } else {
              formData.append(key, value);
            }
          }
        });
        return {
          url: `/income-items/${id}/`,
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: ["IncomeItems"],
    }),
    deleteIncomeItem: builder.mutation({
      query: (id) => ({
        url: `/income-items/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["IncomeItems"],
    }),
  }),
});

export const {
  useGetIncomeItemsQuery,
  useGetAllIncomeItemsQuery,
  useGetIncomeItemByIdQuery,
  useCreateIncomeItemMutation,
  useUpdateIncomeItemMutation,
  useDeleteIncomeItemMutation,
} = incomeItemsApi;