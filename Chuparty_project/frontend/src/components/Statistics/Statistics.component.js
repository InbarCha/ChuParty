import React, { Component } from "react";
import GrowthGraph from "./Student/GrowthGraph.component";
import BarChart from "./Student/BarChart.component";
import BarChartLecturer from "./Lecturer/BarChartLecturer.component";
import HorizontalBarChart from "./Lecturer/HorizontalBarChart.component";
import { css } from "@emotion/core";
import RotateLoader from "react-spinners/ClipLoader";

const STUDENTS_STATISTICS =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development"
    ? "http://localhost:8000/api/getStudentsStatistics"
    : "/api/getStudentsStatistics";

const override = css`
  display: block;
  margin: 0 auto;
`;

export default class Statistics extends Component {
  constructor(props) {
    super(props);
    this.state = {
      student_success_rates: null,
      student_avg_grades: null,
      loaded_data: false,
    };
  }

  componentDidMount() {
    if (localStorage["logged_type"] === "Lecturer") {
      if (
        localStorage["logged_courses"] !== undefined &&
        localStorage["logged_courses"] !== null &&
        localStorage["logged_courses"].length > 0
      ) {
        fetch(STUDENTS_STATISTICS)
          .then((res) => res.json())
          .then((data) => {
            let student_success_rates = data["Students Success Rates"];
            let student_avg_grades = data["Students Average Grade"];

            this.setState({
              student_success_rates: student_success_rates,
              student_avg_grades: student_avg_grades,
              loaded_data: true,
            });
          })
          .catch((err) =>
            console.error("error while student successRates:", err)
          );
      }
    }
  }

  render() {
    let res = "";
    let logged_courses_exists_flg =
      localStorage["logged_courses"] !== undefined &&
      localStorage["logged_courses"] !== null &&
      localStorage["logged_courses"].length > 0;

    if (this.state.loaded_data === true || !logged_courses_exists_flg) {
      if (logged_courses_exists_flg) {
        if (localStorage["logged_type"] === "Student") {
          if (
            localStorage["logged_questions_answered"] === undefined ||
            localStorage["logged_questions_answered"] === null ||
            localStorage["logged_questions_answered"].length === 0
          ) {
            res = (
              <div dir="RTL">
                <div className="page_title"> סטטיסטיקה </div>
                <div className="active_model_title">
                  <span
                    style={{
                      fontStyle: "italic",
                      fontSize: "x-large",
                      color: "red",
                    }}
                  >
                    אין אפשרות לטעון סטטיסטיקות: עוד לא פתרת מבחנים
                  </span>
                </div>
              </div>
            );
          } else {
            res = (
              <React.Fragment>
                <GrowthGraph />
                <br /> <br />
                <hr />
                <BarChart />
              </React.Fragment>
            );
          }
        } else if (localStorage["logged_type"] === "Lecturer") {
          res = (
            <React.Fragment>
              <HorizontalBarChart
                studentAvgGrades={this.state.student_avg_grades}
              />
              <br /> <br />
              <hr />
              <BarChartLecturer
                studentSuccessRates={this.state.student_success_rates}
              />
            </React.Fragment>
          );
        }
      } else {
        res = (
          <div dir="RTL">
            <div className="page_title"> סטטיסטיקה </div>
            <div className="active_model_title">
              <span
                style={{
                  fontStyle: "italic",
                  fontSize: "x-large",
                  color: "red",
                }}
              >
                אין אפשרות לטעון סטטיסטיקות: ראשית הוסף לקורסים שלך
              </span>
            </div>
          </div>
        );
      }
    } else {
      res = (
        <div className="col-centered models_loading" dir="RTL">
          <div className="loading_title"> טוען נתונים... </div>
          <RotateLoader css={override} size={50} />
        </div>
      );
    }

    return res;
  }
}
