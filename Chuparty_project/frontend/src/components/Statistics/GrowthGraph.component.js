import React from "react";
import { Line } from "react-chartjs-2";
import {
  MDBContainer,
  MDBBtn,
  MDBDropdown,
  MDBDropdownToggle,
  MDBDropdownMenu,
  MDBDropdownItem,
  MDBBadge,
} from "mdbreact";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

class GrowthGraph extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeCourse: localStorage["activeCourse"],
      dataLine: null,
      startDate: new Date(),
      endDate: new Date(),
      dateWarning: "",
    };
  }

  componentDidMount() {
    this.setDataline(false);
  }

  setDataline = (filter) => {
    let activeCourse = this.state.activeCourse;
    if (activeCourse === undefined) {
      let logged_courses = localStorage["logged_courses"].split(",");
      console.log(logged_courses);
      if (logged_courses.length > 0) {
        activeCourse = logged_courses[0];
      }
    }

    let logged_exams_solved = JSON.parse(localStorage["logged_exams_solved"]);
    let curr_course_logged_exams_solved = [
      ...logged_exams_solved.filter(
        (elm, index) => elm["courseName"] === activeCourse
      ),
    ];

    let curr_dataline = {
      labels: [],
      datasets: [
        {
          label: activeCourse,
          fill: true,
          lineTension: 0.3,
          backgroundColor: "rgba(184, 185, 210, .3)",
          borderColor: "rgb(35, 26, 136)",
          borderCapStyle: "butt",
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: "miter",
          pointBorderColor: "rgb(35, 26, 136)",
          pointBackgroundColor: "rgb(255, 255, 255)",
          pointBorderWidth: 10,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: "rgb(0, 0, 0)",
          pointHoverBorderColor: "rgba(220, 220, 220, 1)",
          pointHoverBorderWidth: 2,
          pointRadius: 1,
          ymax: 100,
          ymin: 0,
          pointHitRadius: 10,
          data: [],
        },
      ],
    };

    curr_course_logged_exams_solved.forEach((elm, index) => {
      let dateSolved = elm["dateSolved"];
      let timeSolved = elm["timeSolved"];
      let examGrade = elm["examGrade"];

      let startDate =
        this.state.startDate.getFullYear() +
        "-" +
        (this.state.startDate.getMonth() + 1) +
        "-" +
        this.state.startDate.getDate();
      console.log(startDate);
      let stateDateObj = new Date(startDate);

      let endDate =
        this.state.endDate.getFullYear() +
        "-" +
        (this.state.endDate.getMonth() + 1) +
        "-" +
        this.state.endDate.getDate();
      console.log(endDate);
      let endDateObj = new Date(endDate);

      if (filter) {
        let dateSolvedObj = new Date(dateSolved + "T00:00:00");
        console.log(dateSolvedObj);
        console.log(stateDateObj);
        console.log(endDateObj);
        console.log("--------------");
        if (dateSolvedObj >= stateDateObj && dateSolvedObj <= endDateObj) {
          curr_dataline.labels.push("(" + dateSolved + " " + timeSolved + ")");
          curr_dataline.datasets[0].data.push(examGrade);
        }
      } else {
        curr_dataline.labels.push("(" + dateSolved + " " + timeSolved + ")");
        curr_dataline.datasets[0].data.push(examGrade);
      }
    });

    this.setState({ dataLine: curr_dataline });
  };

  changeCompActiveCourse = async (e, course) => {
    await this.setState({ activeCourse: course });
    this.setDataline(false);
  };

  handleChangeStart = (date) => {
    if (date <= this.state.endDate) {
      this.setState({
        startDate: date,
        dateWarning: "",
      });
    } else {
      this.setState({ dateWarning: "בחר תאריך סיום המאוחר מתאריך ההתחלה" });
    }
  };

  handleChangeEnd = (date) => {
    if (date >= this.state.startDate) {
      this.setState({
        endDate: date,
        dateWarning: "",
      });
    } else {
      this.setState({ dateWarning: "בחר תאריך סיום המאוחר מתאריך ההתחלה" });
    }
  };

  render() {
    let logged_courses = localStorage["logged_courses"].split(",");
    let lineChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        xAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: "זמן פתרון הבחינה",
            },
          },
        ],
        yAxes: [
          {
            gridLines: {
              display: true,
              color: "rgba(0, 0, 0, 0.1)",
            },
            ticks: {
              beginAtZero: true,
              max: 100,
              min: 0,
            },
            scaleLabel: {
              display: true,
              labelString: "ציון",
            },
          },
        ],
      },
    };

    let activeCourse = this.state.activeCourse;
    if (activeCourse === undefined) {
      let logged_courses = localStorage["logged_courses"].split(",");
      console.log(logged_courses);
      if (logged_courses.length > 0) {
        activeCourse = logged_courses[0];
      }
    }

    return (
      <MDBContainer>
        <h3 className="mt-5" dir="RTL" style={{ textAlign: "center" }}>
          <MDBBadge color="primary">
            ציונים במבחנים לאורך זמן - בקורס {activeCourse}
          </MDBBadge>
        </h3>
        <div style={{ textAlign: "center" }} dir="RTL">
          <MDBDropdown>
            <MDBDropdownToggle caret color="info">
              {"בחר קורס "}
            </MDBDropdownToggle>
            <MDBDropdownMenu basic>
              {logged_courses.map((course, index) => {
                return (
                  <MDBDropdownItem
                    key={index}
                    onClick={(e) => this.changeCompActiveCourse(e, course)}
                  >
                    {course}
                  </MDBDropdownItem>
                );
              })}
            </MDBDropdownMenu>
          </MDBDropdown>
        </div>
        <br />
        <div dir="RTL" style={{ textAlign: "center" }}>
          <h5>
            <MDBBadge color="info">סנן על פי תאריכים:</MDBBadge>
          </h5>
          <span>תאריך התחלה: </span>
          <DatePicker
            selected={this.state.startDate}
            onChange={this.handleChangeStart}
          />
          <span>תאריך סיום: </span>
          <DatePicker
            selected={this.state.endDate}
            onChange={this.handleChangeEnd}
          />
          <MDBBtn
            color="indigo"
            type="submit"
            onClick={() => {
              this.setDataline(true);
            }}
          >
            סנן
          </MDBBtn>
          <MDBBtn
            color="indigo"
            type="submit"
            onClick={() => {
              this.setDataline(false);
            }}
          >
            בטל סינון
          </MDBBtn>
          <br />
          <label style={{ color: "red" }}>{this.state.dateWarning}</label>
        </div>
        {this.state.dataLine !== null && this.state.dataLine !== undefined && (
          <Line data={this.state.dataLine} options={lineChartOptions} />
        )}
      </MDBContainer>
    );
  }
}

export default GrowthGraph;
