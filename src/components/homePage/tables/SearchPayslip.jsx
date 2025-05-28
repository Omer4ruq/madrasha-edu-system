import { useTranslation } from "react-i18next";

export default function SearchPayslip() {
  const { t } = useTranslation();

  return (
    <table className="bg-bgBlue w-full font-medium">
      <tbody>
        <tr className="border-b border-white">
          <td className="w-1/3 p-1 text-#DB9E30">{t("module.dashboard.student_name")}</td>
          <td className="w-2/3 text-textGray border-l border-white pl-2">
            Al Amin Sawon
          </td>
        </tr>
        <tr className="border border-white">
          <td className="w-1/3 p-1 text-#DB9E30">{t("module.dashboard.student_id")}</td>
          <td className="w-2/3 text-textGray border-l border-white pl-2">
            123456789
          </td>
        </tr>
        <tr className="border border-white">
          <td className="w-1/3 p-1 text-#DB9E30">{t("module.dashboard.student_class")}</td>
          <td className="w-2/3 text-textGray border-l border-white pl-2">
            Class One
          </td>
        </tr>
        <tr className="border border-white">
          <td className="w-1/3 p-1 text-#DB9E30">{t("module.dashboard.phone_no")}</td>
          <td className="w-2/3 text-textGray border-l border-white pl-2">
            01234567890
          </td>
        </tr>
        <tr className="border border-white">
          <td className="w-1/3 p-1 text-#DB9E30">{t("module.dashboard.due_month")}</td>
          <td className="w-2/3 text-textGray border-l border-white pl-2">
            April 2024
          </td>
        </tr>
        <tr className="border border-white">
          <td className="w-1/3 p-1 text-#DB9E30">{t("module.dashboard.due_date")}</td>
          <td className="w-2/3 text-textGray border-l border-white pl-2">
            12 May 2024
          </td>
        </tr>
        <tr className="border border-white">
          <td className="w-1/3 p-1 text-#DB9E30">{t("module.dashboard.fine_start_date")}</td>
          <td className="w-2/3 text-textGray border-l border-white pl-2">
            13 May 2024
          </td>
        </tr>
        <tr className="border border-white">
          <td className="w-1/3 p-1 text-#DB9E30">{t("module.dashboard.total_due_amount")}</td>
          <td className="w-2/3 text-textGray border-l border-white pl-2">
            4557
          </td>
        </tr>
        <tr className="border border-white">
          <td className="w-1/3 p-1 text-#DB9E30">{t("module.dashboard.fine_amount")}</td>
          <td className="w-2/3 text-textGray border-l border-white pl-2">0</td>
        </tr>
        <tr id="total-payable">
          <td className="w-1/3 p-1 text-#DB9E30">{t("module.dashboard.total_payable")}</td>
          <td className="w-2/3 text-textGray border-l border-white pl-2">
            4557
          </td>
        </tr>
      </tbody>
    </table>
  );
}
