
import { BiErrorAlt } from "react-icons/bi";

export default function ErrorSmall({errorMessage}) {
  return (
   <div className="flex items-center">
      <BiErrorAlt className="text-red w-6 h-6 mr-1" />
      <h3 className="text-red/75 font-bold">Error: {errorMessage}</h3>
   </div>
  )
}
