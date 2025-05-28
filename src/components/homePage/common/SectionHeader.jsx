import { HiDotsCircleHorizontal } from "react-icons/hi";

export default function SectionHeader({ title }) {
  return (
    <div className="bg-#DB9E30 rounded-t-md shadow-lg flex justify-between items-center p-4">
      <h3 className="text-white text-xl leading-[33px]">{title}</h3>
      <HiDotsCircleHorizontal className="text-white w-7 h-7" />
    </div>
  );
}
