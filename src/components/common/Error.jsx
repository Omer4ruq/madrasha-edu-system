import img1 from "/images/error-1.jpg";
import img2 from "/images/error-2.jpg";
const Error = ({ errorMessage, code, imageNo = 1 }) => {
   const image = imageNo === 1 ? img1 : img2;
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-12">
      <img src={image} alt="Error" className="w-48 h-48" />
      <p className="text-xl font-bold text-red-500 mt-4">An Error Has Occurred</p>
      <p className="text-white mt-2">{code && `Status code: ${code}.`} {errorMessage}</p>
    </div>
  );
};

export default Error;