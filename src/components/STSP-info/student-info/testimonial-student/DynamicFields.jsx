export default function DynamicFields() {
   const values = ["name", "father_name", "mother_name", "village", "post_office", "police_station_upzilla", "district", "exam_name", "exam_center", "exam_held_date", "board_name", "group_name", "roll", "registration_no", "session", "result", "date_of_birth"];
   const father_name = "{father_name}";
    return (
        <div className="pt-6">
            <h3 className="text-xl mb-2">Variables :</h3>
         {
            values.map((item, i) => <span key={i} className="mr-2 border border-slate-400 rounded p-2 leading-10 dashed">{`{${item}}`}</span>)
         }

        <h3 className="text-#DB9E30/65 mt-4 mb-6"><span className="underline">Note</span> :  Use $(Dollar) sign before using a variable. Example: ${father_name}</h3>

        </div>
    );
}