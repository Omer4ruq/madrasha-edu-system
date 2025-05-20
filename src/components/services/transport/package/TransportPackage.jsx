import Package from "../../services-common/package/Package";

export default function TransportPackage() {
   const data = [
      {
         name: "Bus Fare",
         amount: "350",
      },
      {
         name: "Van Fare",
         amount: "500",
      },
   ]
   
  return (
   <Package title="Transport" data={data} />
  )
}