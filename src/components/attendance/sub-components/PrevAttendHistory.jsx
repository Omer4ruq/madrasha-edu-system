export default function PrevAttendHistory({history}) {
    return (
        <div className="flex items-center justify-center gap-1">
         {
            history.map((item,index)=>
            <div key={index} className={`${item ? "bg-blue" : "bg-red"} w-3 h-3 rounded-full text-blue flex items-center justify-center`}>
               <div className="w-2 h-2 bg-white rounded-full flex items-center justify-center">
                  <div className={`${item ? "bg-blue" : "bg-red"} w-[6px] h-[6px] rounded-full`}></div>
               </div>
             </div>)
         }
        </div>
    );
}