import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const data = {
  labels: ["Paid", "Due"],
  datasets: [
    {
      label: "Number of Students",
      data: [200, 150],
      backgroundColor: ["#71dd37", "#ff3e1d"],
    },
  ],
};

export default function PaymentStat() {
  return (
    <div className="flex justify-center my-2">
      <div className="w-40">
        <Doughnut data={data} />
      </div>
    </div>
  );
}
