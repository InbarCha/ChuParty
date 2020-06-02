import React from "react";
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

export class BarChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeCourse: localStorage["activeCourse"],
      dataBar: null,
    };
  }

  componentDidMount() {
    this.setDataline();
  }

  changeCompActiveCourse = async (e, course) => {
    await this.setState({ activeCourse: course });
    this.setDataline();
  };

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
    if (localStorage["logged_questions_answered"] !== undefined) {
      let activeCourse = this.state.activeCourse;
      if (activeCourse === undefined) {
        let logged_courses = localStorage["logged_courses"].split(",");
        console.log(logged_courses);
        if (logged_courses.length > 0) {
          activeCourse = logged_courses[0];
        }
      }

      let logged_questions_answered = JSON.parse(
        localStorage["logged_questions_answered"]
      );
      let curr_course_logged_questions_answered = [
        ...logged_questions_answered.filter(
          (elm, index) => elm["courseName"] === activeCourse
        ),
      ];

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

      curr_course_logged_questions_answered.forEach((elm, index) => {
        elm["questionsAnsweredPerSubject"].forEach((elm, index) => {
          let subjectName = elm["subjectName"];
          let numAnsweredCorrect = elm["answeredCorrect"].length;
          let numAnsweredWrong = elm["answeredWrong"].length;

          let numToPush = 0;
          if (numAnsweredCorrect !== 0 || numAnsweredWrong !== 0) {
            numToPush =
              numAnsweredCorrect / (numAnsweredWrong + numAnsweredCorrect);
          }

          curr_dataline.labels.push(subjectName);
          curr_dataline.datasets[0].data.push(numToPush);

          let color = this.generateColor();
          curr_dataline.datasets[0].backgroundColor.push(color);
          curr_dataline.datasets[0].borderColor.push(color);
        });
      });

      this.setState({ dataBar: curr_dataline });
    }
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
              (data["datasets"][0]["data"][tooltipItem["index"]] * 100).toFixed(
                0
              ) + "%"
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
              callback: function (value) {
                return (value * 100).toFixed(0) + "%"; // convert it to percentage
              },
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

    return (
      <MDBContainer>
        <h3 className="mt-5" dir="RTL" style={{ textAlign: "center" }}>
          <MDBBadge color="primary">
            {" "}
            אחוז השאלות שנענו נכון לכל נושא - בקורס {activeCourse}
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
    );
  }
}

export default BarChart;
