import Modal from "../../common/Modal";
import { useTranslation } from "react-i18next";

export default function EditGradeModal({ editContent, setEditContent, isEdit, onClose }) {
    const { t } = useTranslation();

    return (
        <Modal isOpen={isEdit} onClose={onClose} width="w-2/3 md:w-1/2">
            {/* modal content */}
            <h2 className="text-2xl">{t('module.exam.editGrade')}</h2>
            <div className="my-8 space-y-2">
                <div className="space-y-2">
                    <label className="">{t('module.exam.gradeName')}</label>
                    <input
                        type="text"
                        value={editContent.name}
                        onChange={(e) => setEditContent({ ...editContent, name: e.target.value })}
                        className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
                    />
                </div>

                <div className="space-y-2">
                    <label className="">{t('module.exam.gpa')}</label>
                    <input
                        type="text"
                        value={editContent.gpa}
                        onChange={(e) => setEditContent({ ...editContent, gpa: e.target.value })}
                        className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
                    />
                </div>

                <div className="space-y-2">
                    <label className="">{t('module.exam.minMark')}</label>
                    <input
                        type="number"
                        value={editContent.min}
                        onChange={(e) => setEditContent({ ...editContent, min: e.target.value })}
                        className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
                    />
                </div>

                <div className="space-y-2">
                    <label className="">{t('module.exam.maxMark')}</label>
                    <input
                        type="number"
                        value={editContent.max}
                        onChange={(e) => setEditContent({ ...editContent, max: e.target.value })}
                        className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
                    />
                </div>
            </div>
        </Modal>
    );
}
