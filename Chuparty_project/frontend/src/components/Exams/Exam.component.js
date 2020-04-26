import React, { Component } from "react";
import { Col } from "react-bootstrap";

export class Exams extends Component {
  chooseExam = () => {
    localStorage["activeExamID"] = Object.keys(this.props.exam)[0];
    this.props.parentClickHandler("QUESTIONS");
  };

  render() {
    let examID = Object.keys(this.props.exam)[0];
    let examName = this.props.exam[examID]["name"];
    let examDate = this.props.exam[examID]["date"];
    let writers = this.props.exam[examID]["writers"];
    let questions = this.props.exam[examID]["questions"];
    let subjects = this.props.exam[examID]["subjects"];

    return (
      <Col xs={12} sm={12} md={6} lg={4} xl={3}>
        <div className={"model col-centered"} onClick={this.chooseExam}>
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
  }
}

export default Exams;
