import React, { Component } from "react";
import { Container, Row } from "react-bootstrap";

if (!process.env.NODE_ENV || process.env.NODE_ENV === "development")
  console.log("DEV enabled");
const EXAM_BY_ID_ROUTE =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development"
    ? "http://localhost:8000/api/getExamByID?examID="
    : "/api/getExamByID?examID=";

export class Questions extends Component {
  constructor() {
    super();
    this.state = {
      exam: "",
      examName: "",
      examDate: "",
      questions: [],
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

  render() {
    return (
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
        <Container fluid></Container>
      </React.Fragment>
    );
  }
}

export default Questions;
