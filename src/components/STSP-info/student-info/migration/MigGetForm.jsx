export default function MigGetForm() {
  return (
   <form className="md:flex gap-7 items-center justify-between">
      <div className="flex items-center gap-2 md:w-5/12 my-2">
         <label className="w-40">Select Session</label>
         <select
            id=""
            name=""
            className="bg-bgGray w-full rounded px-1 py-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
         >
            <option value="2024-2025">2024-2025</option>
            <option value="2025-2026">2025-2026</option>
         </select>
      </div>

      <div className="flex items-center gap-2 md:w-5/12 my-2">
         <label className="w-32">Select Class</label>
         <select
            id=""
            name=""
            defaultValue="Class"
            className="bg-bgGray w-full rounded px-1 py-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
         >
            <option value="Nursery">Nursery</option>
            <option value="One">One</option>
            <option value="Two">Two</option>
            <option value="Three">Three</option>
            <option value="Four">Four</option>
            <option value="Five">Five</option>
         </select>
      </div>

      {/* create button */}
      <div className="flex items-center gap-2 min-w-44 md:w-2/12 justify-end mt-4 md:mt-0">
         <button
            type="submit"
            className="rounded w-full p-[10px] bg-#DB9E30 hover:bg-buttonHover text-white shadow-md  hover:-translate-y-[2px] duration-200"
         >
            Get Student List
         </button>
      </div>
    </form>
  )
}
