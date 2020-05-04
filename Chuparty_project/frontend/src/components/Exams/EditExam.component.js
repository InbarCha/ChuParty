import React, { Component } from "react";
import { Col } from "react-bootstrap";
import { bounce } from "react-animations";
import styled, { keyframes } from "styled-components";

const Bounce = styled.div`
  animation: 2s ${keyframes`${bounce}`};
`;

if (!process.env.NODE_ENV || process.env.NODE_ENV === "development")
  console.log("DEV enabled");
const EDIT_COURSE_ROUTE =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development"
    ? "http://localhost:8000/api/editExam"
    : "/api/editExam";
const DELETE_COURSE_ROUTE =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development"
    ? "http://localhost:8000/api/deleteExam?examID="
    : "/api/deleteExam?examID=";

export class EditExam extends Component {
  constructor(props) {
    super(props);
    this.state = {
      exam: this.props.exam,
      addedQuestions: [],
      deletedQuestions: [],
    };
  }

  cancelEdit = (e) => {
    e.stopPropagation();
    this.props.changeExamComponent(this.props.index, "EXAM");
  };

  deleteExam = (e) => {};

  examNameChanged = (e) => {};

  examDateChanged = (e) => {};

  writersChanged = (e, index) => {};

  addWriter = (e) => {
    e.stopPropagation();
    let exam = this.state.exam;
    let examID = Object.keys(exam)[0];
    let writers = exam[examID]["writers"];

    exam[examID]["writers"] = [...writers, ""];
    this.setState({ exam: exam });
  };

  saveExam = (e) => {};

  removeWriter = (e, index) => {
    console.log(index);
    e.stopPropagation();
    let exam = this.state.exam;
    let examID = Object.keys(exam)[0];
    let writers = exam[examID]["writers"];

    writers.splice(index, 1);
    exam[examID]["writers"] = writers;
    this.setState({ exam: exam });
  };

  render() {
    let examID = Object.keys(this.state.exam)[0];
    let examName = this.state.exam[examID]["name"];
    let examDate = this.state.exam[examID]["date"];
    let writers = this.state.exam[examID]["writers"];
    let questions = this.state.exam[examID]["questions"];
    let subjects = this.state.exam[examID]["subjects"];
    return (
      <Col xs={12} sm={12} md={6} lg={6} xl={4}>
        <Bounce className="bounce_div">
          <div className={"model col-centered"} onClick={this.chooseExam}>
            <div className="model_container">
              <div className="model_name">
                <span
                  className="material-icons cancel_edit_course"
                  onClick={(e) => this.cancelEdit(e)}
                >
                  cancel
                </span>
                <span
                  className="material-icons delete_icon"
                  onClick={(e) => this.deleteExam(e)}
                >
                  delete
                </span>
                <img className="edit_img" alt="" />
                <input
                  type="text"
                  defaultValue={examName}
                  name={examName + "_edit"}
                  className="modelTitle_edit_input"
                  onChange={(e) => this.examNameChanged(e)}
                />
                <input
                  type="date"
                  defaultValue={examDate}
                  name={examDate + "_edit"}
                  className="modelTitle_edit_input"
                  onChange={(e) => this.examDateChanged(e)}
                />
              </div>
              <div className="details_container">
                <span
                  className="material-icons plus_subjec_icon"
                  onClick={(e) => this.addWriter(e)}
                >
                  add
                </span>
                <span
                  className="material-icons save_icon"
                  onClick={(e) => this.saveExam(e)}
                >
                  save
                </span>
                <div className="detail_container">
                  <div style={{ fontStyle: "italic" }}>Exam Writers:</div>
                  {writers.map((writer, index) => {
                    return (
                      <div key={index}>
                        <input
                          type="text"
                          defaultValue={writer}
                          name={writer + "_edit"}
                          className="modelTitle_edit_input"
                          style={{ width: "70%" }}
                          onChange={(e) => this.writersChanged(e, index)}
                        />
                        <span
                          className="material-icons remove_icon"
                          onClick={(e) => this.removeWriter(e, index)}
                        >
                          remove_circle_outline
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="detail_container">
                  <span style={{ fontStyle: "italic" }}>Subjects:</span>
                  {" " + subjects}
                </div>
                <div className="detail_container">
                  <span style={{ fontStyle: "italic" }}>
                    Number of Questions:
                  </span>
                  {" " + questions.length}
                </div>
                <div className="btn btn-primary edit_questions_btn">
                  Edit Questions
                </div>
              </div>
            </div>
          </div>
        </Bounce>
      </Col>
    );
  }
}

export default EditExam;
