import React, { Component } from "react";
import { css } from "@emotion/core";
import RotateLoader from "react-spinners/ClipLoader";
import { bounce } from "react-animations";
import styled, { keyframes } from "styled-components";
import uuid from "react-uuid";

if (!process.env.NODE_ENV || process.env.NODE_ENV === "development")
  console.log("DEV enabled");
const EDIT_QUESTION_ROUTE =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development"
    ? "http://localhost:8000/api/editQuestion"
    : "/api/editQuestion";
const DELETE_QUESTION_ROUTE =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development"
    ? "http://localhost:8000/api/deleteQuestion?body="
    : "/api/deleteQuestion?body=";

const Bounce = styled.div`
  animation: 2s ${keyframes`${bounce}`};
`;

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
      loading: false,
    };
  }

  componentDidMount() {
    let question = this.state.question;
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

    this.setState({ loading: false });
  }

  answersChanged = (e, index) => {};

  saveQuestion = (e) => {};

  bodyChanged = (e) => {};

  deleteQuestion = (e) => {};

  cancelEdit = (e) => {};

  removeAnswer = (e, index) => {};

  addAnswer = (e) => {};

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
            disabled={this.state.loading}
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
            <div className="question_answer" key={uuid()}>
              <span
                className="material-icons"
                onClick={(e) => this.removeAnswer(e, index)}
              >
                remove_circle_outline
              </span>
              <input
                type="text"
                defaultValue={elm}
                name={elm + "_edit"}
                className="question_edit_input"
                disabled={this.state.loading}
                onChange={(e) => this.answersChanged(e, index)}
              />
            </div>
          );
        })}
        <div
          className="material-icons save_question_icon"
          onClick={(e) => this.saveQuestion(e)}
        >
          save
        </div>
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

export default EditQuestion;
