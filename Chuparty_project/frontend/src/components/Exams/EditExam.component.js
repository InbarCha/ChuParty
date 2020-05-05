import React, { Component } from "react";
import { Col } from "react-bootstrap";
import { bounce } from "react-animations";
import styled, { keyframes } from "styled-components";

const Bounce = styled.div`
  animation: 2s ${keyframes`${bounce}`};
`;

if (!process.env.NODE_ENV || process.env.NODE_ENV === "development")
  console.log("DEV enabled");
const EDIT_EXAM_ROUTE =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development"
    ? "http://localhost:8000/api/editExam"
    : "/api/editExam";
const DELETE_EXAM_ROUTE =
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

  deleteExam = (e) => {
    e.stopPropagation();

    //TODO: change to message-box
    if (window.confirm("Are you sure you want to delete this exam?")) {
      let exam = this.props.exam_orig;
      let examID = Object.keys(exam)[0];

      fetch(DELETE_EXAM_ROUTE + examID)
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          this.props.deleteFromSonComponents(this.props.index);
        })
        .catch((err) => console.error("error while fetching courses:", err));
    }
  };

  examNameChanged = (e) => {
    let newVal = e.target.value;

    let exam = this.state.exam;
    let examID = Object.keys(exam)[0];
    exam[examID]["name"] = newVal;

    this.setState({ exam: exam });
  };

  examDateChanged = (e) => {
    e.stopPropagation();
    let newVal = e.target.value;

    let exam = this.state.exam;
    let examID = Object.keys(exam)[0];
    exam[examID]["date"] = newVal;

    this.setState({ exam: exam });
  };

  writersChanged = (e, index) => {
    e.stopPropagation();
    let newVal = e.target.value;

    let exam = this.state.exam;
    let examID = Object.keys(exam)[0];

    exam[examID]["writers"][index] = newVal;
    this.setState({ exam: exam });
  };

  addWriter = (e) => {
    e.stopPropagation();

    let exam = this.state.exam;
    let examID = Object.keys(exam)[0];
    let writers = exam[examID]["writers"];

    exam[examID]["writers"] = [...writers, ""];
    this.setState({ exam: exam });
  };

  // {
  //   "examID":"Computer Networks Exam_2019-07-15",
  //   "ChangeWriters":[
  //     "Eliav Menache"
  //     ],
  //   "ChangeCourse":
  //     {
  //       "name":"Computer Networks"
  //     },
  //   "AddQuestions":[
  //       {
  //         "body":"What is HTTP?"
  //       },
  //       {
  //         "body":"What is UDP?"
  //       }
  //     ],
  //   "DeleteQuestions":[
  //       {
  //         "body":"What is DNS?"
  //       }
  //     ],
  //   "ChangeName": "Computer Networks Exam",
  //   "ChangeDate": "2019-07-17"
  // }
  saveChangesToDb = () => {
    let exam = this.state.exam;
    let examID = Object.keys(exam)[0];

    let request_body = {};
    request_body["examID"] = examID;

    request_body["ChangeName"] = exam[examID]["name"];
    request_body["ChangeDate"] = exam[examID]["date"];
    request_body["ChangeWriters"] = exam[examID]["writers"];

    fetch(EDIT_EXAM_ROUTE, {
      method: "post",
      body: JSON.stringify(request_body),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        this.props.changedExam(data["Edited Exam"], this.props.index);
        this.props.changeExamComponent(this.props.index, "EXAM");
      })
      .catch((err) => console.error("error while editing exam:", err));
  };

  saveExam = (e) => {
    e.stopPropagation();

    let exam = this.state.exam;
    let examID = Object.keys(exam)[0];
    let writers = exam[examID]["writers"];

    //filter out empty strings in writers array
    exam[examID]["writers"] = [...writers.filter((writer) => writer !== "")];

    //save changes to db and propagate changes to exams component
    this.saveChangesToDb();
  };

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
                  style={{ fontSize: "medium" }}
                  onChange={(e) => this.examNameChanged(e)}
                />
                <input
                  type="date"
                  defaultValue={examDate}
                  name={examDate + "_edit"}
                  className="modelTitle_edit_input"
                  style={{ fontSize: "medium" }}
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
                  {" " + subjects.join(", ")}
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
