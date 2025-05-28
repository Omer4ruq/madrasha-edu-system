
export default function EditSForm({studentData, handleChange}) {
    return (
<>
   <h5 className="text-textGray font-medium mt-6 mb-2">Personal Information</h5>
   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 mb-6">
      {/* Avatar */}
      <div className="space-y-1">
         <label className="text-textGray" htmlFor="">Avatar :</label>
         <input className="block w-full cursor-pointer rounded bg-gray-100 text-textGray border-transparent focus:border-#DB9E30 focus:outline-none"
         value={studentData.avatar}
         onChange={(event)=> {handleChange("avatar", event)}}
         aria-describedby="" id="" type="file"/>
      </div>

      {/* Name */}
      <div className="space-y-1">
         <label className="text-textGray">Name :</label>
         <input
            type="text"
            placeholder="Enter Name"
            value={studentData.name}
            onChange={(event)=> {handleChange("name", event)}}
            className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
         />
      </div>

      {/* Phone Number */}
      <div className="space-y-1">
         <label className="text-textGray">Phone Number :</label>
         <input
            type="text"
            placeholder="Enter Phone Number"
            value={studentData.mobile}
            onChange={(event)=> {handleChange("mobile", event)}}
            className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
         />
      </div>
      
      <div className="space-y-2">
         <label className="text-textGray">Gender</label>
         <select
         id=""
         name=""
         defaultValue="Male"
         value={studentData.gender}
         onChange={(event)=> {handleChange("gender", event)}}
         className="bg-bgGray w-full rounded px-1 py-2 border-2 text-textGray border-transparent focus:border-#DB9E30 focus:outline-none"
         >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
         </select>
      </div>
      
      {/* Date of Birth */}
      <div className="space-y-1">
         <label className="text-textGray">Date of Birth :</label>
         <input
            type="date"
            className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
         />
      </div>

      {/* Blood Group */}
      <div className="space-y-2">
         <label className="text-textGray">Blood Group</label>
         <select
         id=""
         name=""
         defaultValue="Select Blood Group"
         className="bg-bgGray w-full rounded px-1 py-2 border-2 text-textGray border-transparent focus:border-#DB9E30 focus:outline-none"
         >
            <option value="Select Blood Group" disabled >Select Blood Group</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
         </select>
      </div>

      {/* Religion */}
      <div className="space-y-2">
         <label className="text-textGray">Religion</label>
         <select
         id=""
         name=""
         defaultValue="Islam"
         className="bg-bgGray w-full rounded px-1 py-2 border-2 text-textGray border-transparent focus:border-#DB9E30 focus:outline-none"
         >
            <option value="Islam">Islam</option>
            <option value="Hindu">Hindu</option>
            <option value="Christian">Christian</option>
            <option value="Buddha">Buddha</option>
            <option value="Other">Other</option>
         </select>
      </div>

      {/* Email */}
      <div className="space-y-1">
         <label className="text-textGray">Email :</label>
         <input
            type="text"
            placeholder="Enter Email"
            className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
         />
      </div>

      {/* NID */}
      <div className="space-y-1">
         <label className="text-textGray">NID :</label>
         <input
            type="text"
            placeholder="Enter NID"
            className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
         />
      </div>


      {/* RFID */}
      <div className="space-y-1">
         <label className="text-textGray">RFID :</label>
         <input
            type="text"
            placeholder="Enter RFID"
            className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
         />
      </div>

   </div>

   <h5 className="text-textGray font-medium mt-6 mb-2">Academic Information</h5>
   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 mb-6">
      
      {/* Class */}
      <div className="space-y-2">
         <label className="text-textGray">Class :</label>
         <select
         id=""
         name=""
         defaultValue="Nursery"
         value={studentData.class}
         onChange={(event)=> {handleChange("class", event)}}
         className="bg-bgGray w-full rounded px-1 py-2 border-2 text-textGray border-transparent focus:border-#DB9E30 focus:outline-none"
         >
            <option value="Nursery">Nursery</option>
            <option value="Class One">Class One</option>
            <option value="Class Two">Class Two</option>
         </select>
      </div>
      
      {/* Roll No */}
      <div className="space-y-1">
         <label className="text-textGray">Roll No :</label>
         <input
            type="number"
            placeholder="Enter Roll No"
            className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
         />
      </div>
      
      {/* Student ID */}
      <div className="space-y-1">
         <label className="text-textGray">Student ID :</label>
         <input
            type="number"
            placeholder="Enter Student ID"
            value={studentData.id}
            onChange={(event)=> {handleChange("id", event)}}
            className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
         />
      </div>
      
      {/* Admission Year  */}
      <div className="space-y-2">
         <label className="text-textGray">Admission Year :</label>
         <select
         id=""
         name=""
         defaultValue="2024"
         className="bg-bgGray w-full rounded px-1 py-2 border-2 text-textGray border-transparent focus:border-#DB9E30 focus:outline-none"
         >
            <option value="2024">2024</option>
            <option value="2025">2025</option>
         </select>
      </div>

      
   </div>

   <h5 className="text-textGray font-medium mt-6 mb-2">Admission Information</h5>
   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 mb-2">

      {/* Date */}
      <div className="space-y-1">
         <label className="text-textGray">Date :</label>
         <input
            type="date"
            className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
         />
      </div>
            
      {/* TC No */}
      <div className="space-y-1">
         <label className="text-textGray">TC No :</label>
         <input
            type="number"
            placeholder="Enter TC No"
            className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
         />
      </div>
            
      {/* Birth Certificate */}
      <div className="space-y-1">
         <label className="text-textGray">Birth Certificate :</label>
         <input
            type="number"
            placeholder="Enter Birth Certificate"
            className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
         />
      </div>
            
      {/* Nationality  */}
      <div className="space-y-2">
         <label className="text-textGray">Nationality :</label>
         <select
         id=""
         name=""
         defaultValue="Bangladeshi"
         className="bg-bgGray w-full rounded px-1 py-2 border-2 text-textGray border-transparent focus:border-#DB9E30 focus:outline-none"
         >
            <option value="Bangladeshi">Bangladeshi</option>
            <option value="Other">Other</option>
         </select>
      </div>
   </div>

   <h5 className="text-textGray font-medium mt-6 mb-2">Gurdian Information</h5>
   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 mb-2">

      {/* Parent  */}
      <div className="space-y-2">
         <label className="text-textGray">Parent :</label>
         <select
         id=""
         name=""
         defaultValue="Select Parent"
         className="bg-bgGray w-full rounded px-1 py-2 border-2 text-textGray border-transparent focus:border-#DB9E30 focus:outline-none"
         >
            <option value="Select Parent" disabled>Select Parent</option>
         </select>
      </div>

      {/* Gurdian Name */}
      <div className="space-y-1">
         <label className="text-textGray">Gurdian Name :</label>
         <input
            type="text"
            placeholder="Enter Gurdian Name"
            className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
         />
      </div>

      {/* Relation */}
      <div className="space-y-1">
         <label className="text-textGray">Relation :</label>
         <input
            type="text"
            placeholder="Enter Relation"
            className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
         />
      </div>
      
      {/* Gurdian Phone Number */}
      <div className="space-y-1">
         <label className="text-textGray">Gurdian Phone Number :</label>
         <input
            type="text"
            placeholder="Enter Gurdian Phone Number"
            className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
         />
      </div>


      {/* Gurdian Occupation */}
      <div className="space-y-1">
         <label className="text-textGray">Gurdian Occupation :</label>
         <input
            type="text"
            placeholder="Enter Gurdian Occupation"
            className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
         />
      </div>
      
      {/* Gurdian NID */}
      <div className="space-y-1">
         <label className="text-textGray">Gurdian NID :</label>
         <input
            type="number"
            placeholder="Enter Gurdian Phone Number"
            className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
         />
      </div>
      
      {/* Father Name */}
      <div className="space-y-1">
         <label className="text-textGray">Father Name :</label>
         <input
            type="text"
            placeholder="Enter Father Name"
            className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
         />
      </div>
      
      {/* Father Phone Number */}
      <div className="space-y-1">
         <label className="text-textGray">Father Phone Number :</label>
         <input
            type="text"
            placeholder="Enter Father Phone Number"
            className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
         />
      </div>

      
      {/* Mother Name */}
      <div className="space-y-1">
         <label className="text-textGray">Mother Name :</label>
         <input
            type="text"
            placeholder="Enter Mother Name"
            className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
         />
      </div>

      {/* Mother Phone Number */}
      <div className="space-y-1">
         <label className="text-textGray">Mother Phone Number :</label>
         <input
            type="text"
            placeholder="Enter Mother Phone Number"
            className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
         />
      </div>

   </div>
</>
    );
}