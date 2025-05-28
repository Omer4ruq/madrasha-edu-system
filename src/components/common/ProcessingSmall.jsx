import loading from "/images/loading-4.gif";
export default function ProcessingSmall() {
  return (
   <div className="flex items-center">
      <img src={loading} alt="loading" className="w-6 h-6 mr-1" />
      <h3 className="text-#DB9E30/70 font-bold">Processing ...</h3>
   </div>
  )
}
