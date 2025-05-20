export default function StWaiverTable({handleEdit, handleDelete}) {

const studentWaivers = [
   {
      id: "001",
      name: "Shams Ohon",
      waiverPercent: "40%",
      feeType: "Tuition Fee",
   },
   {
      id: "002",
      name: "Shahin Alam",
      waiverPercent: "40%",
      feeType: "Tuition Fee",
   },
   {
      id: "003",
      name: "Muktar Ali",
      waiverPercent: "20%",
      feeType: "Exam Fee",
   },
]

    return (
      <div className="border my-6 rounded shadow-md overflow-x-auto">
      <table className="w-full text-textGray text-sm leading-6 sm:leading-8 min-w-[540px]">
      <thead className="border-b-2 bg-bgBlue">
        <tr>
          <th className="w-1/12">ID</th>
          <th className="w-3/12">Student Name</th>
          <th className="w-1/12">Class</th>
          <th className="w-1/12">Section</th>
          <th className="w-2/12">Waiver Percentage</th>
          <th className="w-2/12">Fee Type</th>
          <th className="w-2/12 min-w-36">ACTIONS</th>
        </tr>
      </thead>
      <tbody className="divide-y-2 font-medium">
        {studentWaivers.map(item => (
          <tr key={item.id} className="text-center">
            <td className="w-1/12">{item.id}</td>
            <td className="w-3/12">{item.name}</td>
            <td className="w-1/12">One</td>
            <td className="w-1/12">Ilish</td>
            <td className="w-2/12">{item.waiverPercent}</td>
            <td className="w-2/12">{item.feeType}</td>
            <td className="w-2/12 pb-1">
                <button
                  className="bg-blue px-3 py-1 rounded shadow text-white hover:-translate-y-[2px] duration-200 text-sm m-1"
                  onClick={() => handleEdit(item)}
                >
                  Edit
                </button>
                <button
                  className="bg-red px-3 py-1 rounded shadow text-white hover:-translate-y-[2px] duration-200 text-sm m-1"
                  onClick={()=>handleDelete(item.name + " " + item.feeType + " Waiver")}
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