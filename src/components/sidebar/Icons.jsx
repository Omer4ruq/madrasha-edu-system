import { CgCommunity } from "react-icons/cg";
import { CiDollar } from "react-icons/ci";
import { FaCalendarAlt, FaCloudDownloadAlt, FaFileInvoiceDollar, FaMoneyCheckAlt, FaPlaceOfWorship, FaRegCheckSquare, FaUsers } from "react-icons/fa";
import { FaHotel, FaPeopleGroup } from "react-icons/fa6";
import { GiNetworkBars, GiPayMoney, GiReceiveMoney, GiTakeMyMoney } from "react-icons/gi";
import { GrTableAdd } from "react-icons/gr";
import { HiAcademicCap, HiOutlineBuildingStorefront, HiOutlineTableCells } from "react-icons/hi2";
import { IoMdSettings } from "react-icons/io";
import { LiaSmsSolid } from "react-icons/lia";
import { LuFileText } from "react-icons/lu";
import { MdAccountBalance, MdAccountBalanceWallet, MdAttachment, MdOutlineEventAvailable, MdOutlineTextsms, MdVideoSettings } from "react-icons/md";
import { PiChalkboardTeacherFill, PiExamBold, PiPresentationChartBold, PiShapesFill, PiStudentBold } from "react-icons/pi";
import { RiDashboardHorizontalFill, RiParentFill, RiServiceLine } from "react-icons/ri";
import { TbReportAnalytics, TbReportMoney } from "react-icons/tb";
import { BsBank2 } from "react-icons/bs";



export default function Icons({ name }) {
  switch (name) {
    case "FaCalendarAlt":
      return <FaCalendarAlt />;

    case "RiDashboardHorizontalFill":
      return <RiDashboardHorizontalFill />;

    case "FaPlaceOfWorship":
      return <FaPlaceOfWorship />;

    case "FaHotel":
      return <FaHotel />;

    case "TbReportAnalytics":
      return <TbReportAnalytics  />;

    case "GiNetworkBars":
      return <GiNetworkBars  />;

    case "HiOutlineBuildingStorefront":
      return <HiOutlineBuildingStorefront />;

    case "HiAcademicCap":
      return <HiAcademicCap />;
      
    case "BsBank":
      return <BsBank2 />;
      
    case "FaUsers ":
      return <FaUsers />;

    case "MdOutlineEventAvailable":
      return <MdOutlineEventAvailable />;

    case "CgCommunity":
      return <CgCommunity />;
    
    case "FaFileInvoiceDollar":
      return <FaFileInvoiceDollar />;

    case "IoMdSettings":
      return <IoMdSettings />;

    case "LiaSmsSolid":
      return <LiaSmsSolid />

    case "FaRegCheckSquare":
      return <FaRegCheckSquare />

    case "RiParentFill":
      return <RiParentFill />

    case "FaPeopleGroup":
      return <FaPeopleGroup />

    case "PiChalkboardTeacherFill":
      return <PiChalkboardTeacherFill />

    case "PiStudentBold":
      return <PiStudentBold />

    case "LuFileText":
      return <LuFileText />

    case "PiExamBold":
      return <PiExamBold />

    case "GrTableAdd":
      return <GrTableAdd />

    case "HiOutlineTableCells":
      return <HiOutlineTableCells />

    case "FaCloudDownloadAlt":
      return <FaCloudDownloadAlt />

    case "CiDollar":
      return <CiDollar />

    case "FaMoneyCheckAlt":
      return <FaMoneyCheckAlt />

    case "RiServiceLine":
      return <RiServiceLine />

    case "GiReceiveMoney":
      return <GiReceiveMoney />

    case "GiPayMoney":
      return <GiPayMoney />

    case "GiTakeMyMoney":
      return <GiTakeMyMoney />

    case "MdAccountBalanceWallet":
      return <MdAccountBalanceWallet />

    case "MdAccountBalance":
      return <MdAccountBalance />

    case "TbReportMoney":
      return <TbReportMoney />

    case "PiPresentationChartBold":
      return <PiPresentationChartBold />

    case "MdOutlineTextsms":
      return <MdOutlineTextsms />

    case "MdVideoSettings":
      return <MdVideoSettings />

    default:
      return <PiShapesFill />
  }
}
