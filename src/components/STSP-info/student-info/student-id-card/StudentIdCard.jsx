import { FaBarcode } from "react-icons/fa6";
import StudentIdHeader from "./StudentIdHeader";
import { useRef } from "react";

const StudentIdCard = () => {
  const idCardsRef = useRef();

  return (
    <>
      <div className="my-4 rounded p-4 md:p-6 bg-white">
        <StudentIdHeader idCardsRef={idCardsRef} />
        {/* Student ID Cards */}
        <div
          ref={idCardsRef}
          className="idcards flex flex-wrap justify-center mt-10 gap-5"
        >
          <div className="idcard relative z-0 h-[3.375in] w-[2.125in] overflow-hidden">
            <div className="idcard_img">
              <img
                className="h-[3.375in] w-[2.125in]"
                src="/images/idcard.svg"
                alt="idcard template"
              />
            </div>
            <div className="idcard_details z-20 absolute left-0 top-0 w-full h-full overflow-hidden">
              <div className="school_name text-center">
                <h2 className="bg-white text-sm font-semibold text-#DB9E30 pt-1 pb-[2px] px-2 rounded-md mt-5 inline-block">
                  Classic Residential School
                </h2>
              </div>
              <div className="idd_image text-center">
                <img
                  className="w-[75px] h-[75px] inline-block mt-6 mb-2 rounded-md border-#DB9E30 border-2"
                  src="/images/profile.jpg"
                  alt="student image"
                />
              </div>
              <div className="school_logo absolute opacity-[0.2] bottom-14 left-16">
                <img
                  className="w-[75px] h-[75px]"
                  src="/images/urban.png"
                  alt="school logo"
                />
              </div>
              <div className="idd_name">
                <h3 className="text-center text-sm font-medium text-gray-600">
                  Md. Mahtab Kamal
                </h3>
              </div>
              <div
                style={{ fontSize: "10px", lineHeight: "18px" }}
                className="idd_od flex gap-1 justify-between mt-2 px-5"
              >
                <ul className="idd_titles">
                  <li>ID No</li>
                  <li>Name</li>
                  <li>Roll</li>
                  <li>G Name</li>
                  <li>Mobile</li>
                </ul>
                <ul className="idd_colons">
                  <li>:</li>
                  <li>:</li>
                  <li>:</li>
                  <li>:</li>
                  <li>:</li>
                </ul>
                <ul className="idd_data">
                  <li>10018</li>
                  <li>Md. Mahtab Kamal</li>
                  <li>050</li>
                  <li>Md. Mahtab Kamal</li>
                  <li>01XXX34XX33</li>
                </ul>
              </div>
              <div className="barcode text-center mt-2">
                <img className="w-[180px] mb-1 h-[35px] inline-block object-cover" src="/images/barcode.png" alt="barcode" />
                {/* <FaBarcode /> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentIdCard;
