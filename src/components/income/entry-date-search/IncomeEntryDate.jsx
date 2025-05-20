import EntryDateIncForm from "./IncomeEDForm";
import IncomeTable from "./IncomeTable";

export default function IncomeEntryDate() {
    return (
      <div className="my-4 bg-white rounded-md p-4 md:p-6">
        
        <EntryDateIncForm />

        <IncomeTable />
        
      </div>
    );
}