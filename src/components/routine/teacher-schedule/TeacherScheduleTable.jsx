import React from "react";
import "../create-routine/style.css";
import { useTranslation } from "react-i18next";

export default function TeacherScheduleTable() {
   const days = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

   const savedRoutine = [
      [
        {
          "class": "One Jaba",
          "subject": "Bangla"
        },
        {
          "class": "",
          "subject": ""
        },
        {
          "class": "",
          "subject": ""
        },
        {
          "class": "One Jaba",
          "subject": "Bangla"
        },
        {
          "class": "Four Kolom",
          "subject": "English"
        },
        {
          "class": "",
          "subject": ""
        },
      ],
      [
        {
          "class": "One Jaba",
          "subject": "Bangla"
        },
        {
          "class": "Four Kolom",
          "subject": "English"
        },
        {
          "class": "",
          "subject": ""
        },
        {
          "class": "One Jaba",
          "subject": "Bangla"
        },
        {
         "class": "",
         "subject": ""
       },
        {
          "class": "Four Kolom",
          "subject": "English"
        },
      ],
      [
        {
          "class": "",
          "subject": ""
        },
        {
          "class": "Two Golap",
          "subject": "English"
        },
        {
          "class": "Four Beli",
          "subject": "Bangla"
        },
        {
         "class": "",
         "subject": ""
       },
        {
          "class": "Two Golap",
          "subject": "English"
        },
        {
          "class": "",
          "subject": ""
        },
      ],
      [
        {
          "class": "Four Jaba",
          "subject": "Bangla"
        },
        {
          "class": "",
          "subject": ""
        },
        {
         "class": "Two Golap",
         "subject": "English"
       },
       {
         "class": "One Jaba",
         "subject": "Bangla"
       },
        {
         "class": "",
         "subject": ""
       },
        {
          "class": "",
          "subject": ""
        },
      ],
      [
      {
         "class": "Three Tiger",
         "subject": "Bangla"
         },
         {
         "class": "Two Golap",
         "subject": "English"
         },
         {
            "class": "Five Apple",
            "subject": "Math"
          },
        {
          "class": "",
          "subject": ""
        },
        {
          "class": "Two Golap",
          "subject": "English"
        },
        {
          "class": "Five Apple",
          "subject": "Math"
        },
      ],
      [
        {
          "class": "Three Tiger",
          "subject": "Bangla"
        },
        {
          "class": "",
          "subject": ""
        },
        {
          "class": "",
          "subject": ""
        },
        {
         "class": "Three Tiger",
         "subject": "Bangla"
       },
        {
         "class": "",
         "subject": ""
       },
        {
          "class": "Two Golap",
          "subject": "English"
        },
      ],

   ]

const {t} = useTranslation();
    return (
      <div id="schedule-container">
        <div id="schedule" style={{ gridTemplateColumns: `100px repeat(${savedRoutine.length}, 1fr)`}} >
          {/* Header row */}
          <div className="header"></div>
          {Array.from({ length: savedRoutine.length }, (_, i) => (
            <div key={i} className="header">{t("module.routine.period")} {i + 1}</div>
          ))}

          {/* Days and Periods */}
          {days.map((day, dayIndex) => (
            <React.Fragment key={day}>
              {/* the copy paste button */}
              <div className="day-label">
                {day}
              </div>
              {
               savedRoutine[dayIndex].map((item, index) => (
                  <div
                  key={index}
                  className="period"
                  >
                    {item?.class && <div className="subject">
                      <p>{item?.class}</p>
                      <p>{item?.subject}</p>
                    </div>}
                </div>
               )
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
}