import { Link } from "react-router-dom"

export default function SingleNotif() {

  const notifs =[
   {
     "title": "System Update Scheduled",
     "date": "2024-10-15"
   },
   {
     "title": "New Comment on Your Post",
     "date": "2024-10-14"
   },
   {
     "title": "Meeting Reminder: Marketing Team",
     "date": "2024-10-14"
   }
 ]
 
  return (
   <div className="absolute z-50 bg-white shadow rounded top-9 md:top-10 right-0 w-60 md:w-72 py-1 text-#DB9E30 font-medium text-start tracking-wide cursor-pointer">
    {
      notifs.map((item, index) => (
        <Link key={index}>
          <div className={`px-3 md:px-4 py-[6px] hover:bg-bgGray ${index !=0 && "border-t-2"}`}>
            <p className="text-sm">{item.title}</p>
            <p className="text-xs text-textGray">{item.date}</p>
          </div>
        </Link>
      ))
    }
   </div>
  )
}

