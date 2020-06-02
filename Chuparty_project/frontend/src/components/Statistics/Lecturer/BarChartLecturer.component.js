import React, { Component } from "react";
import { Bar } from "react-chartjs-2";
import {
  MDBContainer,
  MDBBtn,
  MDBDropdown,
  MDBDropdownToggle,
  MDBDropdownMenu,
  MDBDropdownItem,
  MDBBadge,
} from "mdbreact";

export class BarChartLecturer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeCourse: localStorage["activeCourse"],
      dataBar: null,
      studentSuccessRates: this.props.studentSuccessRates,
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
    if (this.state.studentSuccessRates !== null) {
      let activeCourse = this.state.activeCourse;
      if (activeCourse === undefined) {
        let logged_courses = localStorage["logged_courses"].split(",");
        console.log(logged_courses);
        if (logged_courses.length > 0) {
          activeCourse = logged_courses[0];
        }
      }

      let students_success_rates = this.state.studentSuccessRates;
      let curr_course_students_success_rates =
        students_success_rates[activeCourse];

      let curr_dataline = {
        labels: [],
        datasets: [
          {
            label: activeCourse,
            data: [],
            borderWidth: 2,
            backgroundColor: [],
            borderWidth: 2,
            borderColor: [],
          },
        ],
      };

      if (
        curr_course_students_success_rates !== null &&
        curr_course_students_success_rates !== undefined
      ) {
        Object.keys(curr_course_students_success_rates).forEach(
          (key, index) => {
            let currect_subject = key;
            let currect_subject_success_rate =
              curr_course_students_success_rates[key];

            curr_dataline.labels.push(currect_subject);
            curr_dataline.datasets[0].data.push(currect_subject_success_rate);
            let color = this.generateColor();
            curr_dataline.datasets[0].backgroundColor.push(color);
            curr_dataline.datasets[0].borderColor.push(color);
          }
        );
      }
      this.setState({ dataBar: curr_dataline });
    }
  };

  changeCompActiveCourse = async (e, course) => {
    await this.setState({ activeCourse: course });
    this.setDataline();
  };

  render() {
    let logged_courses = localStorage["logged_courses"].split(",");
    let barChartOptions = {
      tooltips: {
        callbacks: {
          title: function (tooltipItem, data) {
            return data["labels"][tooltipItem[0]["index"]];
          },
          label: function (tooltipItem, data) {
            return (
              data["datasets"][0]["data"][tooltipItem["index"]].toFixed(0) + "%"
            );
          },
        },
      },
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        xAxes: [
          {
            barPercentage: 1,
            gridLines: {
              display: true,
              color: "rgba(0, 0, 0, 0.1)",
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
            },
            scaleLabel: {
              display: true,
              labelString: "Percentage",
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

    let res = (
      <div>
        <MDBContainer>
          <h3 className="mt-5" dir="RTL" style={{ textAlign: "center" }}>
            <MDBBadge color="primary">
              {" "}
              אחוז ממוצע השאלות שנענו נכון לכל נושא - לכלל הסטודנטים - בקורס{" "}
              {activeCourse}
            </MDBBadge>
          </h3>
          <div style={{ textAlign: "center" }} dir="RTL">
            <MDBDropdown>
              <MDBDropdownToggle caret color="info">
                {"בחר קורס "}
              </MDBDropdownToggle>
              <br />
              <br />
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
          {this.state.dataBar !== null && this.state.dataBar !== undefined && (
            <Bar data={this.state.dataBar} options={barChartOptions} />
          )}
        </MDBContainer>
      </div>
    );
    return res;
  }
}

export default BarChartLecturer;
