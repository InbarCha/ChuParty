import React, { Component } from "react";
import { css } from "@emotion/core";
import RotateLoader from "react-spinners/ClipLoader";
import scrollToComponent from "react-scroll-to-component";
import Select from "react-select";

const SET_QUESTION_ROUTE =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development"
    ? "http://localhost:8000/api/setQuestion"
    : "/api/setQuestion";
const EDIT_EXAM_ROUTE =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development"
    ? "http://localhost:8000/api/editExam"
    : "/api/editExam";

const override = css`
  display: block;
  margin: 0 auto;
`;

export class AddQuestion extends Component {
  constructor(props) {
    super(props);
    this.state = {
      question: this.props.question,
      body: "Question Body",
      answers: [""],
      correctAnswer: 1,
      difficulty: 1,
      course: this.props.question[Object.keys(this.props.question)[0]][
        "course"
      ],
      subject: "",
      loading: false,
      selectSubjectsOptions: [],
      selectedSubject: null,
      subjectInput: "",
    };
  }

  componentDidMount() {
    let courseSubjects = localStorage["activeCourseSubjects"].split(",");

    this.setState({
      selectSubjectsOptions: courseSubjects.map((elm) => {
        return { value: elm, label: elm };
      }),
    });

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
      this.props.deleteFromSonComponents(
        this.props.index_questions,
        true,
        false
      );
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
      this.props.questionAddedChanged(this.props.index, newQuestion);
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
        this.props.questionAddedChanged(this.props.index, question);
      }
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
      this.props.questionAddedChanged(this.props.index, question);
    }
  };

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
      this.props.questionAddedChanged(this.props.index, question);
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
        this.props.questionAddedChanged(this.props.index, question);
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
        this.props.questionAddedChanged(this.props.index, question);
      }
    }
  };

  subjectChanged = (selectedOption) => {
    if (!this.state.loading) {
      let question = this.state.question;
      let body = this.state.body;

      if (selectedOption !== null) {
        let subject = selectedOption["value"];
        question[body]["subject"] = subject;
        this.setState({
          subject: subject,
          question: question,
        });
      } else {
        question[body]["subject"] = null;
        this.setState({ subject: null, question: question, subjectInput: "" });
      }

      this.setState({
        selectedSubject: selectedOption,
      });
      this.props.questionAddedChanged(this.props.index, question);
    }
  };

  subjectInputChanged = (newInput) => {
    this.setState({ subjectInput: newInput });
  };

  menuClosed = () => {
    if (this.state.subject === null || this.state.subject === "") {
      this.setState({
        selectedSubject: {
          label: this.state.subjectInput,
          value: this.state.subjectInput,
        },
        subjectInput: this.state.subjectInput,
        subject: this.state.subjectInput,
      });
    }
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

      if (
        question[body]["subject"] === "" ||
        question[body]["subject"] === null
      ) {
        question[body]["subject"] = this.state.subjectInput;
      }
      this.setState({
        question: question,
        subject: this.state.subjectInput,
        answers: answers,
      });

      if (question[body]["subject"] !== "" && body !== "Question Body") {
        this.setState({ loading: true });

        //save changes to db and propagate changes to questions component
        this.saveChangesToDb();
      } else if (question[body]["subject"] === "" && body === "Question Body") {
        window.alert(
          "Can't save question: 'Subject' is empty & You haven't set the question's body!"
        );
      } else if (body === "Question Body") {
        window.alert(
          "Can't save question: You haven't set the question's body!"
        );
      } else {
        window.alert("Can't save question: 'Subject' is empty!");
      }
    }
  };

  // {
  //   "subject":
  //       {
  //           "name": "UDP"
  //       },
  //   "course":
  //     {
  //       "name" : "Computer Networks"
  //     },
  //    "body": "What is UDP?",
  //    "answers": [
  //           "bleh bel",
  //           "bbbb",
  //           "User Datagram Protocol",
  //           "Deformation of Name Servers"
  //       ],
  //     "correctAnswer": 3,
  //     "difficulty": 1
  // }
  saveChangesToDb = () => {
    let request_body = {};
    request_body["body"] = this.state.body;
    request_body["subject"] = { name: this.state.subject };
    request_body["course"] = { name: Object.keys(this.state.course)[0] };
    request_body["answers"] = this.state.answers;
    request_body["correctAnswer"] = parseInt(this.state.correctAnswer);
    request_body["difficulty"] = parseInt(this.state.difficulty);

    console.log(request_body);

    fetch(SET_QUESTION_ROUTE, {
      method: "post",
      body: JSON.stringify(request_body),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        this.props.addQuestionToSonComponents(data["Returned Question"]);
        this.setState({ loading: false });

        let activeCourseSubjects = localStorage["activeCourseSubjects"].split(
          ","
        );
        if (activeCourseSubjects.indexOf(this.state.subject) < 0) {
          activeCourseSubjects = [
            ...activeCourseSubjects.filter((elm) => elm !== ""),
            this.state.subject,
          ];
          localStorage["activeCourseSubjects"] = activeCourseSubjects;
        }
      })
      .then(() => {
        this.editExamWithNewQuestion();
      })
      .catch((err) => {
        console.error("error while editing question:", err);
        this.setState({ loading: false });
      });
  };

  editExamWithNewQuestion = () => {
    let request_body = {};
    request_body["examID"] = localStorage["activeExamID"];
    request_body["AddQuestions"] = [{ body: this.state.body }];

    fetch(EDIT_EXAM_ROUTE, {
      method: "post",
      body: JSON.stringify(request_body),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
      })
      .catch((err) => {
        console.error("error while editing exam:", err);
      });
  };

  getAnswers = () => {
    let answers = this.state.answers;
    return (
      <div className="question_answers">
        <span
          className="material-icons cancel_edit_model"
          onClick={(e) => this.cancelEdit(e)}
        >
          cancel
        </span>
        <div
          className="material-icons save_icon"
          onClick={(e) => this.saveQuestion(e)}
        >
          save
        </div>
        <br />
        <div className="col-centered">
          <input
            type="text"
            defaultValue={this.state.body}
            name={this.state.body + "_edit"}
            className="question_body_edit_input"
            disabled={this.state.loading}
            dir="RTL"
            onkeyup="rtl(this)"
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
                dir="RTL"
                value={elm}
                name={elm + "_edit"}
                className="question_edit_input"
                disabled={this.state.loading}
                onChange={(e) => this.answersChanged(e, index)}
              />
            </div>
          );
        })}
        <br />
        <span className="question_detail_edit_title">רמת קושי:</span>
        <input
          type="number"
          defaultValue={this.state.difficulty || ""}
          name={"question_difficulty_edit"}
          className="question_difficulty_edit_input"
          min={1}
          max={10}
          disabled={this.state.loading}
          dir="RTL"
          onChange={(e) => this.difficultyChanged(e)}
        />
        <br /> <br />
        <span className="correctAnswer_edit_title">תשובה נכונה:</span>
        <input
          type="number"
          defaultValue={this.state.correctAnswer || ""}
          name={"correctAnswer_edit"}
          max={this.state.answers.length}
          className="correctAnswer_edit_input"
          dir="RTL"
          disabled={this.state.loading}
          onChange={(e) => this.correctAnswerChanged(e)}
        />
        <br /> <br />
        <span className="question_detail_edit_title">נושא:</span>
        <Select
          placeholder="בחר נושא"
          value={this.state.selectedSubject}
          onChange={this.subjectChanged}
          options={this.state.selectSubjectsOptions}
          isDisabled={this.state.loading || this.state.loading_parent}
          isClearable={true}
          isRtl={true}
          onInputChange={this.subjectInputChanged}
          onMenuClose={this.menuClosed}
        />
        <br />
        <div className="col-centered model_loading">
          <RotateLoader css={override} loading={this.state.loading} />
        </div>
      </div>
    );
  };

  render() {
    return (
      <div className="question_container" dir="RTL">
        <div> {this.getAnswers()} </div>
      </div>
    );
  }
}

export default AddQuestion;
