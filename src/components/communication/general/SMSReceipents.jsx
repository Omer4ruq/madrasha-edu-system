import PClass from "./receipents/PClass"
import PSection from "./receipents/PSection"
import SelectedEmployee from "./receipents/SelectedEmployee"
import SelectedParent from "./receipents/SelectedParent"


export default function SMSReceipents({selectedValue}) {
   switch(selectedValue){
      case "PClass" :
         return <PClass />
      case "PSection":
         return <PSection />
      case "Teacher":
         break;
      case "Staff":
         break;
      case "Selected Parent" :
         return <SelectedParent />
      case "Selected Employee":
         return <SelectedEmployee />
      case "Institute":
         break;
   }
}