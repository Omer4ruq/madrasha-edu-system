import { useTranslation } from "react-i18next";
import Modal from "../../common/Modal";

export default function AddGradeModal({ isAdd, onClose }) {
    const { t } = useTranslation();

    return (
        <Modal isOpen={isAdd} onClose={onClose} width="w-2/3 md:w-1/2">
            {/* modal content */}
            <h2 className="text-2xl">{t('module.exam.addGrade')}</h2>
            <div className="my-8 space-y-3">
                <div className="space-y-2">
                    <label className="">{t('module.exam.gradeName')}</label>
                    <input
                        type="text"
                        placeholder={t('module.exam.gradeName')}
                        className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
                    />
                </div>

                <div className="space-y-2">
                    <label className="">{t('module.exam.gpa')}</label>
                    <input
                        type="text"
                        placeholder={t('module.exam.gpa')}
                        className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
                    />
                </div>

                <div className="space-y-2">
                    <label className="">{t('module.exam.minimumMark')}</label>
                    <input
                        type="number"
                        placeholder={t('module.exam.minimumMark')}
                        className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
                    />
                </div>

                <div className="space-y-2">
                    <label className="">{t('module.exam.maximumMark')}</label>
                    <input
                        type="number"
                        placeholder={t('module.exam.maximumMark')}
                        className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
                    />
                </div>
            </div>
        </Modal>
    );
}
