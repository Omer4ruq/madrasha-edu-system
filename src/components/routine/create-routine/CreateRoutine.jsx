import React, { useState } from "react";
import { FaRegCopy } from "react-icons/fa6";
import { MdOutlineContentPaste } from "react-icons/md";
import { RxCrossCircled } from "react-icons/rx";
import { useTranslation } from "react-i18next"; // Import useTranslation
import "./style.css";

const CreateRoutine = () => {
  const { t } = useTranslation(); // Initialize translation function

  const days = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

  const subjectAndTeachers = [
    { subject: "Math", teacher: "Alim" },
    { subject: "English", teacher: "Akter" },
    { subject: "Chemistry", teacher: "Jahan" },
    { subject: "History", teacher: "Akmal" },
  ];

  const [numPeriods, setNumPeriods] = useState(6);
  const [schedule, setSchedule] = useState(days.map(() => Array(6).fill(null)));
  const [copiedDay, setCopiedDay] = useState(null);

  const createSchedule = (e) => {
    e.preventDefault();
    setNumPeriods(Number(e.target[0].value));
    const newSchedule = days.map(() => Array(Number(e.target[0].value)).fill(null));
    setSchedule(newSchedule);
  };

  const handleDragStart = (e, item) => {
    e.dataTransfer.setData("application/json", JSON.stringify(item));
  };

  const handleDrop = (e, dayIndex, periodIndex) => {
    e.preventDefault();
    const droppedItem = JSON.parse(e.dataTransfer.getData("application/json"));
    const newSchedule = [...schedule];
    newSchedule[dayIndex][periodIndex] = droppedItem;
    setSchedule(newSchedule);
  };

  const saveRoutine = () => {
    const routineData = days.reduce((acc, day, index) => {
      acc[day] = schedule[index];
      return acc;
    }, {});
    console.log(JSON.stringify(routineData, null, 2));
  };

  const copyDay = (dayIndex) => {
    setCopiedDay(schedule[dayIndex]);
  };

  const pasteDay = (dayIndex) => {
    if (copiedDay) {
      const newSchedule = [...schedule];
      newSchedule[dayIndex] = [...copiedDay];
      setSchedule(newSchedule);
    }
  };

  return (
    <div className="bg-white rounded-md p-4 my-2 sm:my-4">
      <div id="form-container">
        <form onSubmit={createSchedule} id="period-form">
          <label htmlFor="num-periods">{t("module.routine.number_of_periods")}</label>
          <input
            type="number"
            id="num-periods"
            min="1"
            max="10"
            className=""
            defaultValue="6"
            required
          />
          <button type="submit">{t("module.routine.create_schedule")}</button>
        </form>
      </div>

      <div id="subjects">
        {subjectAndTeachers.map((item, index) => (
          <div
            key={index}
            className="subject"
            draggable
            onDragStart={(e) => handleDragStart(e, item)}
          >
            <p>{item.subject}</p>
            <p>({item.teacher})</p>
          </div>
        ))}
      </div>

      <div id="schedule-container">
        <div id="schedule" style={{ gridTemplateColumns: `100px repeat(${numPeriods}, 1fr)` }}>
          <div className="header"></div>
          {Array.from({ length: numPeriods }, (_, i) => (
            <div key={i} className="header">{t("module.routine.period")} {i + 1}</div>
          ))}
          {days.map((day, dayIndex) => (
            <React.Fragment key={day}>
              <div className="day-label">
                {day}
                <FaRegCopy className="icon copy-row" onClick={() => copyDay(dayIndex)} title={t("module.routine.copy")} />
                <MdOutlineContentPaste className="icon paste-row" onClick={() => pasteDay(dayIndex)} title={t("module.routine.paste")} />
              </div>
              {Array.from({ length: numPeriods }, (_, periodIndex) => (
                <div
                  key={periodIndex}
                  className="period"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, dayIndex, periodIndex)}
                >
                  {schedule[dayIndex] && schedule[dayIndex][periodIndex] && (
                    <div className="subject">
                      <p>{schedule[dayIndex][periodIndex]?.subject}</p>
                      <p>({schedule[dayIndex][periodIndex]?.teacher})</p>
                    </div>
                  )}
                  <RxCrossCircled
                    className="delete"
                    onClick={() => {
                      const newSchedule = [...schedule];
                      newSchedule[dayIndex][periodIndex] = null;
                      setSchedule(newSchedule);
                    }}
                    title={t("module.routine.delete")}
                  />
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      <button id="save-button" onClick={saveRoutine}>
        {t("module.routine.save")}
      </button>
    </div>
  );
};

export default CreateRoutine;
