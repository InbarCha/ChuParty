import React, { Component } from "react";

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      parentClickHandler: props.parentClickHandler,
    };
  }
  render() {
    return (
      <div className="sidebar">
        <div
          className="side_item"
          onClick={(e) => this.state.parentClickHandler("HOME")}
        >
          <i className="material-icons">home</i>
        </div>
        <div className="side_description">
          <span>Home</span>
        </div>

        <div
          className="side_item"
          onClick={(e) => this.state.parentClickHandler("COURSES")}
        >
          <i className="material-icons">school</i>
        </div>
        <div className="side_description">
          <span>Courses</span>
        </div>

        <div
          className="side_item"
          onClick={(e) => this.state.parentClickHandler("EXAMS")}
        >
          <i className="material-icons">web</i>
        </div>
        <div className="side_description">
          <span>Exams</span>
        </div>

        <div
          className="side_item"
          onClick={(e) => this.state.parentClickHandler("QUESTIONS")}
        >
          <i className="material-icons">question_answer</i>
        </div>
        <div className="side_description">
          <span>Questions</span>
        </div>

        <div
          className="side_item"
          onClick={(e) => this.state.parentClickHandler("FEEDBACK")}
        >
          <i className="material-icons">message</i>
        </div>
        <div className="side_description">
          <span>Statistics</span>
        </div>

        <div
          className="side_item"
          onClick={(e) => this.state.parentClickHandler("ADMIN")}
        >
          <i className="material-icons">widgets</i>
        </div>
        <div className="side_description">
          <span>Admin</span>
        </div>
      </div>
    );
  }
}
