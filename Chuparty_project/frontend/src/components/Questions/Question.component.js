import React, { Component } from "react";
import uuid from "react-uuid";

export class Question extends Component {
  getAnswers = () => {
    let answers = this.props.answers;
    return (
      <div className="question_answers">
        {answers.map((elm, index) => {
          return (
            <div className="question_answer" key={uuid()}>
              <span className="material-icons">question_answer</span>{" "}
              <span>{elm}</span>
            </div>
          );
        })}
      </div>
    );
  };

  render() {
    return (
      <div className="question_container">
        <div className="question_body"> {this.props.body}</div>
        <div> {this.getAnswers()} </div>
      </div>
    );
  }
}

export default Question;
