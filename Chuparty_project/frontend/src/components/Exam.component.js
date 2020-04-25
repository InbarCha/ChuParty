import React, { Component } from "react";
import { Container, Row, Col } from "react-bootstrap";

if (!process.env.NODE_ENV || process.env.NODE_ENV === "development")
  console.log("DEV enabled");
const EXAMS_ROUTE =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development"
    ? "http://localhost:8000/api/getExams"
    : "/api/getExams";
const EXAMS_FROM_COURSE_ROUTE =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development"
    ? "http://localhost:8000/api/getExamsFromCourse?courseName="
    : "/api/getExams/getExamsFromCourse?courseName=";

export default class Exam extends Component {
  constructor() {
    super();
    this.state = {
      exams: [],
      activeCourse: localStorage["activeCourse"],
    };
  }

  componentDidMount() {
    if (this.state.activeCourse !== "") {
      fetch(EXAMS_FROM_COURSE_ROUTE + this.state.activeCourse)
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          this.setState({ exams: data });
        })
        .catch((err) => console.error("error while fetching exmas:", err));
    } else {
      fetch(EXAMS_ROUTE)
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          this.setState({ exams: data });
        })
        .catch((err) => console.error("error while fetching exmas:", err));
    }
  }

  getExamsArr = () => {};

  render() {
    let res =
      this.state.exams !== null ? (
        <React.Fragment>
          {this.state.activeCourse !== "" && (
            <div className="active_model_title">
              <div style={{ fontSize: "xx-large" }}> Exams </div>
              <span style={{ fontStyle: "italic", fontSize: "large" }}>
                {" "}
                Course:
              </span>
              <span className="active_model"> {this.state.activeCourse}</span>
            </div>
          )}
          <Container fluid>{this.getExamsArr()}</Container>
        </React.Fragment>
      ) : (
        <div>
          <span>Loading Exams..</span>
        </div>
      );
    return res;
  }
}
