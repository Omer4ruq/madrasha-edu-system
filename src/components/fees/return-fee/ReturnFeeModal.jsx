import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

export default function ReturnFeeModal({ title = "this entry", isOpen, onClose, handleConfirmDlt }) {
    const { t } = useTranslation();
    const modalRef = useRef(null);

    useEffect(() => {
        // Check if clicked outside of modal area.
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };
        // Function assigned to eventListener.
        document.addEventListener('mousedown', handleClickOutside);

        // Callback to remove the eventListener.
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    // Return modal jsx when isOpen is true.
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500/50 transition duration-300 ease-in-out">
            <div ref={modalRef} className={`bg-white rounded-lg shadow-lg p-4 w-2/3 sm:w-1/2 lg:w-1/3`}>
                {/* Modal content */}
                <h5 className="text-lg leading-9 mb-6">
                    {t("module.fees.confirm_unpaid")} { title }?
                </h5>

                {/* Action buttons */}
                <div className="flex justify-end items-center space-x-2 xl:space-x-3">
                    <button
                        className="bg-blue px-4 py-2 rounded shadow text-white hover:-translate-y-[2px] duration-200"
                        onClick={handleConfirmDlt}
                    >
                        {t("module.fees.confirm")}
                    </button>
                    <button
                        className="bg-red px-4 py-2 rounded shadow text-white hover:-translate-y-[2px] duration-200"
                        onClick={onClose}
                    >
                        {t("module.fees.cancel")}
                    </button>
                </div>
            </div>
        </div>
    );
}
