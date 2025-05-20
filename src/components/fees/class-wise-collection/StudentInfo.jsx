const students = [
  {
    id: 1,
    name: "John Doe",
    roll: "10",
    fatherName: "Mr. Doe",
    motherName: "Mrs. Doe",
    class: "10",
    section: "A",
    session: "2023-2024",
  },
];

const StudentShowcase = () => {
  const student = students[0]; 

  return (
   <div className="bg-white shadow-lg p-4 m-4 border border-gray-400 rounded-md mx-auto">
      <h3 className="text-lg font-bold mb-2">Student Information</h3>
      <div className="grid grid-cols-2">
      <p><strong>Name:</strong> {student.name}</p>
      <p><strong>ID:</strong> {student.id}</p>
      <p><strong>Roll:</strong> {student.roll}</p>
      <p><strong>Class:</strong> {student.class}</p>
      <p><strong>Section:</strong> {student.section}</p>
      <p><strong>Session:</strong> {student.session}</p>
      <p><strong>Father's Name:</strong> {student.fatherName}</p>
      <p><strong>Mother's Name:</strong> {student.motherName}</p>
      </div>
   </div>

  );
};

export default StudentShowcase;
