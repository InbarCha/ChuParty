import React, { Component } from "react";
import { Col } from "react-bootstrap";
import { bounce } from "react-animations";
import styled, { keyframes } from "styled-components";

const Bounce = styled.div`
  animation: 2s ${keyframes`${bounce}`};
`;

export class EditCourse extends Component {
  deleteCourse = (e) => {
    e.stopPropagation();
  };

  saveCourse = (e) => {
    e.stopPropagation();

    //if a course field changed (name or subject) save in the db

    this.props.changeCourseComponent(this.props.index, "COURSE");
  };

  render() {
    let courseName = Object.keys(this.props.course)[0];

    return (
      <Col xs={12} sm={12} md={6} lg={6} xl={4}>
        <Bounce className="bounce_div">
          <div className={"model col-centered"}>
            <div className="model_container">
              <div className="model_name">
                <span
                  className="material-icons save_icon"
                  onClick={(e) => this.saveCourse(e)}
                >
                  save
                </span>
                <span
                  className="material-icons delete_icon"
                  onClick={(e) => this.deleteCourse(e)}
                >
                  delete
                </span>
                <img className="edit_img" alt="" />
                <div style={{ fontSize: "x-large", fontWeight: "bold" }}>
                  <input
                    type="text"
                    defaultValue={courseName}
                    name={courseName + "_edit"}
                    className="courseName_edit_input"
                  />
                </div>
              </div>
              {this.props.course[courseName]["subjects"].length >= 1 && (
                <div className="details_container">
                  {this.props.course[courseName]["subjects"].map(
                    (elm, j_index) => {
                      return (
                        <div className="detail_container" key={j_index}>
                          <input
                            type="text"
                            defaultValue={elm}
                            name={elm + "_edit"}
                            className="subject_edit_input"
                          />
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          </div>
        </Bounce>
      </Col>
    );
  }
}

export default EditCourse;
