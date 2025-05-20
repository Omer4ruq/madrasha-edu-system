import { useEffect, useState } from 'react';
import TesForm from "./TesForm";
import TesModal from './TesModal';
import TesTable from "./TesTable";

export default function Testimonial() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState({});

  const [tesFormat, setTesFormat] = useState({
    header : "Testimonial",
    body: `I testify that ${selectedStudent?.name} bearing roll no ${selectedStudent?.roll} is a good student`,
    subBody: "He is a good boy",
    footer: "He is elgible for the application",
    signature: "Headmaster"
 });
  
  const handleViewClick = (student) => {
     setSelectedStudent(student);
     setIsModalOpen(true);
   };

   useEffect(() => {
    setTesFormat({
      header : "Testimonial",
      body: `I testify that ${selectedStudent?.name} bearing roll no ${selectedStudent?.id} is a good student`,
      subBody: "He is a good boy",
      footer: "He is elgible for the application",
      signature: "Headmaster"
     });
   }, [selectedStudent]);

    return (
      <div className="my-4 bg-white rounded-md p-4 md:p-6">
         <TesForm />

         <TesTable handleViewClick={handleViewClick} />
         
      {isModalOpen && (
      <TesModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} width="w-3/4 md:w-1/2">
        <div className="modal-content relative">
          <img src="/images/testimonial-bg.svg" alt="Testimonial background" className="w-full h-auto" />
          <div className="absolute inset-0 flex flex-col justify-center p-8 text-start w-full">
            <h2 className="text-2xl font-bold mb-4 text-center">{tesFormat.header}</h2>
            <p className="mb-4">{tesFormat.body}</p>
            <p className="mb-4">{tesFormat.subBody}</p>
            <p className="mb-4">{tesFormat.footer}</p>
            <p className="font-bold text-right">{tesFormat.signature}</p>
          </div>
        </div>
      </TesModal>
    )}
      </div>
    );
}