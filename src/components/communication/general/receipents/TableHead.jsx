export default function TableHead({borderStyle=""}) {
    return (
      <table className="w-full text-textGray text-sm leading-6 sm:leading-8">
         <thead className={`border-b-2 bg-bgBlue ${borderStyle}`}>
            <tr>
               <th className="w-2/12">
               </th>
               <th className="w-3/12">ID No</th>
               <th className="w-7/12">NAME</th>
            </tr>
         </thead>
   </table>
    );
}