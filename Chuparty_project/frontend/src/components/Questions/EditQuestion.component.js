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
  constructor() {
    super();
    this.state = {
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

  getAnswers = () => {
    let answers = this.state.answers;
    return (
      <div className="question_answers">
        {answers.map((elm, index) => {
          return (
            <div className="question_answer" key={uuid()}>
              <span className="material-icons">question_answer</span>{" "}
              <span style={{ paddingLeft: "1vw" }}>{elm}</span>
              <input
                type="text"
                value={elm}
                name={elm + "_edit"}
                className="question_edit_input"
                disabled={this.state.loading}
                onChange={(e) => this.answersChanged(e, index)}
              />
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

export default EditQuestion;
