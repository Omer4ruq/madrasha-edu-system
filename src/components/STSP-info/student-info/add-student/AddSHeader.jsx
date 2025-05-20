export default function AddSHeader() {
    return (
        <div className="flex items-end justify-between">
         <h3 className="text-2xl font-medium">Student Registration</h3>
         <div className="flex items-end gap-2">
            <button
            className="rounded px-6 py-2 md:py-3 bg-textGray  text-white shadow-md hover:-translate-y-[2px] duration-200"
            >
            Sample Download
            </button>
            <button
            className="rounded px-6 py-2 md:py-3 bg-red  text-white shadow-md hover:-translate-y-[2px] duration-200"
            >
            Bulk Registration
            </button>
            <button
            className="rounded px-6 py-2 md:py-3 bg-yellow  text-white shadow-md hover:-translate-y-[2px] duration-200"
            >
            Student List
            </button>
         </div>
        </div>
    );
}