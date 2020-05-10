import React, { Component } from "react";
import { css } from "@emotion/core";
import { Col } from "react-bootstrap";
import RotateLoader from "react-spinners/ClipLoader";
import { bounce } from "react-animations";
import styled, { keyframes } from "styled-components";
import scrollToComponent from "react-scroll-to-component";

const SET_EXAM_ROUTE =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development"
    ? "http://localhost:8000/api/setExam"
    : "/api/setExam";

const Bounce = styled.div`
  animation: 2s ${keyframes`${bounce}`};
`;

const override = css`
  display: block;
  margin: 0 auto;
`;

export class AddExam extends Component {
  constructor(props) {
    super(props);
    this.state = {
      exam: this.props.exam,
      activeCourse: localStorage["activeCourse"],
      loading: false,
    };
  }

  componentDidMount() {
    //scroll down to new component
    scrollToComponent(this, {
      offset: 0,
      align: "middle",
      duration: 500,
      ease: "inCirc",
    });
  }

  cancelEdit = (e) => {
    e.stopPropagation();
    if (!this.state.loading) {
      this.props.deleteFromSonComponents(this.props.index);
    }
  };

  examNameChanged = (e) => {
    if (!this.state.loading) {
      let newVal = e.target.value;

      let exam = this.state.exam;
      let examID = Object.keys(exam)[0];
      exam[examID]["name"] = newVal;

      this.setState({ exam: exam });
    }
  };

  examDateChanged = (e) => {
    e.stopPropagation();

    if (!this.state.loading) {
      let newVal = e.target.value;

      let exam = this.state.exam;
      let examID = Object.keys(exam)[0];
      exam[examID]["date"] = newVal;

      this.setState({ exam: exam });
    }
  };

  addWriter = (e) => {
    e.stopPropagation();

    if (!this.state.loading) {
      let exam = this.state.exam;
      let examID = Object.keys(exam)[0];
      let writers = exam[examID]["writers"];

      exam[examID]["writers"] = [...writers, ""];
      this.setState({ exam: exam });
    }
  };

  writersChanged = (e, index) => {
    e.stopPropagation();

    if (!this.state.loading) {
      let newVal = e.target.value;

      let exam = this.state.exam;
      let examID = Object.keys(exam)[0];

      exam[examID]["writers"][index] = newVal;
      this.setState({ exam: exam });
    }
  };

  removeWriter = (e, index) => {
    e.stopPropagation();

    if (!this.state.loading) {
      let exam = this.state.exam;
      let examID = Object.keys(exam)[0];
      let writers = exam[examID]["writers"];

      writers.splice(index, 1);
      exam[examID]["writers"] = writers;
      this.setState({ exam: exam });
    }
  };

  saveExam = (e, changeToEditQuestions) => {
    e.stopPropagation();

    if (!this.state.loading) {
      let exam = this.state.exam;
      let examID = Object.keys(exam)[0];
      let writers = exam[examID]["writers"];

      if (exam[examID]["name"] !== "") {
        this.setState({ loading: true });

        //filter out empty strings in writers array
        exam[examID]["writers"] = [
          ...writers.filter((writer) => writer !== ""),
        ];

        //save changes to db and propagate changes to exams component
        this.saveChangesToDb(changeToEditQuestions);
      } else {
        window.alert("Can't save exam: 'name' is empty!");
      }
    }
  };

  //   {
  //     "name": "OOP Exam",
  //     "date": "2019-07-16",
  //     "writers": [
  //     "Eliyahu Khelsatzchi",
  //     "Haim Shafir"
  //     ],
  //     "course":
  //         {
  //         "name" : "OOP"
  //         }
  saveChangesToDb = (changeToEditQuestions) => {
    let exam = this.state.exam;
    let examID = Object.keys(exam)[0];

    let request_body = {};
    request_body["name"] = exam[examID]["name"];
    request_body["date"] = exam[examID]["date"];
    request_body["writers"] = exam[examID]["writers"];
    request_body["course"] = { name: exam[examID]["course"] };

    console.log(request_body);

    fetch(SET_EXAM_ROUTE, {
      method: "post",
      body: JSON.stringify(request_body),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        if (data["Status"] === "Created Exam") {
          this.props.addExamToSonComponents(data["New Exam"]);
        } else if (data["Status"] === "Exam Already Exists") {
          window.alert("Exam Already Exists!");
        }

        this.setState({ loading: false });
      })
      .catch((err) => {
        console.error("error while creating exam:", err);
        this.setState({ loading: false });
      });
  };

  getExams = () => {
    let examID = Object.keys(this.state.exam)[0];
    let examName = this.state.exam[examID]["name"];
    let examDate = this.state.exam[examID]["date"];
    let writers = this.state.exam[examID]["writers"];
    let questions = this.state.exam[examID]["questions"];
    let subjects = this.state.exam[examID]["subjects"];

    return (
      <div className={"model col-centered"} onClick={this.chooseExam}>
        <div className="model_container">
          <div className="model_name">
            <span
              className="material-icons cancel_edit_model"
              onClick={(e) => this.cancelEdit(e)}
            >
              cancel
            </span>
            <span
              className="material-icons save_icon"
              onClick={(e) => this.saveExam(e, false)}
            >
              save
            </span>
            <img className="edit_img" alt="" />
            <input
              type="text"
              defaultValue={examName}
              name={examName + "_edit"}
              className="modelTitle_edit_input"
              style={{ fontSize: "medium" }}
              disabled={this.state.loading}
              onChange={(e) => this.examNameChanged(e)}
            />
            <input
              type="date"
              defaultValue={examDate}
              name={examDate + "_edit"}
              className="modelTitle_edit_input"
              style={{ fontSize: "medium" }}
              disabled={this.state.loading}
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
            <div className="detail_container">
              <div style={{ fontStyle: "italic" }}>Exam Writers:</div>
              {writers.map((writer, index) => {
                return (
                  <div key={index}>
                    <input
                      type="text"
                      value={writer}
                      name={writer + "_edit"}
                      className="modelTitle_edit_input"
                      style={{ width: "70%" }}
                      disabled={this.state.loading}
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
            <div className="col-centered model_loading">
              <RotateLoader css={override} loading={this.state.loading} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  render() {
    return (
      <Col xs={12} sm={12} md={6} lg={6} xl={4}>
        <Bounce className="bounce_div">{this.getExams()}</Bounce>
      </Col>
    );
  }
}

export default AddExam;
