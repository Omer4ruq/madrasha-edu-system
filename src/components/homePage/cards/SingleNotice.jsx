export default function SingleNotice({ notice }) {
  let color = "blue";

  switch (notice.type) {
    case "info":
      color = "blue";
      break;
    case "warning":
      color = "red";
      break;
    case "event":
      color = "green";
      break;
    case "vacation":
      color = "yellow";
      break;
  }
  return (
    <div className="p-2 space-y-1">
      <p
        className={`inline py-1 text-[#441a05] rounded-xl text-sm font-semibold bg-${color}`}
      >
        {notice.date}
      </p>
      <p className="text-xs font-medium">{notice.content}</p>
      {notice.description && (
        <p className="text-xs text-gray-600 mt-1">{notice.description}</p>
      )}
    </div>
  );
}
