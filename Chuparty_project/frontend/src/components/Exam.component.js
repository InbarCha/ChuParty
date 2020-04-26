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

  chooseExam = () => {};

  getExamsArr = () => {
    let content = [];

    this.state.exams.forEach((elm, index) => {
      let examID = Object.keys(elm)[0];
      let examName = elm[examID]["name"];
      let examDate = elm[examID]["date"];
      let writers = elm[examID]["writers"];
      let questions = elm[examID]["questions"];
      let subjects = elm[examID]["subjects"];

      let newExam = (
        <Col xs={12} sm={12} md={6} lg={4} xl={3} key={index}>
          <div
            className={"model col-centered"}
            onClick={this.chooseExam.bind(this, examID)}
            key={index}
          >
            <div className="model_container">
              <div className="model_name">
                <img className="exam_img" alt="" />
                <div style={{ fontSize: "x-large", fontWeight: "bold" }}>
                  {examName} <br /> {examDate}
                </div>
              </div>
              <div className="details_container">
                <div className="detail_container">
                  <span style={{ fontStyle: "italic" }}>Exam Writers:</span>
                  {" " + writers}
                </div>
                <div className="detail_container">
                  <span style={{ fontStyle: "italic" }}>
                    Number of Questions:
                  </span>
                  {" " + questions.length}
                </div>
                <div className="detail_container">
                  <span style={{ fontStyle: "italic" }}>Subjects:</span>
                  {" " + subjects}
                </div>
              </div>
            </div>
          </div>
        </Col>
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
          <Container fluid>
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
