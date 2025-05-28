import { useTranslation } from 'react-i18next'; // Import useTranslation

export default function EditTForm({ teacherData, handleChange }) {
  const { t } = useTranslation(); // Translation module

  return (
    <>
      <h5 className="text-textGray font-medium mt-6 mb-2">{t("module.teacher.personal_information")}</h5>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 mb-6">
        {/* Avatar */}
        <div className="space-y-1">
          <label className="text-textGray">{t("module.teacher.avatar")}:</label>
          <input
            value={teacherData.avatar}
            onChange={(event) => { handleChange("avatar", event); }}
            className="block w-full cursor-pointer rounded bg-gray-100 text-textGray border-transparent focus:border-#DB9E30 focus:outline-none"
            type="file"
          />
        </div>

        {/* Name */}
        <div className="space-y-1">
          <label className="text-textGray">{t("module.teacher.name")}:</label>
          <input
            type="text"
            placeholder={t("module.teacher.enter_name")}
            value={teacherData.name}
            onChange={(event) => { handleChange("name", event); }}
            className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
          />
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <label className="text-textGray">{t("module.teacher.gender")}</label>
          <select
            value={teacherData.gender}
            onChange={(event) => { handleChange("gender", event); }}
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
            value={teacherData.bloodGroup}
            onChange={(event) => { handleChange("bloodGroup", event); }}
            className="bg-bgGray w-full rounded px-1 py-2 border-2 text-textGray border-transparent focus:border-#DB9E30 focus:outline-none"
          >
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
          <label className="text-textGray">{t("module.teacher.phone_number")}:</label>
          <input
            type="text"
            placeholder={t("module.teacher.enter_phone_number")}
            value={teacherData.mobile}
            onChange={(event) => { handleChange("mobile", event); }}
            className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
          />
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="text-textGray">{t("module.teacher.email")}:</label>
          <input
            type="text"
            placeholder={t("module.teacher.enter_email")}
            value={teacherData.email}
            onChange={(event) => { handleChange("email", event); }}
            className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
          />
        </div>

        {/* NID */}
        <div className="space-y-1">
          <label className="text-textGray">{t("module.teacher.nid")}:</label>
          <input
            type="text"
            placeholder={t("module.teacher.enter_nid")}
            value={teacherData.NID}
            onChange={(event) => { handleChange("NID", event); }}
            className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
          />
        </div>

        {/* Date of Birth */}
        <div className="space-y-1">
          <label className="text-textGray">{t("module.teacher.date_of_birth")}:</label>
          <input
            type="date"
            value={teacherData.birthDate}
            onChange={(event) => { handleChange("birthDate", event); }}
            className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
          />
        </div>

        {/* RFID */}
        <div className="space-y-1">
          <label className="text-textGray">{t("module.teacher.rfid")}:</label>
          <input
            type="text"
            placeholder={t("module.teacher.enter_rfid")}
            value={teacherData.id}
            onChange={(event) => { handleChange("id", event); }}
            className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
          />
        </div>

        {/* Religion */}
        <div className="space-y-2">
          <label className="text-textGray">{t("module.teacher.religion")}</label>
          <select
            value={teacherData.religion}
            onChange={(event) => { handleChange("religion", event); }}
            className="bg-bgGray w-full rounded px-1 py-2 border-2 text-textGray border-transparent focus:border-#DB9E30 focus:outline-none"
          >
            <option value="Islam">{t("module.teacher.islam")}</option>
            <option value="Hindu">{t("module.teacher.hindu")}</option>
            <option value="Christian">{t("module.teacher.christian")}</option>
            <option value="Buddha">{t("module.teacher.buddha")}</option>
            <option value="Other">{t("module.teacher.other")}</option>
          </select>
        </div>

        {/* Father's Name */}
        <div className="space-y-1">
          <label className="text-textGray">{t("module.teacher.fathers_name")}:</label>
          <input
            type="text"
            placeholder={t("module.teacher.enter_fathers_name")}
            value={teacherData.fathersName}
            onChange={(event) => { handleChange("fathersName", event); }}
            className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
          />
        </div>

        {/* Mother's Name */}
        <div className="space-y-1">
          <label className="text-textGray">{t("module.teacher.mothers_name")}:</label>
          <input
            type="text"
            placeholder={t("module.teacher.enter_mothers_name")}
            value={teacherData.mothersName}
            onChange={(event) => { handleChange("mothersName", event); }}
            className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
          />
        </div>

        {/* Marital Status */}
        <div className="space-y-2">
          <label className="text-textGray">{t("module.teacher.marital_status")}</label>
          <select
            value={teacherData.maritalStatus}
            onChange={(event) => { handleChange("maritalStatus", event); }}
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

        {(teacherData.maritalStatus === "Married" || teacherData.maritalStatus === "Widowed") && (
          <>
            {/* Spouse Name */}
            <div className="space-y-1">
              <label className="text-textGray">{t("module.teacher.spouse_name")}:</label>
              <input
                type="text"
                placeholder={t("module.teacher.enter_spouse_name")}
                value={teacherData.spouseName}
                onChange={(event) => { handleChange("spouseName", event); }}
                className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
              />
            </div>

            {/* Spouse Phone Number */}
            <div className="space-y-1">
              <label className="text-textGray">{t("module.teacher.spouse_phone_number")}:</label>
              <input
                type="text"
                placeholder={t("module.teacher.enter_spouse_phone_number")}
                value={teacherData.spousePhone}
                onChange={(event) => { handleChange("spousePhone", event); }}
                className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}
