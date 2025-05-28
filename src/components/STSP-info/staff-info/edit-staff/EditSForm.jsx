import { useTranslation } from "react-i18next";

export default function EditSForm({staffData, handleChange}) {
   const {t} = useTranslation();
    return (
<>
<h5 className="text-textGray font-medium mt-6 mb-2">
            {t('module.communication.personal_information')}
         </h5>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 mb-6">
            {/* Avatar */}
            <div className="space-y-1">
               <label className="text-textGray" htmlFor="">
                  {t('module.communication.avatar')} :
               </label>
               <input 
                  value={staffData.avatar}
                  onChange={(event) => handleChange("avatar", event)}
                  className="block w-full cursor-pointer rounded bg-gray-100 text-textGray border-transparent focus:border-#DB9E30 focus:outline-none" 
                  aria-describedby="" 
                  id="" 
                  type="file"
               />
            </div>

            {/* Name */}
            <div className="space-y-1">
               <label className="text-textGray">{t('module.communication.name')} :</label>
               <input
                  type="text"
                  placeholder={t('module.communication.enter_name')}
                  value={staffData.name}
                  onChange={(event) => handleChange("name", event)}
                  className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
               />
            </div>
            
            {/* Gender */}
            <div className="space-y-2">
               <label className="text-textGray">{t('module.communication.gender')}</label>
               <select
                  value={staffData.gender}
                  onChange={(event) => handleChange("gender", event)}
                  className="bg-bgGray w-full rounded px-1 py-2 border-2 text-textGray border-transparent focus:border-#DB9E30 focus:outline-none"
               >
                  <option value="Male">{t('module.communication.male')}</option>
                  <option value="Female">{t('module.communication.female')}</option>
                  <option value="Other">{t('module.communication.other')}</option>
               </select>
            </div>

            {/* Blood Group */}
            <div className="space-y-2">
               <label className="text-textGray">{t('module.communication.blood_group')}</label>
               <select
                  value={staffData.bloodGroup}
                  onChange={(event) => handleChange("bloodGroup", event)}
                  className="bg-bgGray w-full rounded px-1 py-2 border-2 text-textGray border-transparent focus:border-#DB9E30 focus:outline-none"
               >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(group => (
                     <option key={group} value={group}>{t(`module.communication.${group.replace('+', 'plus').replace('-', 'minus')}`)}</option>
                  ))}
               </select>
            </div>

            {/* Phone Number */}
            <div className="space-y-1">
               <label className="text-textGray">{t('module.communication.phone_number')} :</label>
               <input
                  type="text"
                  placeholder={t('module.communication.enter_phone_number')}
                  value={staffData.mobile}
                  onChange={(event) => handleChange("mobile", event)}
                  className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
               />
            </div>

            {/* Email */}
            <div className="space-y-1">
               <label className="text-textGray">{t('module.communication.email')} :</label>
               <input
                  type="text"
                  placeholder={t('module.communication.enter_email')}
                  value={staffData.email}
                  onChange={(event) => handleChange("email", event)}
                  className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
               />
            </div>

            {/* NID */}
            <div className="space-y-1">
               <label className="text-textGray">{t('module.communication.nid')} :</label>
               <input
                  type="text"
                  placeholder={t('module.communication.enter_nid')}
                  value={staffData.NID}
                  onChange={(event) => handleChange("NID", event)}
                  className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
               />
            </div>

            {/* Date of Birth */}
            <div className="space-y-1">
               <label className="text-textGray">{t('module.communication.date_of_birth')} :</label>
               <input
                  type="date"
                  value={staffData.birthDate}
                  onChange={(event) => handleChange("birthDate", event)}
                  className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
               />
            </div>

            {/* RFID */}
            <div className="space-y-1">
               <label className="text-textGray">{t('module.communication.rfid')} :</label>
               <input
                  type="text"
                  placeholder={t('module.communication.enter_rfid')}
                  value={staffData.id}
                  onChange={(event) => handleChange("id", event)}
                  className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
               />
            </div>

            {/* Religion */}
            <div className="space-y-2">
               <label className="text-textGray">{t('module.communication.religion')}</label>
               <select
                  value={staffData.religion}
                  onChange={(event) => handleChange("religion", event)}
                  className="bg-bgGray w-full rounded px-1 py-2 border-2 text-textGray border-transparent focus:border-#DB9E30 focus:outline-none"
               >
                  {['Islam', 'Hindu', 'Christian', 'Buddha', 'Other'].map(religion => (
                     <option key={religion} value={religion}>{t(`module.communication.${religion.toLowerCase()}`)}</option>
                  ))}
               </select>
            </div>

            {/* Father's Name */}
            <div className="space-y-1">
               <label className="text-textGray">{t('module.communication.fathers_name')} :</label>
               <input
                  type="text"
                  placeholder={t('module.communication.enter_fathers_name')}
                  value={staffData.fathersName}
                  onChange={(event) => handleChange("fathersName", event)}
                  className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
               />
            </div>

            {/* Mother's Name */}
            <div className="space-y-1">
               <label className="text-textGray">{t('module.communication.mothers_name')} :</label>
               <input
                  type="text"
                  placeholder={t('module.communication.enter_mothers_name')}
                  value={staffData.mothersName}
                  onChange={(event) => handleChange("mothersName", event)}
                  className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
               />
            </div>

            {/* Marital Status */}
            <div className="space-y-2">
               <label className="text-textGray">{t('module.communication.marital_status')}</label>
               <select
                  value={staffData.maritalStatus}
                  onChange={(event) => handleChange("maritalStatus", event)}
                  className="bg-bgGray w-full rounded px-1 py-2 border-2 text-textGray border-transparent focus:border-#DB9E30 focus:outline-none"
               >
                  {['Single', 'Married', 'Unmarried', 'Widowed', 'Separated', 'Divorced'].map(status => (
                     <option key={status} value={status}>{t(`module.communication.${status.toLowerCase()}`)}</option>
                  ))}
               </select>
            </div>

            {/* Conditional fields for spouse */}
            {(staffData.maritalStatus === "Married" || staffData.maritalStatus === "Widowed") && (
               <>
                  {/* Spouse Name */}
                  <div className="space-y-1">
                     <label className="text-textGray">{t('module.communication.spouse_name')} :</label>
                     <input
                        type="text"
                        placeholder={t('module.communication.enter_spouse_name')}
                        value={staffData.spouseName}
                        onChange={(event) => handleChange("spouseName", event)}
                        className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
                     />
                  </div>

                  {/* Spouse Phone Number */}
                  <div className="space-y-1">
                     <label className="text-textGray">{t('module.communication.spouse_phone_number')} :</label>
                     <input
                        type="text"
                        placeholder={t('module.communication.enter_spouse_phone_number')}
                        value={staffData.spouseMobile}
                        onChange={(event) => handleChange("spouseMobile", event)}
                        className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
                     />
                  </div>
            
      {/* Number of Children */}
      <div className="space-y-1">
         <label className="text-textGray">{t('module.communication.number_of_children')} :</label>
         <input
            type="number"
            placeholder="Enter Number of Children"
            value={staffData.children}
            onChange={(event)=> {handleChange("children", event)}}
            className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
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
            className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
          />
        </div>

        {/* Joining Date */}
        <div className="space-y-1">
          <label className="text-textGray">
            {t("module.communication.joining_date")} :
          </label>
          <input
            type="date"
            className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
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
            className="bg-bgGray w-full rounded px-1 py-2 border-2 text-textGray border-transparent focus:border-#DB9E30 focus:outline-none"
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
            className="bg-bgGray w-full rounded px-1 py-2 border-2 text-textGray border-transparent focus:border-#DB9E30 focus:outline-none"
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
            className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
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
            className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
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
            className="bg-bgGray w-full rounded px-1 py-2 border-2 text-textGray border-transparent focus:border-#DB9E30 focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-textGray">
            {t("module.communication.present_address")}
          </label>
          <textarea
            rows="3"
            placeholder={t("module.communication.enter_your_present_address")}
            className="bg-bgGray w-full rounded px-1 py-2 border-2 text-textGray border-transparent focus:border-#DB9E30 focus:outline-none"
          />
        </div>
      </div>

</>
    );
}