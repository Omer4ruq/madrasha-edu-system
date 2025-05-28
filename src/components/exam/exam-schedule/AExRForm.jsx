import { useState } from "react";
import { FiPlusCircle } from "react-icons/fi";
import AExRSingleForm from "./AExRSingleForm";
import { useTranslation } from "react-i18next";

export default function AExRForm() {
    const { t } = useTranslation();

    const data = [
        {
            id: "01",
            exam: "first term",
            subject: "bangla",
        },
        {
            id: "02",
            exam: "first term",
            subject: "bangla",
        },
        {
            id: "03",
            exam: "first term",
            subject: "bangla",
        },
    ];

    const [exams, setExams] = useState(data);

    function handleAddField() {
        const maxId = exams.reduce((acc, cur) => Math.max(acc, Number(cur.id)), 0);

        setExams([...exams,
        {
            id: maxId + 1,
            exam: "",
            subject: ""
        },]);
    }

    function handleChange(examId, property, event) {
        const desiredObject = exams.map(item => {
            if (item.id === examId) {
                return { ...item, [property]: event.target.value };
            } else {
                return item;
            }
        });

        setExams(desiredObject);
    }

    function handleDeleteField(examId) {
        const existingExams = exams.filter(item => item.id !== examId);
        setExams(existingExams);
    }

    return (
        <div className="mt-2 space-y-4 md:space-y-1 overflow-x-scroll">
            {
                exams.map(exam => (
                    <AExRSingleForm
                        key={exam.id}
                        exam={exam}
                        handleDeleteField={handleDeleteField}
                        handleChange={handleChange}
                    />
                ))
            }

            <div className="flex items-center gap-4 pt-6 pb-4">
                <button
                    type="button"
                    onClick={handleAddField}
                    className="rounded w-52 p-2 bg-green text-white shadow-md hover:-translate-y-[2px] duration-200 text-lg"
                >
                    <FiPlusCircle className="inline mb-1 mr-1 text-xl" /> {t('module.exam.add_field')}
                </button>
                {
                    exams.length > 0 &&
                    <button
                        type="submit"
                        className="rounded w-32 p-[10px] bg-#DB9E30 hover:bg-buttonHover text-white shadow-md hover:-translate-y-[2px] duration-200"
                    >
                        {t('module.exam.submit')}
                    </button>
                }
            </div>
        </div>
    );
}
