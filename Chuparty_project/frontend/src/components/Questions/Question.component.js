import React, { Component } from "react";
import uuid from "react-uuid";

export class Question extends Component {
  constructor() {
    super();
    this.state = {
      body: null,
      answers: [],
      correctAnswer: null,
      difficulty: null,
    };
  }

  componentDidMount() {
    let question = this.props.question;
    let body = Object.keys(question)[0];
    let answers = question[body]["answers"];
    let correctAnswer = question[body]["correctAnswer"];
    let difficulty = question[body]["difficulty"];

    this.setState({
      body: body,
      answers: answers,
      correctAnswer: correctAnswer,
      difficulty: difficulty,
    });
  }

  editQuestion = (e) => {
    e.stopPropagation();
    this.props.changeQuestionComponent(this.props.index, "EDIT");
  };

  getAnswers = () => {
    let answers = this.state.answers;
    return (
      <div className="question_answers">
        {answers.map((elm, index) => {
          return (
            <div className="question_answer" key={uuid()}>
              <span className="material-icons">question_answer</span>{" "}
              <span style={{ paddingLeft: "1vw" }}>{elm}</span>
            </div>
          );
        })}
      </div>
    );
  };

  render() {
    return (
      <div className="question_container">
        <span
          className="material-icons settings_icon"
          onClick={(e) => this.editQuestion(e)}
        >
          settings
        </span>
        <div className="question_body"> {this.props.body}</div>
        <div> {this.getAnswers()} </div>
      </div>
    );
  }
}

export default Question;
