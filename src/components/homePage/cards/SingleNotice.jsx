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
        className={`inline px-2 py-1 rounded-xl text-white text-xs bg-${color}`}
      >
        {notice.date}
      </p>
      <p className="text-xs font-medium">{notice.content}</p>
    </div>
  );
}
