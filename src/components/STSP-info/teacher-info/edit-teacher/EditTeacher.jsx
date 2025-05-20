import { useState } from "react";
import { Link, useLoaderData } from "react-router-dom";
import EditTForm from "./EditTForm";
import { useTranslation } from "react-i18next";

export default function EditTeacher() {
  const teacher = useLoaderData();
  const [teacherData, setteacherData] = useState(teacher);

  const { t } = useTranslation();

  function handleChange(field, data) {
    setteacherData({ ...teacher, [field]: data.target.value });
  }

  return (
    <div className="my-4 rounded p-4 md:p-6 bg-white">
      <h3 className="text-2xl font-medium mb-4">
        {t("module.teacher.edit_teacher")}
      </h3>{" "}
      {/* Translated Edit Teacher */}
      <EditTForm teacherData={teacherData} handleChange={handleChange} />
      {/* form submit buttons */}
      <div className="flex justify-end items-center gap-4 mt-4 mb-2 md:mb-0">
        <button className="bg-blue w-24 py-2 rounded shadow text-white hover:-translate-y-[2px] duration-200">
          {t("module.teacher.save")} {/* Translated Save */}
        </button>

        <Link to="/teacher-info/teacher-list">
          <button className="bg-red w-24 py-2 rounded shadow text-white hover:-translate-y-[2px] duration-200">
            {t("module.teacher.cancel")} {/* Translated Cancel */}
          </button>
        </Link>
      </div>
    </div>
  );
}
