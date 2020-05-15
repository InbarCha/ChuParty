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
          <span>עמוד הבית</span>
        </div>

        <div
          className="side_item"
          onClick={(e) => this.state.parentClickHandler("COURSES")}
        >
          <i className="material-icons">school</i>
        </div>
        <div className="side_description">
          <span>קורסים</span>
        </div>

        <div
          className="side_item"
          onClick={(e) => this.state.parentClickHandler("EXAMS")}
        >
          <i className="material-icons">web</i>
        </div>
        <div className="side_description">
          <span>מבחנים</span>
        </div>

        <div
          className="side_item"
          onClick={(e) => this.state.parentClickHandler("QUESTIONS")}
        >
          <i className="material-icons">question_answer</i>
        </div>
        <div className="side_description">
          <span>שאלות</span>
        </div>

        <div
          className="side_item"
          onClick={(e) => this.state.parentClickHandler("FEEDBACK")}
        >
          <i className="material-icons">message</i>
        </div>
        <div className="side_description">
          <span>סטטיסטיקה</span>
        </div>

        <div
          className="side_item"
          onClick={(e) => this.state.parentClickHandler("ADMIN")}
        >
          <i className="material-icons">widgets</i>
        </div>
        <div className="side_description">
          <span>אדמין</span>
        </div>
      </div>
    );
  }
}
