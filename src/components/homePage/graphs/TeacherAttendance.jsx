import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const data = {
  labels: ["Present", "Absent"],
  datasets: [
    {
      label: "Number of Teachers",
      data: [30, 2],
      backgroundColor: ["#71dd37", "#ff3e1d"],
    },
  ],
};

export default function TeacherAttendance() {
  return (
    <div className="flex justify-center mt-1 mb-4">
      <div className="w-44 sm:w-52 md:w-48">
        <Doughnut data={data} />
      </div>
    </div>
  );
}
