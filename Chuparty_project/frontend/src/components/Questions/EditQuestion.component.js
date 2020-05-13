import React, { Component } from "react";
import { css } from "@emotion/core";
import RotateLoader from "react-spinners/ClipLoader";

if (!process.env.NODE_ENV || process.env.NODE_ENV === "development")
  console.log("DEV enabled");
const EDIT_QUESTION_ROUTE =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development"
    ? "http://localhost:8000/api/editQuestion"
    : "/api/editQuestion";
const EDIT_EXAM_ROUTE =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development"
    ? "http://localhost:8000/api/editExam"
    : "/api/editExam";

const override = css`
  display: block;
  margin: 0 auto;
`;

export class EditQuestion extends Component {
  constructor(props) {
    super(props);
    this.state = {
      question: this.props.question,
      body: null,
      answers: [],
      correctAnswer: null,
      difficulty: null,
      course: null,
      subject: null,
      loading: false,
      loading_parent: this.props.loading,
    };
  }

  componentDidMount() {
    let question = this.state.question;
    let body = Object.keys(question)[0];
    let answers = question[body]["answers"];
    let correctAnswer = question[body]["correctAnswer"];
    let difficulty = question[body]["difficulty"];
    let course = question[body]["course"];
    let subject = question[body]["subject"];

    this.setState({
      body: body,
      answers: answers,
      correctAnswer: correctAnswer,
      difficulty: difficulty,
      course: course,
      subject: subject,
    });

    this.setState({ loading: false });
  }

  answersChanged = (e, index) => {
    e.stopPropagation();
    let newVal = e.target.value;
    if (!this.state.loading) {
      let question = this.state.question;
      let body = this.state.body;
      let answers = this.state.answers;

      answers[index] = newVal;
      question[body]["answers"] = answers;

      this.setState({ answers: answers, question: question });
      this.props.questionCopyChanged(this.props.index, question);
    }
  };

  // {
  //   "body": "What Is Encapsulation?",
  //   "ChangeCourse":
  //       {
  //         "name":"Computer Networks"
  //       },
  //   "ChangeSubject":
  //       {
  //         "name": "DNS"
  //       },
  //   "ChangeBody": "What Is DNS?",
  //   "ChangeAnswers":[
  //       "bundling of data with the methods that operate on that data",
  //       "blah blah",
  //             "bleh beh",
  //             "blu blue"
  //     ],
  //   "ChangeCorrectAnswer": 2,
  //     "ChangeDifficulty: 4
  // }
  saveChangesToDb = () => {
    let question_orig = this.props.question_orig;
    let oldBody = Object.keys(question_orig)[0];

    let request_body = {};
    request_body["body"] = oldBody;
    request_body["ChangeSubject"] = { name: this.state.subject };
    request_body["ChangeBody"] = this.state.body;
    request_body["ChangeAnswers"] = this.state.answers;
    request_body["ChangeCorrectAnswer"] = this.state.correctAnswer;
    request_body["ChangeDifficulty"] = parseInt(this.state.difficulty);

    console.log(request_body);

    fetch(EDIT_QUESTION_ROUTE, {
      method: "post",
      body: JSON.stringify(request_body),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        this.setState({ loading: false });
        this.props.changedQuestion(data["Edited Question"], this.props.index);
        this.props.changeQuestionComponent(this.props.index, "QUESTION");
      })
      .catch((err) => {
        console.error("error while editing question:", err);
        this.setState({ loading: false });
      });
  };

  saveQuestion = (e) => {
    e.stopPropagation();

    if (!this.state.loading) {
      let question = this.state.question;
      let body = this.state.body;
      let answers = this.state.answers;

      //filter out empty strings in answers array
      answers = [...answers.filter((answer) => answer !== "")];
      question[body]["answers"] = answers;

      if (question[body]["subject"] !== "") {
        this.setState({ loading: true });
        this.setState({ question: question, answers: answers });

        //save changes to db and propagate changes to questions component
        this.saveChangesToDb();
      } else {
        window.alert("Can't save changed: 'Subject' is empty!");
      }
    }
  };

  bodyChanged = (e) => {
    if (!this.state.loading) {
      let newVal = e.target.value;

      let newQuestion = {};

      newQuestion[newVal] = {};
      newQuestion[newVal]["subject"] = this.state.subject;
      newQuestion[newVal]["course"] = this.state.course;
      newQuestion[newVal]["answers"] = this.state.answers;
      newQuestion[newVal]["correctAnswer"] = this.state.correctAnswer;
      newQuestion[newVal]["difficulty"] = this.state.difficulty;

      this.setState({ question: newQuestion, body: newVal });
      this.props.questionCopyChanged(this.props.index, newQuestion);
    }
  };

  // "DeleteQuestions":[
  //   {
  //     "body":"What is DNS?"
  //   }
  // ],
  deleteQuestion = (e) => {
    e.stopPropagation();

    if (!this.state.loading) {
      this.setState({ loading: true });

      if (window.confirm("Delete question from this exam?")) {
        let examID = localStorage["activeExamID"];
        let request_body = {};
        request_body["examID"] = examID;
        request_body["DeleteQuestions"] = [{ body: this.state.body }];

        fetch(EDIT_EXAM_ROUTE, {
          method: "post",
          body: JSON.stringify(request_body),
        })
          .then((res) => res.json())
          .then((data) => {
            console.log(data);
            this.setState({ loading: false });
            this.props.deleteFromSonComponents(this.props.index, false, true);
          })
          .catch((err) => {
            console.error("error while editing exam:", err);
            this.setState({ loading: false });
          });
      }
    }
  };

  cancelEdit = (e) => {
    e.stopPropagation();
    if (!this.state.loading) {
      this.props.setEdit(false);
      this.props.changeQuestionComponent(this.props.index, "QUESTION");
    }
  };

  removeAnswer = (e, index) => {
    e.stopPropagation();

    if (!this.state.loading) {
      let question = this.state.question;
      let body = Object.keys(question)[0];

      let answers = this.state.answers;
      answers.splice(index, 1);
      question[body]["answers"] = answers;

      this.setState({ question: question, answers: answers });
      this.props.questionCopyChanged(this.props.index, question);
    }
  };

  addAnswer = (e) => {
    e.stopPropagation();

    if (!this.state.loading) {
      let question = this.state.question;
      let body = Object.keys(question)[0];
      let answers = this.state.answers;

      if (answers.length < 5) {
        answers = [...answers, ""];
        question[body]["answers"] = answers;

        this.setState({ question: question, answers: answers });
        this.props.questionCopyChanged(this.props.index, question);
      }
    }
  };

  correctAnswerChanged = (e) => {
    e.stopPropagation();

    if (!this.state.loading) {
      let newVal = e.target.value;

      if (newVal >= 1 && newVal <= this.state.answers.length) {
        let question = this.state.question;
        let body = Object.keys(question)[0];

        question[body]["correctAnswer"] = newVal;

        this.setState({ question: question, correctAnswer: newVal });
        this.props.questionCopyChanged(this.props.index, question);
      }
    }
  };

  difficultyChanged = (e) => {
    e.stopPropagation();

    if (!this.state.loading) {
      let newVal = e.target.value;

      if (newVal >= 1 && newVal <= 9) {
        let question = this.state.question;
        let body = this.state.body;

        question[body]["difficulty"] = newVal;

        this.setState({ question: question, difficulty: newVal });
        this.props.questionCopyChanged(this.props.index, question);
      }
    }
  };

  subjectChanged = (e) => {
    e.stopPropagation();

    if (!this.state.loading) {
      let newVal = e.target.value;

      let question = this.state.question;
      let body = Object.keys(question)[0];

      question[body]["subject"] = newVal;

      this.setState({ question: question, subject: newVal });
      this.props.questionCopyChanged(this.props.index, question);
    }
  };

  getAnswers = () => {
    let answers = this.state.answers;
    return (
      <div className="question_answers">
        <span
          className="material-icons delete_icon"
          onClick={(e) => this.deleteQuestion(e)}
        >
          delete
        </span>
        <span
          className="material-icons cancel_edit_model"
          onClick={(e) => this.cancelEdit(e)}
        >
          cancel
        </span>
        <br />
        <div className="col-centered">
          <input
            type="text"
            defaultValue={this.state.body}
            name={this.state.body + "_edit"}
            className="question_body_edit_input"
            disabled={this.state.loading || this.state.loading_parent}
            onChange={(e) => this.bodyChanged(e)}
          />
        </div>
        <span
          className="material-icons plus_subjec_icon"
          onClick={(e) => this.addAnswer(e)}
        >
          add
        </span>
        <br />
        {answers.map((elm, index) => {
          return (
            <div className="question_answer" key={index}>
              <span
                className="material-icons remove_icon"
                onClick={(e) => this.removeAnswer(e, index)}
              >
                remove_circle_outline
              </span>
              <input
                type="text"
                value={elm}
                name={elm + "_edit"}
                className="question_edit_input"
                disabled={this.state.loading || this.state.loading_parent}
                onChange={(e) => this.answersChanged(e, index)}
              />
            </div>
          );
        })}
        <br />
        <span className="question_detail_edit_title">Difficulty:</span>
        <input
          type="number"
          defaultValue={this.state.difficulty || ""}
          name={"question_difficulty_edit"}
          className="question_difficulty_edit_input"
          disabled={this.state.loading || this.state.loading_parent}
          onChange={(e) => this.difficultyChanged(e)}
        />
        <br /> <br />
        <span className="correctAnswer_edit_title">Correct Answer:</span>
        <input
          type="number"
          defaultValue={this.state.correctAnswer || ""}
          name={"correctAnswer_edit"}
          max={this.state.answers.length}
          className="correctAnswer_edit_input"
          disabled={this.state.loading || this.state.loading_parent}
          onChange={(e) => this.correctAnswerChanged(e)}
        />
        <br /> <br />
        <span className="question_detail_edit_title">Subject:</span>
        <input
          type="text"
          defaultValue={this.state.subject || ""}
          name={"question_subject_edit"}
          className="question_subject_edit_input"
          disabled={this.state.loading || this.state.loading_parent}
          onChange={(e) => this.subjectChanged(e)}
        />
        <br />
        <div
          className="material-icons save_question_icon"
          onClick={(e) => this.saveQuestion(e)}
        >
          save
        </div>
        <div className="col-centered model_loading">
          <RotateLoader css={override} loading={this.state.loading} />
        </div>
      </div>
    );
  };

  render() {
    return (
      <div className="question_container">
        <div> {this.getAnswers()} </div>
      </div>
    );
  }
}

export default EditQuestion;