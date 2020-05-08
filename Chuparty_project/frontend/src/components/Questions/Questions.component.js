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
  constructor() {
    super();
    this.state = {
      exam: "",
      examName: "",
      examDate: "",
      questions: null,
      activeExamsID: localStorage["activeExamID"],
      activeCourse: localStorage["activeCourse"],
      sonComponents: [],
    };
  }

  componentDidMount() {
    if (this.state.activeExamsID !== undefined) {
      fetch(EXAM_BY_ID_ROUTE + this.state.activeExamsID)
        .then((res) => res.json())
        .then((data) => {
          this.setState({ exam: data });
          this.setOtherStateVars();
          this.SetSonComponents();
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

  createDeepCopyQuestion = (question_orig) => {};

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

  SetSonComponents = () => {
    let sonComponents = [];

    this.state.questions.forEach((elm, index) => {
      let newQuestion = (
        <Question
          question={elm}
          key={index}
          index={index}
          changeQuestionComponent={this.changeQuestionComponent}
        />
      );

      sonComponents.push(newQuestion);
    });

    this.setState({ sonComponents: sonComponents });
  };

  render() {
    let res =
      this.state.questions !== null ? (
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
              <Row>
                <Col md={{ span: 6, offset: 3 }} sm={{ span: 8, offset: 2 }}>
                  <div className="questions_form">
                    {this.state.sonComponents}
                  </div>
                </Col>
              </Row>
            )}
          </Container>
        </React.Fragment>
      ) : this.state.activeExamsID !== undefined ? (
        <div className="col-centered models_loading">
          <RotateLoader css={override} size={80} />
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
