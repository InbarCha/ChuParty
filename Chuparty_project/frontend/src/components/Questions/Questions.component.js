import React, { Component } from "react";
import { Container, Row, Col } from "react-bootstrap";
import Question from "./Question.component";
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
    };
  }

  componentDidMount() {
    if (this.state.activeExamsID !== "") {
      fetch(EXAM_BY_ID_ROUTE + this.state.activeExamsID)
        .then((res) => res.json())
        .then((data) => {
          this.setState({ exam: data });
          this.setOtherStateVars();
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

  getQuestions = () => {
    let content = [];

    this.state.questions.forEach((elm, index) => {
      let body = Object.keys(elm)[0];
      let answers = elm[body]["answers"];
      let subject = elm[body]["subject"];
      let correctAnswer = elm[body]["correctAnswer"];
      let newQuestion = (
        <Question
          question={elm}
          body={body}
          answers={answers}
          subject={subject}
          correctAnswer={correctAnswer}
          key={index}
          index={index}
        />
      );

      content.push(newQuestion);
    });

    return content;
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
                  <div className="questions_form">{this.getQuestions()}</div>
                </Col>
              </Row>
            )}
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

export default Questions;
