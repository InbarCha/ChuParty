import React, { Component } from "react";
import { Col } from "react-bootstrap";
import { bounce } from "react-animations";
import styled, { keyframes } from "styled-components";

const Bounce = styled.div`
  animation: 2s ${keyframes`${bounce}`};
`;

export class Course extends Component {
  constructor(props) {
    super(props);
  }

  editCourse = (e) => {
    e.stopPropagation();
    this.props.changeCourseComponent(this.props.index, "EDIT");
  };

  deleteFromMyCourses = (e) => {
    e.stopPropagation();
    this.props.deleteFromMyCourses(e, this.props.index);
  };

  render() {
    let courseName = Object.keys(this.props.course)[0];
    let newCourse = (
      <div
        className={"model col-centered"}
        onClick={this.props.chooseActiveCourse.bind(this, courseName)}
      >
        <div className="model_container">
          <div className="model_name">
            {(localStorage["logged_type"] === "Admin" ||
              localStorage["logged_type"] === "Lecturer") && (
              <span
                className="material-icons settings_icon"
                onClick={(e) => this.editCourse(e)}
              >
                settings
              </span>
            )}
            <span
              className="material-icons delete_icon"
              onClick={this.deleteFromMyCourses}
            >
              delete
            </span>
            <img className="course_img" alt="" />
            <div className="course_name_text">{courseName}</div>
          </div>
          {this.props.course[courseName]["subjects"].length >= 1 && (
            <div className="details_container">
              {this.props.course[courseName]["subjects"].map((elm, j_index) => {
                return (
                  <div className="detail_container" key={j_index}>
                    {elm}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
    return (
      <React.Fragment>
        {this.props.bounce && (
          <Col xs={12} sm={12} md={6} lg={6} xl={4}>
            <Bounce className="bounce_div"> {newCourse} </Bounce>
          </Col>
        )}
        {!this.props.bounce && (
          <Col xs={12} sm={12} md={6} lg={6} xl={4}>
            {newCourse}
          </Col>
        )}
      </React.Fragment>
    );
  }
}

export default Course;
