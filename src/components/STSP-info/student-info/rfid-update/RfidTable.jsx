import { useState } from "react";

export default function RfidTable() {
   const studentData = [
      {
         id: "001",
         name: "Muktar Ali",
         roll: "01",
         rfid: "12345670"
      },
      {
         id: "002",
         name: "Sakina Begum",
         roll: "02",
         rfid: "12345690"
      },
      {
         id: "003",
         name: "Salman Rahman",
         roll: "03",
         rfid: "44567890"
      }
   ]

   const [rfid, setRfid] = useState(studentData);

   const handleChange = (event, id) => {
      const updatedRfid = rfid.map(item => {
         if(item.id === id) {
            item.rfid = event.target.value;
         }
         return item;
      })
      setRfid(updatedRfid);
   }

  return (
   <div className="border my-6 rounded shadow-md">
      <table className="w-full text-textGray leading-6 sm:leading-8">
         <thead className="border-b-2 bg-bgBlue">
         <tr>
            <th className="w-2/12 p-1">ID</th>
            <th className="w-3/12">Student Name</th>
            <th className="w-2/12">Roll</th>
            <th className="w-5/12">RFID</th>
         </tr>
         </thead>
         <tbody className="divide-y-2 font-medium">
         {rfid.map(item => (
            <tr key={item.id} className="text-center">
               <td className="w-2/12">{item.id}</td>
               <td className="w-3/12">{item.name}</td>
               <td className="w-2/12">{item.roll}</td>
               <td className="w-5/12 pb-1 pr-2">
                  <input 
                  type="text" 
                  placeholder="RFID" 
                  value={item.rfid}
                  onChange={(event) => handleChange(event, item.id)}
                  className="w-full m-[2px] mb-0 px-1 py-[2px] rounded border border-slate-300 focus:outline-none focus:border-2 focus:border-#DB9E30" />
               </td>
            </tr>
         ))}
         </tbody>
      </table>
   </div>
  )
}
