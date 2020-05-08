import React, { Component } from "react";
import { Container, Row } from "react-bootstrap";
import { css } from "@emotion/core";
import RotateLoader from "react-spinners/ClipLoader";
import Exam from "./Exam.component";
import AddExam from "./AddExam.component";
import EditExam from "./EditExam.component";

if (!process.env.NODE_ENV || process.env.NODE_ENV === "development")
  console.log("DEV enabled");
const ALL_EXAMS_ROUTE =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development"
    ? "http://localhost:8000/api/getExams"
    : "/api/getExams";
const EXAMS_FROM_COURSE_ROUTE =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development"
    ? "http://localhost:8000/api/getExamsFromCourse?courseName="
    : "/api/getExamsFromCourse?courseName=";

const override = css`
  display: block;
  margin: 0 auto;
`;

export default class Exams extends Component {
  constructor() {
    super();
    this.state = {
      exams: null,
      activeCourse: localStorage["activeCourse"],
      sonComponents: [],
    };
  }

  componentDidMount() {
    if (this.state.activeCourse !== "") {
      fetch(EXAMS_FROM_COURSE_ROUTE + this.state.activeCourse)
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          this.setState({ exams: data });
          this.SetSonComponents();
        })
        .catch((err) => console.error("error while fetching exams 1:", err));
    } else {
      fetch(ALL_EXAMS_ROUTE)
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          this.setState({ exams: data });
          this.SetSonComponents();
        })
        .catch((err) => console.error("error while fetching exmas 2:", err));
    }
  }

  SetSonComponents = () => {
    let sonComponents = [];

    this.state.exams.forEach((elm, index) => {
      let newExam = (
        <Exam
          bounce={false}
          key={index}
          index={index}
          parentClickHandler={this.props.parentClickHandler}
          exam={this.state.exams[index]}
          changeExamComponent={this.changeExamComponent}
        />
      );
      sonComponents.push(newExam);
    });

    this.setState({ sonComponents: sonComponents });
  };

  createDeepCopyExam = (exam) => {
    console.log(exam);
    let examID = Object.keys(exam)[0];

    let course = exam[examID]["course"];
    let courseName = Object.keys(course)[0];
    let courseSubjects = course[courseName]["subjects"];
    let course_copy = {};
    course_copy[courseName] = {};
    course_copy[courseName]["subjects"] = [...courseSubjects];

    let name = exam[examID]["name"];
    let date = exam[examID]["date"];

    let questions = exam[examID]["questions"];
    let questions_copy = [];
    questions.forEach((question, index) => {
      let body = Object.keys(question)[0];
      let question_copy = {};
      question_copy[body] = {};
      question_copy[body]["answers"] = [...question[body]["answers"]];
      question_copy[body]["correctAnswer"] = question[body]["correctAnswer"];
      question_copy[body]["course"] = course_copy;
      question_copy[body]["difficulty"] = question[body]["difficulty"];
      question_copy[body]["subject"] = question[body]["subject"];

      questions_copy.push(question_copy);
    });

    let subjects = exam[examID]["subjects"];
    let subjects_copy = [...subjects];

    let writers = exam[examID]["writers"];
    let writers_copy = [...writers];

    let exam_copy = {};
    exam_copy[examID] = {};
    exam_copy[examID]["course"] = course_copy;
    exam_copy[examID]["date"] = date;
    exam_copy[examID]["name"] = name;
    exam_copy[examID]["questions"] = questions_copy;
    exam_copy[examID]["subjects"] = subjects_copy;
    exam_copy[examID]["writers"] = writers_copy;

    return exam_copy;
  };

  changedExam = (exam, index) => {
    let exams = this.state.exams;
    exams[index] = exam;
    this.setState({ exams: exams });
  };

  deleteFromSonComponents = (index) => {
    let exams = this.state.exams;
    let sonComponents = this.state.sonComponents;

    console.log(sonComponents.length - 1);
    console.log(index);

    if (index < sonComponents.length - 1) {
      exams[index] = "";
      sonComponents[index] = "";
    } else if (index === sonComponents.length - 1) {
      sonComponents.pop();
    }

    this.setState({ exams: exams, sonComponents: sonComponents });
  };

  changeExamComponent = (index, component) => {
    let sonComponents = this.state.sonComponents;
    let exam_orig = "";
    let exam_copy = "";
    if (index !== -1) {
      exam_orig = this.state.exams[index];
      exam_copy = this.createDeepCopyExam(exam_orig);
    }

    switch (component) {
      case "EDIT":
        sonComponents[index] = (
          <EditExam
            key={index}
            index={index}
            exam={exam_copy}
            exam_orig={exam_orig}
            changeExamComponent={this.changeExamComponent}
            changedExam={this.changedExam}
            deleteFromSonComponents={this.deleteFromSonComponents}
          />
        );
        break;
      case "EXAM":
        sonComponents[index] = (
          <Exam
            bounce={true}
            key={index}
            index={index}
            parentClickHandler={this.props.parentClickHandler}
            exam={this.state.exams[index]}
            changeExamComponent={this.changeExamComponent}
          />
        );
        break;
      case "ADD_EXAM":
        sonComponents = [
          ...sonComponents,
          <AddExam key={sonComponents.length} index={sonComponents.length} />,
        ];
        break;
      default:
        console.log("no handler for:", component);
    }

    this.setState({ sonComponents: sonComponents });
  };

  addExam = () => {
    this.changeExamComponent(-1, "ADD_EXAM");
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
            <span
              className="material-icons add_course_icon"
              onClick={this.addExam}
            >
              add
            </span>
            <Row>{this.state.sonComponents}</Row>
          </Container>
        </React.Fragment>
      ) : (
        <div className="col-centered courses_loading">
          <RotateLoader css={override} />
        </div>
      );
    return res;
  }
}
