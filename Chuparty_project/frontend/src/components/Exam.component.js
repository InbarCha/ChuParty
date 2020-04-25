import React, { Component } from "react";
import { Container, Row, Col } from "react-bootstrap";

if (!process.env.NODE_ENV || process.env.NODE_ENV === "development")
  console.log("DEV enabled");
const EXAMS_ROUTE =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development"
    ? "http://localhost:8000/api/getExamsFromCourse"
    : "/api/getExams";

export default class Exam extends Component {
  constructor() {
    super();
    this.state = {
      exams: [],
      activeCourse: localStorage["activeCourse"],
    };
  }

  componentDidMount() {
    // courses should look like the following:
    // [{"OOP": {subjects: ["Object-Oriented Principles"]}}, ...]
    fetch(EXAMS_ROUTE + "?courseName=" + this.state.activeCourse)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        this.setState({ exams: data });
      })
      .catch((err) => console.error("error while fetching exmas:", err));
  }

  getExamsArr = () => {};

  render() {
    let res =
      this.state.exams !== null ? (
        <React.Fragment>
          <div className="active_course">
            Exams <br />
            Course: {this.state.activeCourse}
          </div>
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
