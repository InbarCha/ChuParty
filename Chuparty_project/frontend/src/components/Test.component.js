import React, { Component } from "react";
import RotateLoader from "react-spinners/ClipLoader";
import { css } from "@emotion/core";
import QuestionsCarousel from "./QuestionsCarousel.component";
import TestResult from "./TestResult.component";

const EXAM_BY_ID_ROUTE =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development"
    ? "http://localhost:8000/api/getExamByID?examID="
    : "/api/getExamByID?examID=";

const override = css`
  display: block;
  margin: 0 auto;
`;

export default class Test extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeExamsID: localStorage["activeExamID"],
      exam: "",
      loading: false,
      afterTest: false,
      submitedItems: [],
    };
    this.showTest = this.showTest.bind(this);
    this.showResults = this.showResults.bind(this);
    this.answersSubmitHandler = this.answersSubmitHandler.bind(this);
  }

  componentDidMount() {
    if (this.state.activeExamsID !== undefined) {
      this.setState({ loading: true });
      fetch(EXAM_BY_ID_ROUTE + this.state.activeExamsID)
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          this.setState({ exam: data[Object.keys(data)], loading: false });
        })
        .catch((err) => console.error("error while fetching exam: ", err));
    }
  }

  answersSubmitHandler(items) {
    console.log("submitted!", items);
    this.setState({ afterTest: true, submitedItems: items });
  }

  showTest() {
    let res = (
      <div style={{ height: "50%" }}>
        <QuestionsCarousel
          parentAnswersSubmitHandler={this.answersSubmitHandler}
          questions={this.state.exam.questions}
        />
      </div>
    );
    return res;
  }
  showResults() {
    let res = (
      <TestResult
        items={this.state.submitedItems}
        sendResultsFlg={true}
      ></TestResult>
    );
    return res;
  }

  render() {
    let res;
    if (this.state.loading)
      res = (
        <div className="col-centered models_loading" dir="RTL">
          <div className="loading_title"> טוען מבחן... </div>
          <RotateLoader css={override} size={50} />
        </div>
      );
    else if (this.state.afterTest) res = <div>{this.showResults()}</div>;
    else res = <div>{this.showTest()}</div>;
    return res;
  }
}
