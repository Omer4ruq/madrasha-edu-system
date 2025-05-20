import React from "react";
import "../create-routine/style.css";
import { useTranslation } from "react-i18next";

export default function ClassRoutineTable() {
   const days = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

   const savedRoutine = [
      [
        {
          "subject": "English",
          "teacher": "Akter"
        },
        {
          "subject": "History",
          "teacher": "Akmal"
        },
        {
          "subject": "Chemistry",
          "teacher": "Jahan"
        },
        {
          "subject": "English",
          "teacher": "Akter"
        },
        {
          "subject": "History",
          "teacher": "Akmal"
        },
        {
          "subject": "History",
          "teacher": "Akmal"
        }
      ],
      [
        {
          "subject": "Math",
          "teacher": "Alim"
        },
        {
          "subject": "English",
          "teacher": "Akter"
        },
        {
          "subject": "History",
          "teacher": "Akmal"
        },
        {
          "subject": "History",
          "teacher": "Akmal"
        },
        {
          "subject": "History",
          "teacher": "Akmal"
        },
        {
          "subject": "Chemistry",
          "teacher": "Jahan"
        }
      ],
      [
        {
          "subject": "Math",
          "teacher": "Alim"
        },
        {
          "subject": "English",
          "teacher": "Akter"
        },
        {
          "subject": "History",
          "teacher": "Akmal"
        },
        {
          "subject": "History",
          "teacher": "Akmal"
        },
        {
          "subject": "History",
          "teacher": "Akmal"
        },
        {
          "subject": "Chemistry",
          "teacher": "Jahan"
        }
      ],
      [
        {
          "subject": "Math",
          "teacher": "Alim"
        },
        {
          "subject": "English",
          "teacher": "Akter"
        },
        {
          "subject": "History",
          "teacher": "Akmal"
        },
        {
          "subject": "History",
          "teacher": "Akmal"
        },
        {
          "subject": "History",
          "teacher": "Akmal"
        },
        {
          "subject": "Chemistry",
          "teacher": "Jahan"
        }
      ],
      [
        {
          "subject": "Math",
          "teacher": "Alim"
        },
        {
          "subject": "English",
          "teacher": "Akter"
        },
        {
          "subject": "History",
          "teacher": "Akmal"
        },
        {
          "subject": "History",
          "teacher": "Akmal"
        },
        {
          "subject": "History",
          "teacher": "Akmal"
        },
        {
          "subject": "Chemistry",
          "teacher": "Jahan"
        }
      ],
      [
        {
          "subject": "English",
          "teacher": "Akter"
        },
        {
          "subject": "History",
          "teacher": "Akmal"
        },
        {
          "subject": "Chemistry",
          "teacher": "Jahan"
        },
        {
          "subject": "English",
          "teacher": "Akter"
        },
        {
          "subject": "History",
          "teacher": "Akmal"
        },
        {
          "subject": "History",
          "teacher": "Akmal"
        }
      ]
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
                    <div className="subject">
                      <p>{item.subject}</p>
                      <p>{item.teacher}</p>
                    </div>
                </div>
               )
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
}