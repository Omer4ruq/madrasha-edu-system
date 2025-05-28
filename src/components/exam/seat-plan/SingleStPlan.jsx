import { useTranslation } from "react-i18next";

export default function SingleStPLan({ student }) {
    const { t } = useTranslation();

    return (
        <div className="mt-4 border border-#DB9E30 rounded p-4">
            <h2 className="text-#DB9E30 text-center text-2xl font-bold">Urban School and College</h2>
            <h2 className="text-center text-xl">{t('module.exam.seatPlan')}</h2>

            <div className="flex justify-between mt-2">
                <div className="flex-1">
                    <h3 className=""><span className="text-bold">{t('module.exam.exam')} : </span>1st Term Exam</h3>
                    <h3 className=""><span className="text-bold">{t('module.exam.name')} : </span>{student.name}</h3>
                    <h3 className=""><span className="text-bold">{t('module.exam.class')} : </span>{student.class}</h3>
                    <h3 className=""><span className="text-bold">{t('module.exam.section')} : </span>{student.section}</h3>
                </div>
                <div className="min-w-32 flex items-center">
                    <div className="w-full border border-#DB9E30 text-center p-2 leading-8 mb-2">
                        <h3 className="text-lg">{t('module.exam.idNo')}</h3>
                        <h3 className="text-2xl my-2">{student.id}</h3>
                    </div>
                </div>
            </div>
        </div>
    );
}
