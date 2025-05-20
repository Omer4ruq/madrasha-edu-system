import EntryDateExpForm from "./ExpenseEDForm";
import ExpenseTable from "./ExpenseTable";

export default function ExpenseEntryDate() {
    return (
      <div className="my-4 bg-white rounded-md p-4 md:p-6">
        
        <EntryDateExpForm />

        <ExpenseTable />
        
      </div>
    );
}