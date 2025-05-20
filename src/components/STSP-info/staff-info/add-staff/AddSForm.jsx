import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function AddSForm() {
  const [maritalStatus, setMaritalStatus] = useState("Single");

  const { t } = useTranslation();

  return (
    <>
      <h5 className="text-textGray font-medium mt-6 mb-2">
        {t("module.communication.personal_information")}
      </h5>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 mb-6">
        {/* Avatar */}
        <div className="space-y-1">
          <label className="text-textGray" htmlFor="">
            {t("module.communication.avatar")}:
          </label>
          <input
            className="block w-full cursor-pointer rounded bg-gray-100 text-textGray border-transparent focus:border-primary focus:outline-none"
            aria-describedby=""
            id=""
            type="file"
          />
        </div>

        {/* Name */}
        <div className="space-y-1">
          <label className="text-textGray">
            {t("module.communication.name")}:
          </label>
          <input
            type="text"
            placeholder={t("module.communication.enter_name")}
            className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-primary focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-textGray">
            {t("module.communication.gender")}
          </label>
          <select
            id=""
            name=""
            defaultValue="Male"
            className="bg-bgGray w-full rounded px-1 py-2 border-2 text-textGray border-transparent focus:border-primary focus:outline-none"
          >
            <option value="Male">{t("module.communication.male")}</option>
            <option value="Female">{t("module.communication.female")}</option>
            <option value="Other">{t("module.communication.other")}</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-textGray">
            {t("module.communication.blood_group")}
          </label>
          <select
            id=""
            name=""
            defaultValue={t("module.communication.select_blood_group")}
            className="bg-bgGray w-full rounded px-1 py-2 border-2 text-textGray border-transparent focus:border-primary focus:outline-none"
          >
            <option value={t("module.communication.select_blood_group")} disabled>
              {t("module.communication.select_blood_group")}
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

        {/* Phone Number */}
        <div className="space-y-1">
          <label className="text-textGray">
            {t("module.communication.phone_number")}:
          </label>
          <input
            type="text"
            placeholder={t("module.communication.enter_phone_umber")}
            className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-primary focus:outline-none"
          />
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="text-textGray">
            {t("module.communication.email")}:
          </label>
          <input
            type="text"
            placeholder={t("module.communication.enter_email")}
            className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-primary focus:outline-none"
          />
        </div>

        {/* NID */}
        <div className="space-y-1">
          <label className="text-textGray">
            {t("module.communication.nid")}:
          </label>
          <input
            type="text"
            placeholder={t("module.communication.enter_nid")}
            className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-primary focus:outline-none"
          />
        </div>

        {/* Date of Birth */}
        <div className="space-y-1">
          <label className="text-textGray">
            {t("module.communication.date_of_birth")}:
          </label>
          <input
            type="date"
            className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-primary focus:outline-none"
          />
        </div>

        {/* RFID */}
        <div className="space-y-1">
          <label className="text-textGray">
            {t("module.communication.rfid")}:
          </label>
          <input
            type="text"
            placeholder={t("module.communication.enter_rfid")}
            className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-primary focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-textGray">
            {t("module.communication.religion")}
          </label>
          <select
            id=""
            name=""
            defaultValue="Islam"
            className="bg-bgGray w-full rounded px-1 py-2 border-2 text-textGray border-transparent focus:border-primary focus:outline-none"
          >
            <option value="Islam">{t("module.communication.islam")}</option>
            <option value="Hindu">{t("module.communication.hindu")}</option>
            <option value="Christian">
              {t("module.communication.christian")}
            </option>
            <option value="Buddha">{t("module.communication.buddha")}</option>
            <option value="Other">{t("module.communication.other")}</option>
          </select>
        </div>

        {/* Father's Name */}
        <div className="space-y-1">
          <label className="text-textGray">
            {t("module.communication.fathers_name")}:
          </label>
          <input
            type="text"
            placeholder={t("module.communication.enter_fathers_name")}
            className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-primary focus:outline-none"
          />
        </div>

        {/* Mother's Name */}
        <div className="space-y-1">
          <label className="text-textGray">
            {t("module.communication.mothers_name")}:
          </label>
          <input
            type="text"
            placeholder={t("module.communication.enter_mothers_name")}
            className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-primary focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-textGray">
            {t("module.communication.marital_status")}
          </label>
          <select
            id=""
            name=""
            value={maritalStatus}
            onChange={(e) => setMaritalStatus(e.target.value)}
            className="bg-bgGray w-full rounded px-1 py-2 border-2 text-textGray border-transparent focus:border-primary focus:outline-none"
          >
            <option value="Single">{t("module.communication.single")}</option>
            <option value="Married">{t("module.communication.married")}</option>
            <option value="Unmarried">
              {t("module.communication.Unmarried")}
            </option>
            <option value="Widowed">{t("module.communication.widowed")}</option>
            <option value="Separated">
              {t("module.communication.weparated")}
            </option>
            <option value="Divorced">
              {t("module.communication.divorced")}
            </option>
          </select>
        </div>

        {(maritalStatus === "Married" || maritalStatus === "Widowed") && (
          <>
            {/* Spouse Name */}
            <div className="space-y-1">
              <label className="text-textGray">
                {t("module.communication.spouse_name")}:
              </label>
              <input
                type="text"
                placeholder={t("module.communication.enter_spouse_name")}
                className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-primary focus:outline-none"
              />
            </div>

            {/* Spouse Phone Number */}
            <div className="space-y-1">
              <label className="text-textGray">
                {t("module.communication.spouse_phone_number")}:
              </label>
              <input
                type="text"
                placeholder={t("module.communication.enable_spouse_phone_number")}
                className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-primary focus:outline-none"
              />
            </div>

            {/* Number of Children */}
            <div className="space-y-1">
              <label className="text-textGray">
                {t("module.communication.number_of_children")}:
              </label>
              <input
                type="number"
                placeholder={t("module.communication.enter_number_of_children")}
                className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-primary focus:outline-none"
              />
            </div>
          </>
        )}
      </div>

      <h5 className="text-textGray font-medium mt-6 mb-2">
        {t("module.communication.employee_information")}
      </h5>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 mb-6">
        {/* Staff ID Number */}
        <div className="space-y-1">
          <label className="text-textGray">
            {t("module.communication.staff_id_number")} :
          </label>
          <input
            type="number"
            placeholder={t("module.communication.enter_staff_id_number")}
            className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-primary focus:outline-none"
          />
        </div>

        {/* Joining Date */}
        <div className="space-y-1">
          <label className="text-textGray">
            {t("module.communication.joining_date")} :
          </label>
          <input
            type="date"
            className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-primary focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-textGray">
            {t("module.communication.qualification")}
          </label>
          <select
            id=""
            name=""
            defaultValue="SSC"
            className="bg-bgGray w-full rounded px-1 py-2 border-2 text-textGray border-transparent focus:border-primary focus:outline-none"
          >
            <option value="SSC">{t("module.communication.ssc")}</option>
            <option value="HSC">{t("module.communication.hsc")}</option>
            <option value="HON'S+">
              {t("module.communication.hons_plus")}
            </option>
            <option value="Masters">
              {t("module.communication.masters")}
            </option>
            <option value="BSC">{t("module.communication.bsc")}</option>
            <option value="BBA">{t("module.communication.bba")}</option>
            <option value="MBA">{t("module.communication.mba")}</option>
            <option value="MSC">{t("module.communication.msc")}</option>
            <option value="PHD">{t("module.communication.phd")}</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-textGray">
            {t("module.communication.employee_type")}
          </label>
          <select
            id=""
            name=""
            defaultValue="Permanent"
            className="bg-bgGray w-full rounded px-1 py-2 border-2 text-textGray border-transparent focus:border-primary focus:outline-none"
          >
            <option value="Permanent">
              {t("module.communication.permanent")}
            </option>
            <option value="Temporary">
              {t("module.communication.temporary")}
            </option>
            <option value="Contractual">
              {t("module.communication.contractual")}
            </option>
          </select>
        </div>

        {/* Role */}
        <div className="space-y-1">
          <label className="text-textGray">
            {t("module.communication.role")} :
          </label>
          <input
            type="text"
            placeholder={t("module.communication.enter_role")}
            className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-primary focus:outline-none"
          />
        </div>

        {/* Designation */}
        <div className="space-y-1">
          <label className="text-textGray">
            {t("module.communication.designation")} :
          </label>
          <input
            type="text"
            placeholder={t("module.communication.enter_designation")}
            className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      <h5 className="text-textGray font-medium mt-6 mb-2">
        {t("module.communication.contact_information")}
      </h5>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 mb-2">
        <div className="space-y-2">
          <label className="text-textGray">
            {t("module.communication.permanent_address")}
          </label>
          <textarea
            rows="3"
            placeholder={t("module.communication.enterYour_permanent_address")}
            className="bg-bgGray w-full rounded px-1 py-2 border-2 text-textGray border-transparent focus:border-primary focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-textGray">
            {t("module.communication.present_address")}
          </label>
          <textarea
            rows="3"
            placeholder={t("module.communication.enter_your_present_address")}
            className="bg-bgGray w-full rounded px-1 py-2 border-2 text-textGray border-transparent focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      <div className="flex justify-end mt-4 mb-2 md:mb-0">
        <button
          type="submit"
          className="rounded w-40 p-3 bg-primary hover:bg-buttonHover text-white shadow-md  hover:-translate-y-[2px] duration-200"
        >
          {t("module.communication.submit")}
        </button>
      </div>
    </>
  );
}
