import axios from "axios";
import { useEffect, useState } from "react";
import DeleteModal from "../common/DeleleModal";
import AcademicSetupForm from "./academic-setup/AcademicSetupForm";
import EditPopup from "./academic-setup/EditPopup";
import FieldList from "./academic-setup/FiledList";

export default function AcademicSetup() {
  const [isEdit, setIsEdit] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [toDelete, setToDelete] = useState("");
  const [deleteValues, setDeleteValues] = useState();
  const [editContent, setEditContent] = useState({});
  const [pleaseReRender, setPleaseReRender] = useState(false);


  const acSetupFields = [
    { path: 'student-class', title: 'Class' },
    { path: 'subject', title: 'Subject' },
    { path: 'stu-group', title: 'Group' },
    { path: 'student-section', title: 'Section' },
    { path: 'student-shift', title: 'Shift' },
    { path: 'period', title: 'Period' },
    { path: 'admission-year', title: 'Admission Year' }
  ];

  // handle edit.
  function handleEdit(item, field) {
    setIsEdit(true);
    setEditContent({ item, field });
  }

  async function handleConfirmEdit(){
    try {
      const response = await axios.put(`${import.meta.env.VITE_SERVER_BASE_URL}/api/${editContent.field.path}/${editContent.item.id}/`, editContent.item);
      setPleaseReRender(true);
      return response.data; 
    } catch (error) {
      console.error('Error updating institute information:');      
      throw error; 
    } finally{
      closeEdit();
    }
  }

  function closeEdit(){
    setIsEdit(false);
    setEditContent({});
  }
  

  //handle delete
  function handleDelete(item, field) {
    setIsDelete(true);
    setToDelete(`${field.title} "${item.name}" `);
    setDeleteValues({selectedType: field.path, id:item.id});
  }

  async function handleConfirmDlt(){
    try {
      const response = await axios.delete(`${import.meta.env.VITE_SERVER_BASE_URL}/api/${deleteValues.selectedType}/${deleteValues.id}/`); 
      setPleaseReRender(true);
      return response.data; 
    } catch (error) {
      console.error('Error deleting institute:', error);
      throw error;
    } finally{
    closeDelete();
    }
  }

  function closeDelete(){
    setDeleteValues();
    setIsDelete(false);
    setToDelete("");
  }

useEffect(()=>{
  pleaseReRender && setPleaseReRender(false)
},[pleaseReRender])
  
  return (
    <div className="relative">
      {/* the field entry form */}
      <AcademicSetupForm acSetupFields={acSetupFields} />

      {/* show the fields */}
      <div className="space-y-4">
        {
          acSetupFields.map((field, i) =><FieldList key={i} field={field} handleEdit={handleEdit} handleDelete={handleDelete} pleaseReRender={pleaseReRender} setPleaseReRender={setPleaseReRender} />)
        }

      </div>

      {/* show only when isEdit is true */}
      <EditPopup
        editContent={editContent}
        setEditContent={setEditContent}
        isEdit={isEdit} 
        handleConfirmEdit={handleConfirmEdit}
        onClose={closeEdit}
      />

      {/* show only when isDelete is true */}
      <DeleteModal title={toDelete.toLowerCase()} isOpen={isDelete} onClose={closeDelete} handleConfirmDlt={handleConfirmDlt} />

    </div>
  );
}
