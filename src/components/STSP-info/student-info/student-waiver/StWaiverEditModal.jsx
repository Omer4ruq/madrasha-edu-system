import Modal from "../../../common/Modal";

export default function StWaiverEditModal({ editContent, setEditContent, isEdit, onClose }) {

    return (
   <Modal isOpen={isEdit} onClose={onClose} width="w-2/3 md:w-1/2">
      {/* modal content */}
      <h2 className="text-2xl">Edit Student Waiver</h2>
      <div className="my-8 space-y-2">
         <div className="space-y-2">
            <label className="">Student Name</label>
            <input
               type="text"
               placeholder="Student Name"
               value={editContent.name}
               onChange={(e)=> setEditContent({...editContent, name:e.target.value}) }
               className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
            />
         </div>

         <div className="space-y-2">
            <label className="">Class</label>
            <select
            id=""
            name=""
            value={editContent.class}
            onChange={(e)=> setEditContent({...editContent, class:e.target.value}) }
            className="bg-bgGray w-full rounded px-1 py-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
            >
               <option value="Class One">Class One</option>
               <option value="Class Two">Class Two</option>
               <option value="Class Three">Class Three</option>
            </select>
         </div>

         <div className="space-y-2">
            <label className="">Section</label>
            <select
            id=""
            name=""
            value={editContent.section}
            onChange={(e)=> setEditContent({...editContent, section:e.target.value}) }
            className="bg-bgGray w-full rounded px-1 py-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
            >
               <option value="Golap">Golap</option>
               <option value="Jaba">Jaba</option>
            </select>
         </div>

         <div className="space-y-2">
            <label className="">Waiver Percentage</label>
            <input
               type="number"
               placeholder="Waiver Percentage"
               value={editContent.waiverPercentage}
               onChange={(e)=> setEditContent({...editContent, waiverPercentage:e.target.value}) }
               className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
            />
         </div>

         <div className="space-y-2">
            <label className="">Fee Type</label>
            <select
            id=""
            name=""
            value={editContent.feeType}
            onChange={(e)=> setEditContent({...editContent, feeType:e.target.value}) }
            className="bg-bgGray w-full rounded px-1 py-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
            >
               <option value="Tution Fee">Tution Fee</option>
               <option value="Monthly Fee">Monthly Fee</option>
               <option value="Exam Fee">Exam Fee</option>
            </select>
         </div>
      </div>
   </Modal>
    );
}