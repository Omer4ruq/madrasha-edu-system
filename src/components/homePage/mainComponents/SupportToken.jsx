import { useTranslation } from "react-i18next";
import SectionHeader from "../common/SectionHeader";
import SupportForm from "../forms/SupportForm";


export default function SupportToken() {
  const { t } = useTranslation();
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
      {/* support token */}
      <div className="rounded-md text-sm bg-white">
        <SectionHeader title={t("module.dashboard.support_token")} />
        <SupportForm />
      </div>

      {/* ads */}
      <div>
        <img src="/images/ad1.jpg" alt="" className="w-full" />
        <img src="/images/ad2.jpg" alt="" className="w-full" />
      </div>
    </div>
  );
}
