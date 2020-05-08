import React, { Component } from "react";
import { Container, Row, Col } from "react-bootstrap";
import Question from "./Question.component";
import EditQuestion from "./EditQuestion.component";
import { css } from "@emotion/core";
import RotateLoader from "react-spinners/ClipLoader";

if (!process.env.NODE_ENV || process.env.NODE_ENV === "development")
  console.log("DEV enabled");
const EXAM_BY_ID_ROUTE =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development"
    ? "http://localhost:8000/api/getExamByID?examID="
    : "/api/getExamByID?examID=";

const override = css`
  display: block;
  margin: 0 auto;
`;
export class Questions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      exam: "",
      examName: "",
      examDate: "",
      questions: [],
      activeExamsID: localStorage["activeExamID"],
      activeCourse: localStorage["activeCourse"],
      sonComponents: [],
      edit: this.props.edit,
    };
  }

  componentDidMount() {
    if (this.state.activeExamsID !== undefined) {
      fetch(EXAM_BY_ID_ROUTE + this.state.activeExamsID)
        .then((res) => res.json())
        .then((data) => {
          this.setState({ exam: data });
          this.setOtherStateVars();
          if (this.state.edit) {
            this.SetSonComponents("EDIT_QUESTION");
          } else {
            this.SetSonComponents("QUESTION");
          }
          console.log(this.state.questions);
        })
        .catch((err) => console.error("error while fetching exmas:", err));
    }
  }

  setOtherStateVars = () => {
    if (this.state.exam !== "") {
      let examID = Object.keys(this.state.exam)[0];
      let questions = this.state.exam[examID]["questions"];
      let examName = this.state.exam[examID]["name"];
      let examDate = this.state.exam[examID]["date"];
      this.setState({
        questions: questions,
        examName: examName,
        examDate: examDate,
      });
    }
  };

  deleteFromSonComponents = (index) => {};

  createDeepCopyQuestion = (question) => {
    let body = Object.keys(question);
    let course = question[body]["course"];

    let courseName = Object.keys(course)[0];
    let courseSubjects = course[courseName]["subjects"];
    let course_copy = {};
    course_copy[courseName] = {};
    course_copy[courseName]["subjects"] = [...courseSubjects];

    let question_copy = {};
    question_copy[body] = {};
    question_copy[body]["answers"] = [...question[body]["answers"]];
    question_copy[body]["correctAnswer"] = question[body]["correctAnswer"];
    question_copy[body]["course"] = course_copy;
    question_copy[body]["difficulty"] = question[body]["difficulty"];
    question_copy[body]["subject"] = question[body]["subject"];

    return question_copy;
  };

  changedQuestion = (question, index) => {};

  changeQuestionComponent = (index, component) => {
    let sonComponents = this.state.sonComponents;
    let question_orig = "";
    let question_copy = "";
    if (index !== -1) {
      question_orig = this.state.questions[index];
      question_copy = this.createDeepCopyQuestion(question_orig);
    }

    switch (component) {
      case "EDIT":
        sonComponents[index] = (
          <EditQuestion
            question={question_copy}
            question_orig={question_orig}
            key={index}
            index={index}
            changeQuestionComponent={this.changeQuestionComponent}
            changedQuestion={this.changedQuestion}
            deleteFromSonComponents={this.deleteFromSonComponents}
          />
        );
        break;
      case "QUESTION":
        sonComponents[index] = (
          <Question
            question={this.state.questions[index]}
            key={index}
            index={index}
            changeQuestionComponent={this.changeQuestionComponent}
          />
        );
        break;
      case "ADD_QUESTION":
        break;
      default:
        console.log("no handler for:", component);
    }

    this.setState({ sonComponents: sonComponents });
  };

  SetSonComponents = (component) => {
    let sonComponents = [];

    this.state.questions.forEach((elm, index) => {
      let newQuestion = "";

      if (component === "QUESTION") {
        newQuestion = (
          <Question
            question={elm}
            key={index}
            index={index}
            changeQuestionComponent={this.changeQuestionComponent}
          />
        );
      } else if (component === "EDIT_QUESTION") {
        let question_orig = this.state.questions[index];
        let question_copy = this.createDeepCopyQuestion(question_orig);

        newQuestion = (
          <EditQuestion
            question={question_copy}
            question_orig={question_orig}
            key={index}
            index={index}
            changeQuestionComponent={this.changeQuestionComponent}
            changedQuestion={this.changedQuestion}
            deleteFromSonComponents={this.deleteFromSonComponents}
          />
        );
      } else {
        newQuestion = <div>Unrecogined component in setSonComponents()</div>;
      }

      sonComponents.push(newQuestion);
    });

    this.setState({ sonComponents: sonComponents });
  };

  editAllQuestions = (e) => {
    e.stopPropagation();
    this.SetSonComponents("EDIT_QUESTION");
    this.setState({ edit: true });
  };

  cancelEditAllQuestions = (e) => {
    e.stopPropagation();
    this.SetSonComponents("QUESTION");
    this.setState({ edit: false });
  };

  saveAllQuestions = (e) => {};

  render() {
    let res =
      this.state.questions.length !== 0 ? (
        <React.Fragment>
          <div className="page_title"> Questions </div>
          {this.state.activeExamsID !== "" && (
            <React.Fragment>
              <div className="active_model_title">
                <span style={{ fontStyle: "italic", fontSize: "x-large" }}>
                  Course:
                </span>
                <span className="active_model"> {this.state.activeCourse}</span>
              </div>
              <div className="active_model_title">
                <span style={{ fontStyle: "italic", fontSize: "x-large" }}>
                  Exam:
                </span>
                <span className="active_model">
                  {" " + this.state.examName + " " + this.state.examDate}
                </span>
              </div>
            </React.Fragment>
          )}
          <Container fluid>
            {this.state.questions.length > 0 && (
              <React.Fragment>
                <Row className="narrow_row">
                  <Col md={{ span: 6, offset: 3 }} sm={{ span: 8, offset: 2 }}>
                    <div className="btn_center_wrapper">
                      <button
                        className="btn btn-dark questions_settings_icon"
                        onClick={(e) => this.editAllQuestions(e)}
                        hidden={this.state.edit}
                      >
                        Edit All
                      </button>
                      <button
                        className="btn btn-dark questions_settings_icon"
                        onClick={(e) => this.saveAllQuestions(e)}
                        hidden={!this.state.edit}
                      >
                        Save All
                      </button>
                      <button
                        className="btn btn-dark questions_settings_icon"
                        onClick={(e) => this.cancelEditAllQuestions(e)}
                        hidden={!this.state.edit}
                        style={{ marginLeft: "5px" }}
                      >
                        Cancel Edit
                      </button>
                    </div>
                  </Col>
                </Row>
                <Row className="row_top_margin_narrow">
                  <Col md={{ span: 6, offset: 3 }} sm={{ span: 8, offset: 2 }}>
                    <div className="questions_form">
                      {this.state.sonComponents}
                    </div>
                  </Col>
                </Row>
              </React.Fragment>
            )}
          </Container>
        </React.Fragment>
      ) : this.state.activeExamsID !== undefined ? (
        <div className="col-centered models_loading">
          <div className="loading_title"> Loading Questions... </div>
          <RotateLoader css={override} size={50} />
        </div>
      ) : (
        <React.Fragment>
          <div className="page_title"> Questions </div>
          <div className="active_model_title">
            <span
              style={{ fontStyle: "italic", fontSize: "x-large", color: "red" }}
            >
              Error Loading Exam: No Exam Chosen
            </span>
          </div>
        </React.Fragment>
      );

    return res;
  }
}

export default Questions;
