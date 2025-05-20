export default function PersonInfoTable({persons, checkedState, handleCheckboxChange, borderStyle=""}) {
    return (
      <table className="w-full text-textGray text-sm leading-6 sm:leading-8">
      <tbody className="font-medium">
        {persons.map((row) => (
          <tr key={row.id} className={`border-b-2 text-center ${borderStyle}`}>
            <td className="w-2/12">
            {/* if this id does not exist in the checkedState object then give a value of false.*/}
              <input
                type="checkbox"
                checked={checkedState[row.id] || false}
                onChange={() => handleCheckboxChange(row.id)}
              />
            </td>
            <td className="w-3/12">{row.id}</td>
            <td className="w-7/12">{row.name}</td>
          </tr>
        ))}
      </tbody>
    </table>
    );
}