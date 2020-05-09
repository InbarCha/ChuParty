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
const EDIT_MULTIPLE_QUESTIONS_ROUTE =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development"
    ? "http://localhost:8000/api/editMultipleQuestions"
    : "/api/editMultipleQuestions";

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
      questions_copy: [],
      activeExamsID: localStorage["activeExamID"],
      activeCourse: localStorage["activeCourse"],
      sonComponents: [],
      edit: this.props.edit,
      loading: false,
    };
  }

  componentDidMount() {
    if (this.state.activeExamsID !== undefined) {
      fetch(EXAM_BY_ID_ROUTE + this.state.activeExamsID)
        .then((res) => res.json())
        .then((data) => {
          this.setState({ exam: data, loading: false });
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

  createDeepCopyQuestions = (questions) => {
    let questions_copy = [];

    questions.forEach((question, index) => {
      let question_copy = this.createDeepCopyQuestion(question);
      questions_copy = [...questions_copy, question_copy];
    });

    this.setState({ questions_copy: questions_copy });
  };

  refreshDeepCopyQuestionByIndex = (index) => {
    let questions_copy = this.state.questions_copy;

    let question_orig = this.state.questions[index];
    let question_copy = this.createDeepCopyQuestion(question_orig);
    questions_copy[index] = question_copy;

    this.setState({ questions_copy: questions_copy });
  };

  refreshDeepCopyQuestions = () => {
    let questions = this.state.questions;
    this.createDeepCopyQuestions(questions);
  };

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

      this.createDeepCopyQuestions(questions);
    }
  };

  deleteFromSonComponents = (index) => {
    let questions = this.state.questions;
    let sonComponents = this.state.sonComponents;

    console.log(sonComponents.length - 1);
    console.log(index);

    if (index < sonComponents.length - 1) {
      questions[index] = "";
      sonComponents[index] = "";
    } else if (index === sonComponents.length - 1) {
      sonComponents.pop();
      questions.pop();
    }

    this.setState({ questions: questions, sonComponents: sonComponents });
  };

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

  changedQuestion = (question, index) => {
    let questions = this.state.questions;
    questions[index] = question;
    this.setState({ questions: questions });
  };

  questionCopyChanged = (question_copy_index, question) => {
    let questions_copy = this.state.questions_copy;
    questions_copy[question_copy_index] = question;
    this.setState({ questions_copy: questions_copy });
  };

  changeQuestionComponent = (index, component) => {
    console.log("changeQuestionComponent");
    console.log(component);
    let sonComponents = this.state.sonComponents;
    let question_orig = "";
    if (index !== -1) {
      question_orig = this.state.questions[index];
    }

    switch (component) {
      case "EDIT":
        this.refreshDeepCopyQuestionByIndex(index);
        sonComponents[index] = (
          <EditQuestion
            question={this.state.questions_copy[index]}
            question_orig={question_orig}
            key={index}
            index={index}
            changeQuestionComponent={this.changeQuestionComponent}
            changedQuestion={this.changedQuestion}
            deleteFromSonComponents={this.deleteFromSonComponents}
            questionCopyChanged={this.questionCopyChanged}
            setEdit={this.setEdit}
            loading={this.state.loading}
          />
        );
        break;
      case "QUESTION":
        this.refreshDeepCopyQuestionByIndex(index);
        sonComponents[index] = (
          <Question
            question={this.state.questions[index]}
            key={index}
            index={index}
            changeQuestionComponent={this.changeQuestionComponent}
            setEdit={this.setEdit}
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
            setEdit={this.setEdit}
          />
        );
      } else if (component === "EDIT_QUESTION") {
        //this.refreshDeepCopyQuestions();
        let question_orig = this.state.questions[index];

        newQuestion = (
          <EditQuestion
            question={this.state.questions_copy[index]}
            question_orig={question_orig}
            key={index}
            index={index}
            changeQuestionComponent={this.changeQuestionComponent}
            changedQuestion={this.changedQuestion}
            deleteFromSonComponents={this.deleteFromSonComponents}
            questionCopyChanged={this.questionCopyChanged}
            setEdit={this.setEdit}
            loading={this.state.loading}
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

  setEdit = (flag) => {
    this.setState({ edit: flag });
  };

  cancelEditAllQuestions = (e) => {
    e.stopPropagation();
    this.SetSonComponents("QUESTION");
    this.setState({ edit: false });
  };

  saveAllQuestions = (e) => {
    e.stopPropagation();

    this.setState({ loading: true });
    let request_body_all = [];

    this.state.questions_copy.forEach((question, index) => {
      let question_orig = this.state.questions[index];
      let oldBody = Object.keys(question_orig)[0];
      let newBody = Object.keys(question)[0];

      let request_body = {};
      request_body["body"] = oldBody;
      request_body["ChangeSubject"] = { name: question[newBody]["subject"] };
      request_body["ChangeBody"] = newBody;
      request_body["ChangeAnswers"] = question[newBody]["answers"];
      request_body["ChangeCorrectAnswer"] = question[newBody]["correctAnswer"];
      request_body["ChangeDifficulty"] = question[newBody]["difficulty"];

      request_body_all = [...request_body_all, request_body];
    });

    console.log(request_body_all);
    fetch(EDIT_MULTIPLE_QUESTIONS_ROUTE, {
      method: "post",
      body: JSON.stringify(request_body_all),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        data.forEach((elm, index) => {
          this.changedQuestion(elm["Edited Question"], index);
          this.changeQuestionComponent(index, "QUESTION");
        });
        this.setState({ loading: false });
        this.setEdit(false);
      })
      .catch((err) => {
        console.error("error while editing question:", err);
        this.setState({ loading: false });
        this.setEdit(false);
      });
  };

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
                      <div className="col-centered model_loading">
                        <RotateLoader
                          css={override}
                          loading={this.state.loading}
                        />
                      </div>
                      <div>{this.state.sonComponents}</div>
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
