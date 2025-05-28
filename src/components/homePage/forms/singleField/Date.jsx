export default function Date({ style }) {
  return (
    <div className={`space-y-1 ${style}`}>
      <h5 className="font-bold ">Date</h5>
      <input
        type="date"
        id=""
        name=""
        className="bg-bgGray w-full rounded px-1 py-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
      />
    </div>
  );
}
