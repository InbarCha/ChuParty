import React, { Component } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { css } from "@emotion/core";
import RotateLoader from "react-spinners/ClipLoader";
import Exam from "./Exam.component";
import AddExam from "./AddExam.component";
import EditExam from "./EditExam.component";
import {
  MDBBtn,
  MDBDropdown,
  MDBDropdownToggle,
  MDBDropdownMenu,
  MDBDropdownItem,
} from "mdbreact";
import ScrollToBottom from "react-scroll-to-bottom";

if (!process.env.NODE_ENV || process.env.NODE_ENV === "development")
  console.log("DEV enabled");
const EXAMS_FROM_COURSE_ROUTE =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development"
    ? "http://localhost:8000/api/getExamsFromCourse?courseName="
    : "/api/getExamsFromCourse?courseName=";
const GENERATE_EXAM_ROUTE =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development"
    ? "http://localhost:8000/api/generateExam"
    : "/api/generateExam";

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
      generateExamNumOfQuestions: 10,
      loading: false,
    };
  }

  componentDidMount() {
    if (this.state.activeCourse !== undefined) {
      this.setState({ loading: true });
      fetch(EXAMS_FROM_COURSE_ROUTE + this.state.activeCourse)
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          this.setState({ exams: data, loading: false });
          this.SetSonComponents();
        })
        .catch((err) => console.error("error while fetching exams 1:", err));
    }
  }

  SetSonComponents = () => {
    let sonComponents = [];

    this.state.exams.forEach((elm, index) => {
      let newExam = "";
      if (elm !== "" && (elm !== null) & (elm !== undefined)) {
        newExam = (
          <Exam
            bounce={false}
            key={index}
            index={index}
            parentClickHandler={this.props.parentClickHandler}
            exam={this.state.exams[index]}
            changeExamComponent={this.changeExamComponent}
          />
        );
      }
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

    if (Object.keys(exam)[0] !== localStorage["activeExamID"]) {
      localStorage["activeExamID"] = Object.keys(exam)[0];
    }

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

  addExamToSonComponents = (exam) => {
    let sonComponents = this.state.sonComponents;
    sonComponents.pop();

    let exams = this.state.exams;
    this.setState({
      exams: [...exams, exam],
      sonComponents: sonComponents,
    });

    this.SetSonComponents();
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
            parentClickHandler={this.props.parentClickHandler}
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
        //create default empty exam
        let exam = {};
        exam["examID"] = {};
        exam["examID"]["course"] = this.state.activeCourse;
        exam["examID"]["date"] = "2020-01-01";
        exam["examID"]["name"] = "";
        exam["examID"]["questions"] = [];
        exam["examID"]["subjects"] = ["None"];
        exam["examID"]["writers"] = [""];

        sonComponents = [
          ...sonComponents,
          <AddExam
            key={sonComponents.length}
            index={sonComponents.length}
            exam={exam}
            deleteFromSonComponents={this.deleteFromSonComponents}
            addExamToSonComponents={this.addExamToSonComponents}
          />,
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

  generateExam = () => {
    let request_body = {
      course: this.state.activeCourse,
      numberOfQuestions: this.state.generateExamNumOfQuestions,
      username: localStorage["loggedUsername"],
    };
    this.setState({ loading: true });
    fetch(GENERATE_EXAM_ROUTE, {
      method: "post",
      body: JSON.stringify(request_body),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        this.setState({ loading: false });

        if (data["Status"] === "Generated an Exam") {
          let generatedExam = data["Generated Exam"];
          let exams = this.state.exams;
          this.setState({ exams: [...exams, generatedExam] });
          this.SetSonComponents();
        } else {
          window.alert("Can't generate an exam");
        }
      })
      .catch((err) => {
        console.error("error while editing exam:", err);
        this.setState({ loading: false });
      });
  };

  changeNumOfQuestions = (e, numberOfQuestions) => {
    this.setState({ generateExamNumOfQuestions: numberOfQuestions });
  };

  render() {
    let res =
      this.state.exams !== null ? (
        <div dir="RTL">
          <div className="page_title"> מבחנים </div>
          {this.state.activeCourse !== "" && (
            <div className="active_model_title">
              <span style={{ fontStyle: "italic", fontSize: "x-large" }}>
                קורס:
              </span>
              <span className="active_model"> {this.state.activeCourse}</span>
            </div>
          )}
          <Container fluid className="model_items_container">
            {localStorage["logged_type"] === "Student" && (
              <Row className="narrow_row">
                <Col className="text-center">
                  <MDBDropdown>
                    <MDBDropdownToggle caret color="info">
                      {"בחר מספר שאלות במבחן "}
                    </MDBDropdownToggle>
                    <MDBDropdownMenu basic>
                      <MDBDropdownItem
                        onClick={(e) => this.changeNumOfQuestions(e, 10)}
                      >
                        10
                      </MDBDropdownItem>
                      <MDBDropdownItem
                        onClick={(e) => this.changeNumOfQuestions(e, 12)}
                      >
                        12
                      </MDBDropdownItem>
                    </MDBDropdownMenu>
                  </MDBDropdown>
                  <MDBBtn
                    color="info"
                    type="submit"
                    onClick={this.generateExam}
                  >
                    ג'נרט מבחן
                  </MDBBtn>
                  <RotateLoader
                    css={override}
                    size={30}
                    loading={this.state.loading}
                  />
                </Col>
              </Row>
            )}
            {(localStorage["logged_type"] === "Admin" ||
              localStorage["logged_type"] === "Lecturer") && (
              <span
                className="material-icons add_course_icon"
                onClick={this.addExam}
              >
                add
              </span>
            )}
            <Row>{this.state.sonComponents}</Row>
          </Container>
        </div>
      ) : this.state.activeCourse !== undefined ? (
        <div className="col-centered models_loading" dir="RTL">
          <div className="loading_title"> טוען מבחנים... </div>
          <RotateLoader css={override} size={50} loading={this.state.loading} />
        </div>
      ) : (
        <div dir="RTL">
          <div className="page_title"> שאלות </div>
          <div className="active_model_title">
            <span
              style={{ fontStyle: "italic", fontSize: "x-large", color: "red" }}
            >
              בעיה בטעינת מבחנים: לא נבחר קורס
            </span>
          </div>
        </div>
      );
    return res;
  }
}
