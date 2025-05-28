import img1 from "/images/loading-1.gif";
import img2 from "/images/loading-2.gif";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const Loading = ({ imageNo = 1 }) => {
   const image = imageNo === 1 ? img1 : img2;
  return (
    // <div className="flex flex-col items-center justify-center h-screen">
    //   <img src={image} alt="Error" className="w-full h-auto" />
    //   <p className="text-xl font-bold text-#DB9E30 my-6">Loading ...</p>
    // </div>
     <div className="product-card">
        <Skeleton height={200} />
        <Skeleton count={2} />
        <Skeleton width={100} />
      </div>
  );
};

export default Loading;