import Modal from "../../common/Modal";

export default function EditTypeModal({ editContent, setEditContent, isEdit, onClose }) {

    return (
   <Modal isOpen={isEdit} onClose={onClose} width="w-2/3 md:w-1/2">
      {/* modal content */}
      <h2 className="text-2xl">Edit Testimonial</h2>

      <div className="mt-2 mb-4 space-y-1">
        <div className="space-y-1">
          <label className="text-textGray">Image</label>
          <input 
          value={editContent?.image}
          onChange={(e)=> setEditContent({...editContent, image:e.target.value}) }
          className="block w-full cursor-pointer rounded bg-gray-100 text-textGray border-transparent focus:border-#DB9E30 focus:outline-none" aria-describedby="" id="" type="file" />
        </div>

        <div className="space-y-1">
          <label className="text-textGray">Name</label>
          <input
          type="text"
          placeholder="Enter Name"
          value={editContent?.name}
          onChange={(e)=> setEditContent({...editContent, name:e.target.value}) }
          className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-textGray">Designation</label>
          <input
          type="text"
          placeholder="Enter Designation"
          value={editContent?.designation}
          onChange={(e)=> setEditContent({...editContent, designation:e.target.value}) }
          className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-textGray">Testimonial</label>
          <textarea
          placeholder="Enter Testimonial"
          value={editContent?.testimonial}
          onChange={(e)=> setEditContent({...editContent, testimonial:e.target.value}) }
          className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
          />
        </div>
      </div>
   </Modal>
    );
}