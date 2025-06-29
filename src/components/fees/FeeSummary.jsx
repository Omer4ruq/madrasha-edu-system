import React, { useState } from "react";
import CurrentFees from "./CurrentFees";
import PreviousFees from "./PreviousFees";

const FeeTabs = () => {
  const [activeTab, setActiveTab] = useState("current");

  return (
    <div className="mt-10">
      {/* Tab Buttons */}
      <div className="flex space-x-2 mb-4 ml-6">
        <button
          onClick={() => setActiveTab("current")}
          className={`px-4 py-2 rounded ${
            activeTab === "current"
              ? "bg-[#DB9E30] text-white"
              : "bg-gray-200 text-black"
          }`}
        >
          বর্তমান ফি
        </button>
        <button
          onClick={() => setActiveTab("previous")}
          className={`px-4 py-2 rounded ${
            activeTab === "previous"
              ? "bg-[#DB9E30] text-white"
              : "bg-gray-200 text-black"
          }`}
        >
          পূর্বের ফি
        </button>
      </div>

      {/* Tab Contents */}
      <div>
        <div className={activeTab === "current" ? "block" : "hidden"}>
          <CurrentFees />
        </div>
        <div className={activeTab === "previous" ? "block" : "hidden"}>
          <PreviousFees />
        </div>
      </div>
    </div>
  );
};

export default FeeTabs;
