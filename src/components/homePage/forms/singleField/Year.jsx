import { useTranslation } from "react-i18next";

export default function Year({ style }) {
  const {t} = useTranslation();
  return (
    <div className={`space-y-1 ${style}`}>
      <h5 className="font-bold ">{t('module.dashboard.year')}</h5>
      <select
        id="year"
        name="year"
        defaultValue="default"
        className="bg-bgGray w-full rounded px-1 py-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
      >
        <option value="default" disabled>
          select year
        </option>
        <option value="2022">2022</option>
        <option value="2023">2023</option>
        <option value="2024">2024</option>
      </select>
    </div>
  );
}
