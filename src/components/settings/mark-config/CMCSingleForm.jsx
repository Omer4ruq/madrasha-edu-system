export default function CMCSingleForm({subject,handleDeleteField, handleChange}) {
    return (
      <div className="md:flex items-center justify-between gap-4">
         <div className="md:flex gap-4 flex-1">
            <div className="flex items-center gap-2 lg:gap-4 my-2 w-full">
               <label>Subject</label>
               <select
                  id=""
                  name=""
                  value={subject.subject}
                  onChange={(e) => handleChange(subject.id, "subject", e)}
                  className="bg-bgGray w-full rounded px-1 py-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
               >
                  <option value="select">Subject</option>
                  <option value="bangla">Bangla</option>
                  <option value="english">English</option>
                  <option value="math">Math</option>
                  <option value="biology">Biology</option>
               </select>
            </div>

            <div className="flex items-center gap-2 lg:gap-4 my-2 w-full">
               <label>Group</label>
               <select
                  id=""
                  name=""
                  value={subject.type}
                  onChange={(e) => handleChange(subject.id, "type", e)}
                  className="bg-bgGray w-full rounded px-1 py-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
               >
                  <option value="select">Type</option>
                  <option value="comp">Compolsury</option>
                  <option value="op">Optional</option>
               </select>
            </div>


            <div className="flex items-center gap-2 lg:gap-4 my-2 w-full">
               <label>Serial</label>
               <input type="number" value={subject.serial}
                  onChange={(e) => handleChange(subject.id, "serial", e)}
                  className="bg-bgGray w-full rounded px-1 py-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none" />
            </div>

            <div className="flex items-center gap-2 lg:gap-4 my-2 w-full">
               <label>Mark</label>
               <input type="number" value={subject.mark}
                  onChange={(e) => handleChange(subject.id, "mark", e)}
                  className="bg-bgGray w-full rounded px-1 py-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none" />
            </div>
         </div>

         <div className="flex items-center 
         justify-end">
            <button
               type="submit"
               onClick={() => handleDeleteField(subject.id)}
               className="rounded w-28 md:w-20 lg:w-28 xl:ml-6 p-2 bg-red text-white shadow-md  hover:-translate-y-[2px] duration-200"
            >
               Delete
            </button>
         </div>
      </div>
    );
}