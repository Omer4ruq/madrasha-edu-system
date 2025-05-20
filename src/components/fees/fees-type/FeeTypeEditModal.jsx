import { useTranslation } from "react-i18next";
import Modal from "../../common/Modal";

export default function FeeTypeEditModal({ editContent, setEditContent, isEdit, onClose }) {
    const { t } = useTranslation();

    return (
        <Modal isOpen={isEdit} onClose={onClose} width="w-2/3 md:w-1/2">
            {/* modal content */}
            <h2 className="text-2xl">{t("module.fees.edit_fee_type")}</h2>
            <div className="my-8 space-y-3">
                <div className="space-y-2">
                    <label className="">{t("module.fees.fee_type")}</label>
                    <select 
                        onChange={(e) => setEditContent({ ...editContent, type_name: e.target.value })} 
                        className="bg-bgGray appearance-none w-full rounded p-2 border-2 border-transparent focus:border-primary focus:outline-none" 
                        defaultValue="0" 
                        name="fee_type" 
                        id="fee_type"
                    >
                        <option value="0">{t("module.fees.select_fee_type")}</option>
                        <option value="12">{t("module.fees.annually")}</option>
                        <option value="6">{t("module.fees.bi_annually")}</option>
                        <option value="4">{t("module.fees.tri_annually")}</option>
                        <option value="3">{t("module.fees.quarterly")}</option>
                        <option value="2">{t("module.fees.two_monthly")}</option>
                        <option value="1">{t("module.fees.monthly")}</option>
                    </select>
                </div>
                
                <div className="space-y-2">
                    <label className="">{t("module.fees.late_fee")}</label>
                    <input
                        onChange={(e) => setEditContent({ ...editContent, late_fee: e.target.value }) }
                        type="number"
                        placeholder={t("module.fees.late_fee_placeholder")}
                        className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-primary focus:outline-none"
                    />
                </div>

                <div className="space-y-2">
                    <label className="">{t("module.fees.status")}</label>
                    <select 
                        onChange={(e) => setEditContent({ ...editContent, status: e.target.value })} 
                        className="bg-bgGray appearance-none w-full rounded p-2 border-2 border-transparent focus:border-primary focus:outline-none" 
                        defaultValue="1" 
                        name="status" 
                        id="status"
                    >
                        <option value="1">{t("module.fees.active")}</option>
                        <option value="0">{t("module.fees.inactive")}</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="">{t("module.fees.admission_year")}</label>
                    <select 
                        onChange={(e) => setEditContent({ ...editContent, admission_year: e.target.value })} 
                        className="bg-bgGray appearance-none w-full rounded p-2 border-2 border-transparent focus:border-primary focus:outline-none" 
                        defaultValue="2024" 
                        name="admission_year" 
                        id="admission_year"
                    >
                        <option value="2024">2024</option>
                        <option value="2023">2023</option>
                    </select>
                </div>
            </div>
        </Modal>
    );
}
