export default function ClassOrSection({classOrSection}) {
    return (
        <>
        {
         classOrSection === "Class" &&
         <div className="space-y-2">
         <label className="">Select Class</label>
         <select
         id=""
         name=""
         defaultValue="One"
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
        }
        {
         classOrSection === "Section" &&
         <div className="space-y-2">
         <label className="">Select Section </label>
         <select
         id=""
         name=""
         defaultValue="One"
         className="bg-bgGray w-full rounded px-1 py-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
         >
         <option value="Nursery Jaba">Nursery Jaba</option>
         <option value="Nursery Kadom">Nursery Kadom</option>
         <option value="Nursery Golap">Nursery Golap</option>
         </select>
      </div>
        }
        </>
    );
}