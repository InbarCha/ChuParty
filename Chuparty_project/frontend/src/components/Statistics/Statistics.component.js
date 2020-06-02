import React, { Component } from "react";
import GrowthGraph from "./Student/GrowthGraph.component";
import BarChart from "./Student/BarChart.component";
import BarChartLecturer from "./Lecturer/BarChartLecturer.component";

export default class Statistics extends Component {
  render() {
    let res =
      localStorage["logged_exams_solved"] !== undefined &&
      localStorage["logged_questions_answered"] !== undefined ? (
        <div>
          {localStorage["logged_type"] === "Student" && (
            <React.Fragment>
              <GrowthGraph />
              <br /> <br />
              <hr />
              <BarChart />
            </React.Fragment>
          )}
          {localStorage["logged_type"] === "Lecturer" && (
            <div>Statistics for Lecturer</div>
          )}
        </div>
      ) : (
        <BarChartLecturer />
      );
    return res;
  }
}
