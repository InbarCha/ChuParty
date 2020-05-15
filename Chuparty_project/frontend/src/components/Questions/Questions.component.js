import React, { Component } from "react";
import { Container, Row, Col } from "react-bootstrap";
import Question from "./Question.component";
import EditQuestion from "./EditQuestion.component";
import { css } from "@emotion/core";
import RotateLoader from "react-spinners/ClipLoader";
import AddQuestion from "./AddQuestion.component";

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
const SET_MULTIPLE_QUESTIONS_ROUTE =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development"
    ? "http://localhost:8000/api/setMultipleQuestions"
    : "/api/setMultipleQuestions";
const EDIT_EXAM_ROUTE =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development"
    ? "http://localhost:8000/api/editExam"
    : "/api/editExam";

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
      questions: null,
      questions_copy: [],
      questions_added: [],
      activeExamsID: localStorage["activeExamID"],
      activeCourse: localStorage["activeCourse"],
      sonComponents: [],
      edit: this.props.edit,
      loading: false,
    };
  }

  componentDidMount() {
    if (this.state.activeExamsID !== undefined) {
      this.setState({ loading: true });
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
        })
        .catch((err) => console.error("error while fetching exmas:", err));
    }
  }

  createDeepCopyQuestions = (questions) => {
    let questions_copy = [];

    questions.forEach((question, index) => {
      let question_copy = "";
      if (question !== "") {
        question_copy = this.createDeepCopyQuestion(question);
      }
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

  addQuestionToSonComponents = (question) => {
    let sonComponents = this.state.sonComponents;
    sonComponents.pop();

    let questions = this.state.questions;
    questions = [...questions, question];

    let questions_added = this.state.questions_added;
    questions_added = [
      ...questions_added.filter((question_added) => {
        let body = Object.keys(question_added)[0];
        return body !== Object.keys(question)[0];
      }),
    ];

    this.setState({
      questions: questions,
      questions_added: questions_added,
      sonComponents: sonComponents,
    });

    this.refreshDeepCopyQuestions();
    this.SetSonComponents("QUESTION");
  };

  addQuestionToSonComponentWithoutCopy = (question) => {
    let sonComponents = this.state.sonComponents;
    sonComponents.pop();

    let questions = this.state.questions;
    questions = [...questions, question];
    this.setState({
      questions: questions,
      sonComponents: sonComponents,
    });

    this.SetSonComponents("QUESTION");
    this.refreshDeepCopyQuestions();
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

  deleteFromSonComponents = (
    index,
    deleteFromAddedQuestions,
    deleteFromQuestions
  ) => {
    let sonComponents = this.state.sonComponents;
    let questions_added = this.state.questions_added;
    let questions = this.state.questions;
    let questions_copy = this.state.questions_copy;

    console.log(sonComponents.length - 1);
    console.log(index);

    if (index < sonComponents.length - 1) {
      sonComponents[index] = "";
      if (deleteFromQuestions) {
        questions[index] = "";
        questions_copy[index] = "";
      }
      if (deleteFromAddedQuestions) {
        questions_added[index] = "";
      }
    } else if (index === sonComponents.length - 1) {
      sonComponents.pop();
      if (deleteFromQuestions) {
        questions.pop();
        questions_copy.pop();
      }
      if (deleteFromAddedQuestions) {
        questions_added.pop();
      }
    }

    let questions_filtered = questions.filter((question) => question !== "");
    let questions_copy_filtered = questions_copy.filter(
      (question) => question !== ""
    );
    let questions_added_filtered = questions_added.filter(
      (question) => question !== ""
    );
    if (questions_filtered.length === 0) {
      questions = questions_filtered;
    }
    if (questions_copy_filtered.length === 0) {
      questions_copy = questions_copy_filtered;
    }
    if (questions_added_filtered.length === 0) {
      questions_added = questions_added_filtered;
    }

    this.setState({
      sonComponents: sonComponents,
      questions_added: questions_added,
      questions_copy: questions_copy,
    });
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

  questionAddedChanged = (question_added_index, question) => {
    let questions_added = this.state.questions_added;
    questions_added[question_added_index] = question;
    this.setState({ question_added_index: question_added_index });
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
        let question = {};
        question["Question Body"] = {};
        question["Question Body"]["subject"] = "";
        question["Question Body"]["answers"] = [];
        question["Question Body"]["correctAnswer"] = 1;
        question["Question Body"]["difficulty"] = 1;
        question["Question Body"]["course"] = this.state.exam[
          this.state.activeExamsID
        ]["course"];

        this.setState({
          questions_added: [...this.state.questions_added, question],
        });

        sonComponents = [
          ...sonComponents,
          <AddQuestion
            key={sonComponents.length}
            index={this.state.questions_added.length}
            index_questions={sonComponents.length}
            deleteFromSonComponents={this.deleteFromSonComponents}
            addQuestionToSonComponents={this.addQuestionToSonComponents}
            changeQuestionComponent={this.changeQuestionComponent}
            questionAddedChanged={this.questionAddedChanged}
            question={question}
          />,
        ];
        break;
      default:
        console.log("no handler for:", component);
    }

    this.setState({ sonComponents: sonComponents });
  };

  SetSonComponents = (component) => {
    if (this.state.questions !== null) {
      let sonComponents = [];

      this.state.questions.forEach((elm, index) => {
        if (elm !== "" && elm !== null && elm !== undefined) {
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
            newQuestion = (
              <div>Unrecogined component in setSonComponents()</div>
            );
          }

          sonComponents.push(newQuestion);
        }
      });

      let addedQuestionsComponents = this.state.sonComponents
        .filter((elm, index) => elm !== "")
        .filter((elm, index) => index >= sonComponents.length);
      if (addedQuestionsComponents.length > 0) {
        sonComponents = [...sonComponents, ...addedQuestionsComponents];
      }

      this.setState({ sonComponents: sonComponents });
    }
  };

  addQuestion = () => {
    this.changeQuestionComponent(-1, "ADD_QUESTION");
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

  saveAllEditedQuestionsToDb = (thenSavEAllAddedQuestionsFlag) => {
    let request_body_all = [];

    this.state.questions_copy.forEach((question, index) => {
      if (question !== "") {
        let question_orig = this.state.questions[index];
        if (question_orig === undefined) {
          question_orig = this.state.questions_copy[index];
        }
        let oldBody = Object.keys(question_orig)[0];
        let newBody = Object.keys(question)[0];

        let request_body = {};
        request_body["body"] = oldBody;
        request_body["ChangeSubject"] = { name: question[newBody]["subject"] };
        request_body["ChangeBody"] = newBody;
        request_body["ChangeAnswers"] = question[newBody]["answers"];
        request_body["ChangeCorrectAnswer"] =
          question[newBody]["correctAnswer"];
        request_body["ChangeDifficulty"] = question[newBody]["difficulty"];

        request_body_all = [...request_body_all, request_body];
      }
    });

    if (request_body_all.length !== 0) {
      console.log(request_body_all);
      this.setState({ loading: true });

      fetch(EDIT_MULTIPLE_QUESTIONS_ROUTE, {
        method: "post",
        body: JSON.stringify(request_body_all),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          this.filterEmptyQuestions();
          data.forEach((elm, index) => {
            this.changedQuestion(elm["Edited Question"], index);
            this.changeQuestionComponent(index, "QUESTION");
          });
          if (
            thenSavEAllAddedQuestionsFlag &&
            this.state.questions_added.length > 0
          ) {
            this.saveAllAddedQuestionsToDb();
          } else {
            this.setState({ loading: false });
            this.setEdit(false);
          }
        })
        .catch((err) => {
          console.error("error while editing question:", err);
          this.setState({ loading: false });
          this.setEdit(false);
        });
    }
  };

  filterEmptyQuestions = () => {
    let questions = this.state.questions;
    let questions_copy = this.state.questions_copy;

    questions = [...questions.filter((question) => question !== "")];
    questions_copy = [...questions_copy.filter((question) => question !== "")];

    this.setState({ questions: questions, questions_copy: questions_copy });
  };

  saveAllAddedQuestionsToDb = () => {
    let request_body_all = [];
    let save_flag = true;

    this.state.questions_added.forEach((question, index) => {
      let body = Object.keys(question)[0];
      let answers = question[body]["answers"];

      //filter out empty strings in answers array
      answers = [...answers.filter((answer) => answer !== "")];
      question[body]["answers"] = answers;

      if (question[body]["subject"] !== "" && body !== "Question Body") {
        let request_body = {};
        request_body["body"] = body;
        request_body["subject"] = { name: question[body]["subject"] };
        request_body["course"] = {
          name: Object.keys(question[body]["course"])[0],
        };
        request_body["answers"] = question[body]["answers"];
        request_body["correctAnswer"] = parseInt(
          question[body]["correctAnswer"]
        );
        request_body["difficulty"] = parseInt(question[body]["difficulty"]);

        request_body_all = [...request_body_all, request_body];
      } else {
        save_flag = false;
      }
    });

    if (request_body_all.length !== 0 && save_flag) {
      console.log(request_body_all);
      this.setState({ loading: true });

      fetch(SET_MULTIPLE_QUESTIONS_ROUTE, {
        method: "post",
        body: JSON.stringify(request_body_all),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          this.filterEmptyQuestions();
          data.forEach((elm, index) => {
            this.addQuestionToSonComponentWithoutCopy(elm["Returned Question"]);
          });
          this.setState({ loading: false });
          this.setEdit(false);
        })
        .then(() => {
          this.editExamWithNewQuestions();
          this.emptyAddedQuestionsArr();
        })
        .catch((err) => {
          console.error("error while saving multiple question:", err);
          this.setState({ loading: false });
          this.setEdit(false);
          this.emptyAddedQuestionsArr();
        });
    } else if (!save_flag) {
      window.alert(
        "Not saving added questions: one of them are missing 'subject' or 'body' fields"
      );
    }
  };

  emptyAddedQuestionsArr = () => {
    this.setState({ questions_added: [] });
  };

  editExamWithNewQuestions = () => {
    let request_body = {};
    request_body["examID"] = localStorage["activeExamID"];
    request_body["AddQuestions"] = this.state.questions_added.map(
      (question, index) => {
        return { body: Object.keys(question)[0] };
      }
    );
    console.log(request_body);

    fetch(EDIT_EXAM_ROUTE, {
      method: "post",
      body: JSON.stringify(request_body),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        this.setState({ loading: false });
      })
      .catch((err) => {
        console.error("error while editing exam:", err);
        this.setState({ loading: false });
      });
  };

  saveAllQuestions = (e) => {
    e.stopPropagation();
    if (!this.state.loading) {
      this.saveAllEditedQuestionsToDb(true);
    }
  };

  render() {
    let res =
      this.state.questions !== null && this.state.questions !== undefined ? (
        <React.Fragment>
          <div className="page_title" dir="RTL">
            {" "}
            שאלות{" "}
          </div>
          {this.state.activeExamsID !== "" && (
            <React.Fragment>
              <div className="active_model_title">
                <span style={{ fontStyle: "italic", fontSize: "x-large" }}>
                  קורס:
                </span>
                <span className="active_model"> {this.state.activeCourse}</span>
              </div>
              <div className="active_model_title">
                <span style={{ fontStyle: "italic", fontSize: "x-large" }}>
                  מבחן:
                </span>
                <span className="active_model">
                  {" " + this.state.examName + " " + this.state.examDate}
                </span>
              </div>
            </React.Fragment>
          )}
          <Container fluid>
            <div
              className="material-icons add_question_icon"
              onClick={this.addQuestion}
            >
              add
            </div>
            <br />
            {(this.state.questions.length > 0 ||
              this.state.questions_added.length > 0) && (
              <React.Fragment>
                <Row className="narrow_row">
                  <Col md={{ span: 6, offset: 3 }} sm={{ span: 8, offset: 2 }}>
                    <div className="btn_center_wrapper">
                      <button
                        className="btn btn-dark questions_settings_icon"
                        onClick={(e) => this.editAllQuestions(e)}
                        hidden={
                          this.state.sonComponents.filter(
                            (sonComponent) =>
                              sonComponent.type === EditQuestion ||
                              sonComponent.type === AddQuestion
                          ).length === this.state.sonComponents.length
                        }
                      >
                        ערוך הכל
                      </button>
                      <button
                        className="btn btn-dark questions_settings_icon"
                        onClick={(e) => this.saveAllQuestions(e)}
                        hidden={
                          !(
                            this.state.sonComponents.filter(
                              (sonComponent) =>
                                sonComponent.type === EditQuestion ||
                                sonComponent.type === AddQuestion
                            ).length === this.state.sonComponents.length
                          )
                        }
                      >
                        שמור הכל
                      </button>
                      <button
                        className="btn btn-dark questions_settings_icon"
                        onClick={(e) => this.cancelEditAllQuestions(e)}
                        hidden={
                          !(
                            this.state.sonComponents.filter(
                              (sonComponent) =>
                                sonComponent.type === EditQuestion ||
                                sonComponent.type === AddQuestion
                            ).length === this.state.sonComponents.length
                          )
                        }
                        style={{ marginLeft: "5px" }}
                      >
                        בטל עריכה
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
        <div className="col-centered models_loading" dir="RTL">
          <div className="loading_title"> טוען שאלות... </div>
          <RotateLoader css={override} size={50} loading={this.state.loading} />
        </div>
      ) : (
        <React.Fragment dir="RTL">
          <div className="page_title"> שאלות </div>
          <div className="active_model_title">
            <span
              style={{ fontStyle: "italic", fontSize: "x-large", color: "red" }}
            >
              בעיה בטעינת שאלות: לא נבחר אף מבחן
            </span>
          </div>
        </React.Fragment>
      );
    return res;
  }
}

export default Questions;
