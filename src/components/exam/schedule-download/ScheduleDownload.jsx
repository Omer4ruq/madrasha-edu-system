import ScDownloadForm from "./ScDownloadForm";
import ScDownloadTable from "./ScDownloadTable";

export default function ScheduleDownload() {
    return (
      <div className="bg-white rounded-md px-4 py-2 my-2 sm:my-4">
         <ScDownloadForm />

         <ScDownloadTable />
      </div>
    );
}