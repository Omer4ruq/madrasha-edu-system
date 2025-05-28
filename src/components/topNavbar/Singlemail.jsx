import { Link } from "react-router-dom";

export default function Singlemail() {
   const mails = [
      {
        "title": "Welcome to Our Service",
        "senderEmail": "welcome@service.com"
      },
      {
        "title": "Your Monthly Report",
        "senderEmail": "reports@service.com"
      },
      {
        "title": "Password Reset Request",
        "senderEmail": "support@service.com"
      },
      {
        "title": "New Features Update",
        "senderEmail": "updates@service.com"
      },
      {
        "title": "Invitation to Join Our Webinar",
        "senderEmail": "events@service.com"
      },
    ]
    
  return (
   <div className="absolute z-50 bg-white shadow rounded top-9 md:top-10 right-0 w-60 md:w-72 py-1 text-[#441a05] font-medium text-start tracking-wide cursor-pointer">
    {
      mails.map((item, index) => (
        <Link key={index}>
          <div className={`px-3 md:px-4 py-[6px] hover:bg-bgGray ${index !=0 && "border-t-2"}`}>
            <p className="text-sm">{item.title}</p>
            <p className="text-xs text-textGray">Sender: {item.senderEmail}</p>
          </div>
        </Link>
      ))
    }
   </div>
  )
}
