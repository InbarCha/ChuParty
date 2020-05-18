import React, { Component } from "react";
import { Col } from "react-bootstrap";
import { bounce } from "react-animations";
import styled, { keyframes } from "styled-components";

const Bounce = styled.div`
  animation: 2s ${keyframes`${bounce}`};
`;

export class Exam extends Component {
  chooseExam = () => {
    localStorage["activeExamID"] = Object.keys(this.props.exam)[0];
    this.props.parentClickHandler("QUESTIONS");
  };

  editExam = (e) => {
    e.stopPropagation();
    this.props.changeExamComponent(this.props.index, "EDIT");
  };

  render() {
    let examID = Object.keys(this.props.exam)[0];
    let examName = this.props.exam[examID]["name"];
    let examDate = this.props.exam[examID]["date"];
    let writers = this.props.exam[examID]["writers"];
    let questions = this.props.exam[examID]["questions"];
    let subjects = this.props.exam[examID]["subjects"];

    let newExam = (
      <div className={"model col-centered"} onClick={this.chooseExam} dir="RTL">
        <div className="model_container">
          <div className="model_name">
            <span
              className="material-icons settings_icon"
              onClick={(e) => this.editExam(e)}
            >
              settings
            </span>
            <img className="exam_img" alt="" />
            <div className="model_name_text">
              {examName} <br /> {examDate}
            </div>
          </div>
          <div className="details_container">
            <div className="detail_container">
              <div className="exam_detail">כותבי המבחן:</div>
              {writers.map((writer, index) => {
                return <div key={index}>{writer}</div>;
              })}
            </div>
            <div className="detail_container">
              {subjects.length > 0 && (
                <React.Fragment>
                  <div className="exam_detail">נושאי המבחן:</div>
                  {subjects.map((subject, index) => {
                    return <div key={index}>{subject}</div>;
                  })}
                </React.Fragment>
              )}
            </div>
            <div className="detail_container">
              <span className="exam_detail">מספר השאלות במבחן:</span>
              {" " + questions.length}
            </div>
          </div>
        </div>
      </div>
    );

    return (
      <React.Fragment>
        {this.props.bounce && (
          <Col xs={12} sm={12} md={6} lg={6} xl={4}>
            <Bounce className="bounce_div"> {newExam} </Bounce>
          </Col>
        )}
        {!this.props.bounce && (
          <Col xs={12} sm={12} md={6} lg={6} xl={4}>
            {newExam}
          </Col>
        )}
      </React.Fragment>
    );
  }
}

export default Exam;
