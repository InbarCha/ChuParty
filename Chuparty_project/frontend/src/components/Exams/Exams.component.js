import React, { Component } from "react";
import { Container, Row } from "react-bootstrap";
import Exam from "./Exam.component";

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

export default class Exams extends Component {
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

  getExamsArr = () => {
    let content = [];

    this.state.exams.forEach((elm, index) => {
      let newExam = (
        <Exam
          parentClickHandler={this.props.parentClickHandler}
          exam={elm}
          key={index}
          chooseExam={this.chooseExam}
        />
      );
      content.push(newExam);
    });

    return content;
  };

  render() {
    let res =
      this.state.exams !== null ? (
        <React.Fragment>
          <div className="page_title"> Exams </div>
          {this.state.activeCourse !== "" && (
            <div className="active_model_title">
              <span style={{ fontStyle: "italic", fontSize: "x-large" }}>
                Course:
              </span>
              <span className="active_model"> {this.state.activeCourse}</span>
            </div>
          )}
          <Container fluid className="model_items_container">
            <Row>{this.getExamsArr()}</Row>
          </Container>
        </React.Fragment>
      ) : (
        <div>
          <span>Loading Exams..</span>
        </div>
      );
    return res;
  }
}
