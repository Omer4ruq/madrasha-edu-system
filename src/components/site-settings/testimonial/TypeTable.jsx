export default function TypeTable({handleEdit, handleDelete}) {
   const dummyDate= [
    {
      name: "John Doe",
      designation: "Software Engineer",
      image: "https://via.placeholder.com/150",
      testimonial: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    },
    {
      name: "Jane Doe",
      designation: "Software Engineer",
      image: "https://via.placeholder.com/150",
      testimonial: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    },
    {
      name: "John Doe",
      designation: "Software Engineer",
      image: "https://via.placeholder.com/150",
      testimonial: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    },
    {
      name: "John Doe",
      designation: "Software Engineer",
      image: "https://via.placeholder.com/150",
      testimonial: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    }
   ];
   
    return (
      <div className="border my-6 rounded shadow-md overflow-x-scroll">
      <table className="w-full text-textGray text-sm">
      <thead className="border-b-2 bg-bgBlue leading-10">
        <tr>
          <th className="w-1/12">#</th>
          <th className="w-1/12 min-w-40">Image</th>
          <th className="w-2/12 min-w-24">Name</th>
          <th className="w-2/12 min-w-40">Designation</th>
          <th className="w-4/12 min-w-40">Testimonial</th>
          <th className="w-2/12 min-w-40">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y-2 font-medium leading-5">
        {dummyDate.map((item, index) => (
          <tr key={index} className="text-center">
            <td className="w-1/12">{index + 1}</td>
            <td className="w-1/12"><img src={item.image} alt={item.name} className="w-10 h-10 rounded-full" /></td>
            <td className="w-2/12">{item.name}</td> 
            <td className="w-2/12">{item.designation}</td>
            <td className="w-4/12">{item.testimonial}</td>
            <td className="w-2/12">
                <button
                  className="bg-blue px-3 py-1 rounded shadow text-white hover:-translate-y-[2px] duration-200 text-sm m-1"
                  onClick={() => handleEdit(item)}
                >
                  Edit
                </button>
                <button
                  className="bg-red px-3 py-1 rounded shadow text-white hover:-translate-y-[2px] duration-200 text-sm m-1"
                  onClick={()=>handleDelete(item.mainHeading)}
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