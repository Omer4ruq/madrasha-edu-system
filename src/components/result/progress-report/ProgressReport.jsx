import ProRepForm from "./ProRepForm";
import ReportCards from "./ReportCards";

export default function ProgressReport() {
    return (
      <div className="bg-white rounded-md px-4 py-2 my-2 sm:my-4">
         <ProRepForm />

         <ReportCards />
      </div>
    );
}