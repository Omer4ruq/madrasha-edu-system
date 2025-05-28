import { useEffect, useState } from "react";

export default function SingleMark({data}) {
   const [written, setWritten] = useState(0);
   const [MCQ, setMCQ] = useState(0);
   const [total, setTotal] = useState(0);

   useEffect(() => {
      setTotal(parseFloat(written) + parseFloat(MCQ));
    }, [written, MCQ]);


    return (
   <tr className="text-center odd:text-slate-600 even:text-slate-700 even:bg-slate-200">
      <td className="w-2/12">{data.id}</td>
      <td className="w-3/12">{data.name}</td>
      <td className="w-1/12">{data.roll}</td>
      <td className="w-2/12">
         <input 
         type="number" 
         value={written}
         onChange={(e)=>setWritten(e.target.value)}
         className="w-full h-8 focus:outline-#DB9E30 bg-bgGray focus:bg-white px-1 sm:px-2 rounded"></input>
      </td>
      <td className="w-2/12">
         <input 
         type="number" 
         value={MCQ}
         onChange={(e)=>setMCQ(e.target.value)}
         className="w-full h-8 focus:outline-#DB9E30 bg-bgGray focus:bg-white px-1 sm:px-2 ml-2 rounded"></input>
      </td>
      <td className="w-2/12">{total}</td>
    </tr>
    );
}