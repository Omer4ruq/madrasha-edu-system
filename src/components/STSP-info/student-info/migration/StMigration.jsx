import MigGetForm from "./MigGetForm";
import MigSetForm from "./MigSetForm";
import MigTable from "./MigTable";

export default function StMigration() {
  return (
    <div className="bg-white px-4 py-6 rounded mt-4">
      <MigGetForm/>

      <MigTable />

      <MigSetForm />
    </div>
  )
}
