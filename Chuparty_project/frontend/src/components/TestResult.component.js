import React, { Component } from "react";

const RESULTS_ROUTE =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development"
    ? "http://localhost:8000/api/submitResults"
    : "/api/submitResults";

export default class TestResult extends Component {
  constructor(props) {
    super(props);
    this.state = {
      numQuestions: props.items.length,
      correct: 0,
      grade: 0,
    };
  }

  async componentDidMount() {
    await this.setCorrectAnswers();
    if (this.props.sendResultsFlg !== false) {
      this.sendResults();
    }
  }

  sendResults() {
    let request_body = {};
    request_body["username"] = localStorage["loggedUsername"];
    request_body["items"] = this.props.items;
    request_body["grade"] = Math.round(
      (this.state.correct / this.state.numQuestions) * 100
    );
    request_body["examID"] = localStorage["activeExamID"];

    console.log(request_body);

    fetch(RESULTS_ROUTE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request_body),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        let examsSolved = data["Exams Solved"];
        localStorage["logged_exams_solved"] = JSON.stringify(examsSolved);

        let questionsAnswered = data["Questions Answered"];
        localStorage["logged_questions_answered"] = JSON.stringify(
          questionsAnswered
        );
      })
      .catch((err) => {
        console.error("error while submitting results", err);
      });
  }

  setCorrectAnswers() {
    console.log("setting correct answers");
    let items = this.props.items;
    let _correct = items
      .map((elm) => {
        if (elm.selectedAnswers.length === 1) {
          return elm.correctAnswer === elm.selectedAnswers[0] ? 1 : 0;
        } else if (elm.correctAnswer instanceof Array) {
          if (elm.correctAnswer.length === elm.selectedAnswers.length) {
            for (let i = 0; i < elm.correctAnswer.length; i++) {
              if (elm.selectedAnswers.indexOf(elm.correctAnswer[i]) === -1)
                return 0;
            }
            return 1;
          } else return 0;
        } else return 0;
      })
      .reduce((prev, current) => {
        return prev + current;
      });
    this.setState({ correct: _correct });
  }

  render() {
    let res = this.state.correct ? (
      <div id="testResults">
        <div id="testResultsHead">
          <h1 className="resultsTitle">תוצאות המבחן</h1>
          <span className="correct">צדקת ב: &nbsp;</span>
          {this.state.correct}
          <br />
          <span className="total">מתוך: &nbsp;</span>
          {this.state.numQuestions}
          <br />
          <span className="grade">ציון: &nbsp;</span>
          {Math.round((this.state.correct / this.state.numQuestions) * 100)}
        </div>
        <hr />
        <br />
        {this.props.items.map((elm, i) => {
          return (
            <div className="questionResult">
              <h3>
                שאלה&nbsp;
                {i + 1}:
              </h3>
              <p>{elm.question}</p>
              {elm.answers.map((answer, j) => {
                let cls = "answer";
                if (elm.correctAnswer === j) cls += " correctAnswer";
                if (elm.selectedAnswers.indexOf(j) !== -1)
                  cls += " selectedAnswer";
                return <p className={cls}>{answer}</p>;
              })}
              <hr id="separator" />
            </div>
          );
        })}
      </div>
    ) : (
      <h1>loading</h1>
    );
    return res;
  }
}
