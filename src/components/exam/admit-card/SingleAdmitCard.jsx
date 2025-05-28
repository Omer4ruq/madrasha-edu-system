import { useTranslation } from "react-i18next";

export default function SingleAdmitCard({ student }) {
    const { t } = useTranslation();

    return (
        <div className="my-4 border border-#DB9E30 rounded p-4">
            <h2 className="text-#DB9E30 text-center text-2xl font-bold">Urban School and College</h2>
            <h2 className="text-center text-xl">{t('module.exam.admitCard')}</h2>

            <div className="flex justify-between">
                <div className="flex-1 mt-4">
                    <h3 className="text-lg"><span className="text-bold">{t('module.exam.name')} : </span>{student.name}</h3>
                    <h3 className="text-lg"><span className="text-bold">{t('module.exam.exam')} : </span>1st Term Exam</h3>

                    <div className="flex w-full my-2">
                        <div className="w-1/2">
                            <h3><span className="text-bold">{t('module.exam.id')} : </span>{student.id}</h3>
                            <h3><span className="text-bold">{t('module.exam.roll')} : </span>{student.id}</h3>
                            <h3><span className="text-bold">{t('module.exam.class')} : </span>{student.class}</h3>
                        </div>
                        <div className="w-1/2">
                            <h3><span className="text-bold">{t('module.exam.section')} : </span>{student.section}</h3>
                            <h3><span className="text-bold">{t('module.exam.shift')} : </span>{student.shift}</h3>
                            <h3><span className="text-bold">{t('module.exam.session')} : </span>2024</h3>
                        </div>
                    </div>
                </div>
                <div>
                    <img src="https://randomuser.me/api/portraits/men/77.jpg" alt="" className="w-28" />
                </div>
            </div>
        </div>
    );
}
