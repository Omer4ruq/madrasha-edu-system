import Package from "../../services-common/package/Package";

export default function CoachingPackage() {
   const data = [
      {
         name: "Bangla Coaching",
         amount: "1500",
      },
      {
         name: "English Coaching",
         amount: "2000",
      },
      {
         name: "Math Coaching",
         amount: "2000",
      }
   ]
   
  return (
   <Package title="Coaching" data={data} />
  )
}