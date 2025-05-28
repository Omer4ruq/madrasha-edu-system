export default function Section({ style }) {
  return (
    <div className={`space-y-1 ${style}`}>
      <h5 className="font-bold ">Section</h5>
      <select
        id="class"
        name="class"
        defaultValue="default"
        className="bg-bgGray w-full rounded px-1 py-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
      >
        <option value="default" disabled>
          select section
        </option>
        <option value="A">A</option>
        <option value="B">B</option>
        <option value="C">C</option>
        <option value="D">D</option>
      </select>
    </div>
  );
}
