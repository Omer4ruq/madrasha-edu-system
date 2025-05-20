import { useEffect, useState } from "react";
import LargeTable from "./LargeTable";
import MediumTable from "./MediumTable";
import ReceipentsHeader from "./ReceipentsHeader";
import SmallTable from "./SmallTable";
import people from "./dummyDB";

export default function SelectedParent() {

  const [data, setData] = useState([]);
  const [tableData1, setTableData1] = useState([]);
  const [tableData2, setTableData2] = useState([]);
  const [tableData3, setTableData3] = useState([]);
  const [device, setDevice] = useState('small');

  const [allChecked, setAllChecked] = useState(false);
  const [checkedState, setCheckedState] = useState({});

  //check window size and populate people state.
  useEffect(() => {
    const handleResize = () => {
      if(window.innerWidth >= 1200){
        setDevice('large');
      }else if(window.innerWidth >= 768){
        setDevice('medium');
      } else {
        setDevice("small");
      }
    };
    //add resize event listener
    window.addEventListener('resize', handleResize);
    //update state
    setData(people);
    //invoke the resize function once initially get the scrren measurement.
    handleResize(); 
    //callback to remove eventListener
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if(data.length > 0){
      if(device === "medium"){
      //if medium screen, slice the data in two arrays.
      const halfLength = Math.ceil(data.length / 2);
      setTableData1(data.slice(0, halfLength));
      setTableData2(data.slice(halfLength));
      } else if(device === "large"){
        //if large screen, slice the data in three arrays.
        const oneThirdLength = Math.ceil(data.length / 3);
        setTableData1(data.slice(0, oneThirdLength));
        setTableData2(data.slice(oneThirdLength, oneThirdLength*2));
        setTableData3(data.slice(oneThirdLength*2));
      }
    }
  }, [data, device]);

  // console.log(checkedState);
  function handleCheckboxChange(id){
   const newCheckedState = { ...checkedState, [id]: !checkedState[id] };
   setCheckedState(newCheckedState);

   if (checkedState[id]) {
     setAllChecked(false);
   } else {
     const allCheckedNow = data.every(person => newCheckedState[person.id]);
     setAllChecked(allCheckedNow);
   }
  }

  const handleAllCheckboxChange = () => {
    const newCheckedState = {};
    data.forEach(person => {
      newCheckedState[person.id] = !allChecked;
    });
    //update the checkedState object
    setCheckedState(newCheckedState);
    //update the allChecked with opposite value
    setAllChecked(!allChecked);
  };

    return (
      <div className="space-y-2 border-2 rounded-md">
        {/* Header Section */}
        <ReceipentsHeader allChecked={allChecked} handleAllCheckboxChange={handleAllCheckboxChange} />

        {/* Table Section based on device width*/}
        {
        (device==="small") ?
        <SmallTable persons={data} checkedState={checkedState} handleCheckboxChange={handleCheckboxChange} />
        :
        (device==="medium") ?
        <MediumTable tableData1={tableData1} tableData2={tableData2} checkedState={checkedState} handleCheckboxChange={handleCheckboxChange} />
        :
        <LargeTable tableData1={tableData1} tableData2={tableData2} tableData3={tableData3} checkedState={checkedState} handleCheckboxChange={handleCheckboxChange} />
        }
      </div>
    );
}