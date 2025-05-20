import Package from "../../services-common/package/Package";

export default function HostelPackage() {
   const data = [
      {
         name: "Hostel 1",
         amount: "1000",
      },
      {
         name: "Hostel 2",
         amount: "2000",
      },
      {
         name: "Hostel 3",
         amount: "3000",
      }
   ]
   
  return (
   <Package title="Hostel" data={data} />
  )
}