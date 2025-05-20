export default function SubjectNumber({data}) {
    return (
      <th className="min-w-20">
         <div className="text-base -rotate-[91deg] space-y-3 leading-3">
         <h3>{data.written}</h3>
         <h3>{data.MCQ}</h3>
         </div>
      </th>
    );
}