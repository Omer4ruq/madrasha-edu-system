import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const data = {
  labels: ["Present", "Absent"],
  datasets: [
    {
      label: "Number of Students",
      data: [300, 50],
      backgroundColor: ["#441a05", "#DB9E30"],
    },
  ],
};

export default function StudentAttendance() {
  return (
    <div className="flex justify-center mt-1 mb-4">
      <div className="w-44 sm:w-52 md:w-48">
        <Doughnut data={data} />
      </div>
    </div>
  );
}
