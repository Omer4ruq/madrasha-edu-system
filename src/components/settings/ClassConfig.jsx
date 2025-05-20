import { classConfig } from "../../data/classConfig";
import ClassConfigForm from "./class-config/ClassConfigForm";
import ClassConfigTable from "./class-config/ClassConfigTable";

export default function ClassConfig() {
    return (
        <div className="bg-white rounded-md px-4 py-2 my-2 sm:my-4">

            <ClassConfigForm />

            <ClassConfigTable classConfig={classConfig} />
      </div>
    );
}