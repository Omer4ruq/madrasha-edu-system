import Modal from "../../common/Modal";
import { useTranslation } from "react-i18next";

export default function ExNmAddModal({ isAdd, onClose }) {
    const { t } = useTranslation();

    return (
        <Modal isOpen={isAdd} onClose={onClose} width="w-2/3 md:w-1/2">
            {/* modal content */}
            <h2 className="text-2xl">{t('module.exam.add_exam_name')}</h2>
            <div className="my-8 space-y-3">
                <div className="space-y-2">
                    <label className="">{t('module.exam.exam_name')}</label>
                    <input
                        type="text"
                        placeholder={t('module.exam.exam_name')}
                        className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
                    />
                </div>

                <div className="space-y-2">
                    <label className="">{t('module.exam.start_date')}</label>
                    <input
                        type="date"
                        className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
                    />
                </div>

                <div className="space-y-2">
                    <label className="">{t('module.exam.end_date')}</label>
                    <input
                        type="date"
                        className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
                    />
                </div>
                
                <div className="space-y-2">
                    <label className="">{t('module.exam.admission_year')}</label>
                    <select
                        id=""
                        name=""
                        defaultValue="2024"
                        className="bg-bgGray w-full rounded px-1 py-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
                    >
                        <option value="2024">2024</option>
                        <option value="2023">2023</option>
                        <option value="2022">2022</option>
                    </select>
                </div>
            </div>
        </Modal>
    );
}
