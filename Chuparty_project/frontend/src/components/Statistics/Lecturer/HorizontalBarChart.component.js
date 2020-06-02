import React from "react";
import { HorizontalBar } from "react-chartjs-2";
import { css } from "@emotion/core";
import RotateLoader from "react-spinners/ClipLoader";
import {
  MDBContainer,
  MDBBtn,
  MDBDropdown,
  MDBDropdownToggle,
  MDBDropdownMenu,
  MDBDropdownItem,
  MDBBadge,
} from "mdbreact";

export class HorizontalBarChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataHorizontal: null,
      studentAvgGrades: this.props.studentAvgGrades,
    };
  }

  componentDidMount() {
    this.setDataline();
  }

  generateColor() {
    var rint = Math.round(0xffffff * Math.random());
    return (
      "rgb(" +
      (rint >> 16) +
      "," +
      ((rint >> 8) & 255) +
      "," +
      (rint & 255) +
      ")"
    );
  }

  setDataline = () => {
    if (this.state.studentAvgGrades !== null) {
      let students_avg_grades = this.state.studentAvgGrades;
      let logged_courses = localStorage["logged_courses"].split(",");

      let curr_dataline = {
        labels: [],
        datasets: [
          {
            label: "ציון ממוצע לכל קורס",
            data: [],
            borderWidth: 2,
            backgroundColor: [],
            borderWidth: 2,
            borderColor: [],
          },
        ],
      };

      Object.keys(students_avg_grades).forEach((key, index) => {
        let current_course = key;
        if (logged_courses.indexOf(current_course) >= 0) {
          let current_course_avg_grade = students_avg_grades[key];

          curr_dataline.labels.push(current_course);
          curr_dataline.datasets[0].data.push(current_course_avg_grade);
          let color = this.generateColor();
          curr_dataline.datasets[0].backgroundColor.push(color);
          curr_dataline.datasets[0].borderColor.push(color);
        }
      });

      this.setState({ dataHorizontal: curr_dataline });
    }
  };

  render() {
    let horizontalChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        xAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: "ציון",
            },
            ticks: {
              beginAtZero: true,
              max: 100,
              min: 0,
            },
          },
        ],
        yAxes: [
          {
            gridLines: {
              display: true,
              color: "rgba(0, 0, 0, 0.1)",
            },
            scaleLabel: {
              display: true,
              labelString: "קורס",
            },
          },
        ],
      },
    };

    let res = (
      <div>
        <MDBContainer>
          <h3 className="mt-5" dir="RTL" style={{ textAlign: "center" }}>
            <MDBBadge color="primary">
              ציון ממוצע לכל הסטודנטים, בכל קורס (מהקורסים שלי)
            </MDBBadge>
          </h3>
          {this.state.dataHorizontal !== null &&
            this.state.dataHorizontal !== undefined && (
              <HorizontalBar
                data={this.state.dataHorizontal}
                options={horizontalChartOptions}
              />
            )}
        </MDBContainer>
      </div>
    );

    return res;
  }
}

export default HorizontalBarChart;
