export default function RadioAttendance() {
    return (
      <form>
         <div className="flex items-center justify-center gap-3">
            <div className="flex gap-1 justify-start items-stretch">
               <input type="radio" id="Present" name="fav_language" value="Present" className="accent-blue"/>
               <label htmlFor="Present">Present</label>
            </div>
            <div className="flex gap-1 justify-start items-baseline">
               <input type="radio" id="Absent" name="fav_language" value="Absent" className="accent-red"/>
               <label htmlFor="Absent">Absent</label>
            </div>
         </div>
      </form>
    );
}