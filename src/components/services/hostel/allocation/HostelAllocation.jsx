import Allocation from "../../services-common/allocation/Allocation";

export default function HostelAllocation() {
   const data = [
      {
         id: "14673",
         name: "Md. Rashedul Islam",
         roll: "10",
         package: "Package 1 - 1000"
      },
      {
         id: "48433",
         name: "Md. Shafiqul Islam",
         roll: "12",
         package: "Package 2 - 2000"
      },
      {
         id: "00253",
         name: "Khan Ahmed Tusher",
         roll: "09",
         package: "Package 1 - 1000"
      },
      {
         id: "12441",
         name: "Md. Kader Uddin",
         roll: "02",
         package: "Package 2 - 2000"
      },
   ]
  return (
    <Allocation title="Hostel" data={data} />
  )
}
