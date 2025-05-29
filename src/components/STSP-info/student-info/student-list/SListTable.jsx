import { Link } from "react-router-dom";

export default function SListTable({studentsData, amountToShow, index, handleDelete}) {

  const showItems = studentsData?.slice(index*Math.floor(amountToShow), index*Math.floor(amountToShow) + Math.floor(amountToShow));
  

    return (
      <div className="overflow-x-scroll border mt-6 rounded shadow-md">
      <table className="w-full text-textGray text-sm">
      <thead className="border-b-2 bg-bgBlue leading-8">
        <tr>
          <th className="min-w-10 text-start pl-2">#</th>
          <th className="min-w-12 text-start">ID</th>
          <th className="min-w-[72px] text-start">PICTURE</th>
          <th className="min-w-36 text-start">NAME</th>
          <th className="min-w-12 text-start">RFID</th>
          <th className="min-w-16 text-start">GENDER</th>
          <th className="min-w-16 text-start">CLASS</th>
          <th className="min-w-16 text-start">SECTION</th>
          <th className="min-w-16 text-start">SHIFT</th>
          <th className="min-w-20 text-start">MOBILE</th>
          <th className="min-w-40 text-center">ACTIONS</th>
        </tr>
      </thead>
      <tbody className="divide-y-2 font-medium">
        {showItems?.map((item, index) => (
          <tr key={index} className="text-start leading-8 even:bg-slate-200">
          <td className="min-w-10 pl-2">{index+1}</td>
          <td className="min-w-12">{item.id}</td>
          <td className="min-w-[72px]">
            <img 
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQp0Bjks3GU1iN8K5J-D9JIcL2OR2rF4WX6mg&s"
            className="w-8 h-8 rounded-full ml-2" ></img>
         </td>
          <td className="min-w-36">{item.name}</td>
          <td className="min-w-12">{item.rfid}</td>
          <td className="min-w-16">{item.gender}</td>
          <td className="min-w-16">{item.class}</td>
          <td className="min-w-16">{item.section}</td>
          <td className="min-w-16">{item.shift}</td>
          <td className="min-w-20">{item.mobile}</td>
          <td className="min-w-40 pb-1 text-center">
             <Link to={`/student-info/edit-student/${item.id}`}>
                <button
                   className="bg-blue px-3 py-1 rounded shadow text-white hover:-translate-y-[2px] duration-200 text-sm m-1"
                >
                   Edit
                </button>
              </Link>
              <button
                className="bg-red px-3 py-1 rounded shadow text-white hover:-translate-y-[2px] duration-200 text-sm m-1"
                onClick={()=>handleDelete(item.name)}
              >
                Delete
              </button>
          </td>
          </tr>
        ))}
      </tbody>
    </table>
      </div>
    );
}