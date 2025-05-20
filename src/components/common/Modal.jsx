import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

export default function Modal({ children, isOpen, onClose, handleSave, width }) {
  const { t } = useTranslation();
  const modalRef = useRef(null);

  useEffect(() => {
    // check if clicked outside of modal area. if dom node exists, means modal is open, then modalRef.current has value. if so, then, check if it contains the clicked element on every mousedown event.
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    // function assigned to eventListener.
    document.addEventListener('mousedown', handleClickOutside);

    // callback to remove the event listener.
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // return modal jsx when isOpen is true.
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500/50 transition duration-300 ease-in-out">
      <div ref={modalRef} className={`bg-white rounded-lg shadow-lg p-4 ${width}`}>
        {/* modal content */}
        {children}

        {/* action buttons */}
        <div className="flex justify-end items-center space-x-2 xl:space-x-3">
          <button
            className="bg-blue px-4 py-2 rounded shadow text-white hover:-translate-y-[2px] duration-200"
            onClick={handleSave}
          >
            {t('module.settings.save')}
          </button>
          <button
            className="bg-red px-4 py-2 rounded shadow text-white hover:-translate-y-[2px] duration-200"
            onClick={onClose}
          >
            {t('module.settings.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}
