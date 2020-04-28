import React, { Component } from "react";
import { Col } from "react-bootstrap";

export class Course extends Component {
  editCourse = (e, courseName) => {
    e.stopPropagation();
    console.log("edit course: " + courseName);
  };

  render() {
    let courseName = Object.keys(this.props.course)[0];

    return (
      <Col xs={12} sm={12} md={6} lg={6} xl={4}>
        <div
          className={"model col-centered"}
          onClick={this.props.chooseActiveCourse.bind(this, courseName)}
        >
          <div className="model_container">
            <div className="model_name">
              <span
                className="material-icons settings_icon"
                onClick={(e) => this.editCourse(e, courseName)}
              >
                settings
              </span>
              <img className="course_img" alt="" />
              <div style={{ fontSize: "x-large", fontWeight: "bold" }}>
                {courseName}
              </div>
            </div>
            {this.props.course[courseName]["subjects"].length >= 1 && (
              <div className="details_container">
                {this.props.course[courseName]["subjects"].map(
                  (elm, j_index) => {
                    return (
                      <div className="detail_container" key={j_index}>
                        {elm}
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>
        </div>
      </Col>
    );
  }
}

export default Course;
