import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function AddTForm() {
    const { t } = useTranslation();
    const [maritalStatus, setMaritalStatus] = useState("Single");

    return (
        <>
            <h5 className="text-textGray font-medium mt-6 mb-2">
                {t("module.teacher.personal_information")}
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 mb-6">
                {/* Avatar */}
                <div className="space-y-1">
                    <label className="text-textGray">{t("module.teacher.avatar")} :</label>
                    <input
                        className="block w-full cursor-pointer rounded bg-gray-100 text-textGray border-transparent focus:border-#DB9E30 focus:outline-none"
                        type="file"
                    />
                </div>

                {/* Name */}
                <div className="space-y-1">
                    <label className="text-textGray">{t("module.teacher.name")} :</label>
                    <input
                        type="text"
                        placeholder={t("module.teacher.enter_name")}
                        className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
                    />
                </div>

                {/* Gender */}
                <div className="space-y-2">
                    <label className="text-textGray">{t("module.teacher.gender")}</label>
                    <select
                        defaultValue="Male"
                        className="bg-bgGray w-full rounded px-1 py-2 border-2 text-textGray border-transparent focus:border-#DB9E30 focus:outline-none"
                    >
                        <option value="Male">{t("module.teacher.male")}</option>
                        <option value="Female">{t("module.teacher.female")}</option>
                        <option value="Other">{t("module.teacher.other")}</option>
                    </select>
                </div>

                {/* Blood Group */}
                <div className="space-y-2">
                    <label className="text-textGray">{t("module.teacher.blood_group")}</label>
                    <select
                        defaultValue="Select Blood Group"
                        className="bg-bgGray w-full rounded px-1 py-2 border-2 text-textGray border-transparent focus:border-#DB9E30 focus:outline-none"
                    >
                        <option value="Select Blood Group" disabled>
                            {t("module.teacher.select_blood_group")}
                        </option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                    </select>
                </div>

                {/* Additional fields with translations */}
                {/* Repeat similar structure for each field */}
                {/* ... */}

                {/* Marital Status */}
                <div className="space-y-2">
                    <label className="text-textGray">{t("module.teacher.marital_status")}</label>
                    <select
                        value={maritalStatus}
                        onChange={(e) => setMaritalStatus(e.target.value)}
                        className="bg-bgGray w-full rounded px-1 py-2 border-2 text-textGray border-transparent focus:border-#DB9E30 focus:outline-none"
                    >
                        <option value="Single">{t("module.teacher.single")}</option>
                        <option value="Married">{t("module.teacher.married")}</option>
                        <option value="Unmarried">{t("module.teacher.unmarried")}</option>
                        <option value="Widowed">{t("module.teacher.widowed")}</option>
                        <option value="Separated">{t("module.teacher.separated")}</option>
                        <option value="Divorced">{t("module.teacher.divorced")}</option>
                    </select>
                </div>

                { (maritalStatus === "Married" || maritalStatus === "Widowed") && (
                    <>
                        {/* Spouse Name */}
                        <div className="space-y-1">
                            <label className="text-textGray">{t("module.teacher.spouse_name")} :</label>
                            <input
                                type="text"
                                placeholder={t("module.teacher.enter_spouse_name")}
                                className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
                            />
                        </div>
                        {/* Additional fields for spouse */}
                        {/* ... */}
                    </>
                )}
            </div>

            <div className="flex justify-end mt-4 mb-2 md:mb-0">
                <button
                    type="submit"
                    className="rounded w-40 p-3 bg-#DB9E30 hover:bg-buttonHover text-white shadow-md  hover:-translate-y-[2px] duration-200"
                >
                    {t("module.teacher.submit")}
                </button>
            </div>
        </>
    );
}
