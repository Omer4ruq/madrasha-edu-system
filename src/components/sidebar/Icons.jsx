import { CgCommunity } from "react-icons/cg";
import { CiDollar } from "react-icons/ci";
import { FaCloudDownloadAlt, FaFileInvoiceDollar, FaMoneyCheckAlt, FaRegCheckSquare } from "react-icons/fa";
import { FaPeopleGroup } from "react-icons/fa6";
import { GiPayMoney, GiReceiveMoney, GiTakeMyMoney } from "react-icons/gi";
import { GrTableAdd } from "react-icons/gr";
import { HiOutlineBuildingStorefront, HiOutlineTableCells } from "react-icons/hi2";
import { IoMdSettings } from "react-icons/io";
import { LiaSmsSolid } from "react-icons/lia";
import { LuFileText } from "react-icons/lu";
import { MdAccountBalance, MdAccountBalanceWallet, MdOutlineEventAvailable, MdOutlineTextsms, MdVideoSettings } from "react-icons/md";
import { PiChalkboardTeacherFill, PiExamBold, PiPresentationChartBold, PiShapesFill, PiStudentBold } from "react-icons/pi";
import { RiDashboardHorizontalFill, RiParentFill, RiServiceLine } from "react-icons/ri";
import { TbReportMoney } from "react-icons/tb";


export default function Icons({ name }) {
  switch (name) {
    case "RiDashboardHorizontalFill":
      return <RiDashboardHorizontalFill />;

    case "HiOutlineBuildingStorefront":
      return <HiOutlineBuildingStorefront />;

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
