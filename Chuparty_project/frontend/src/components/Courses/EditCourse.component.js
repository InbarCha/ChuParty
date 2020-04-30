import React, { Component } from "react";
import { Col } from "react-bootstrap";
import { bounce } from "react-animations";
import styled, { keyframes } from "styled-components";

const Bounce = styled.div`
  animation: 2s ${keyframes`${bounce}`};
`;

export class EditCourse extends Component {
  constructor(props) {
    super(props);
    this.state = {
      course: this.props.course,
      addedSubjects: [],
      deletedSubjects: [],
    };
  }

  deleteCourse = (e) => {
    e.stopPropagation();
  };

  saveCourse = (e) => {
    e.stopPropagation();

    //save changes to the DB

    //save changes to course_orig
    let course = this.state.course;
    let courseName = Object.keys(course)[0];
    let subjects = course[courseName]["subjects"];

    if (this.state.addedSubjects.length > 0) {
      course[courseName]["subjects"] = [...subjects, this.state.addedSubjects];
    }
    this.props.changedCourse(course, this.props.index);

    this.props.changeCourseComponent(this.props.index, "COURSE");
  };

  cancelEdit = (e) => {
    e.stopPropagation();
    this.props.changeCourseComponent(this.props.index, "COURSE");
  };

  subjectChanged = (e, index) => {
    let newVal = e.target.value;

    let addedSubjects = this.state.addedSubjects;
    addedSubjects[index] = newVal;

    this.setState({ addedSubjects: addedSubjects });
  };

  courseNameChanged = (e) => {
    let newVal = e.target.value;

    let course = { ...this.state.course };
    let oldCourseName = Object.keys(course)[0];

    let newCourse = {};
    newCourse[newVal] = {};
    newCourse[newVal]["subjects"] = course[oldCourseName]["subjects"];

    this.setState({ course: newCourse });
    console.log(Object.keys(this.state.course)[0]);
  };

  addSubject = (e) => {
    e.stopPropagation();

    let addedSubjects = this.state.addedSubjects;
    addedSubjects = [...addedSubjects, ""];
    this.setState({ addedSubjects: addedSubjects });
  };

  removeSubject = (e, index, array_name) => {
    e.stopPropagation();

    //remove an existing course subject
    if (array_name === "course_subjects") {
      let course = this.state.course;
      let courseName = Object.keys(course)[0];
      let subjects = course[courseName]["subjects"];

      this.setState({
        deletedSubjects: [...this.state.deletedSubjects, subjects[index]],
      });

      subjects.splice(index, 1);
      course[courseName]["subjects"] = subjects;
      this.setState({ course: course });
    }
    //remove one of the newly added subjects
    else if (array_name === "added_subjects") {
      let addedSubjects = this.state.addedSubjects;
      addedSubjects.splice(index, 1);
      this.setState({ addedSubjects: addedSubjects });
    }
  };

  render() {
    let courseName = Object.keys(this.state.course)[0];

    return (
      <Col xs={12} sm={12} md={6} lg={6} xl={4}>
        <Bounce className="bounce_div">
          <div className={"model col-centered"}>
            <div className="model_container">
              <div className="model_name">
                <span
                  className="material-icons cancel_edit_course"
                  onClick={(e) => this.cancelEdit(e)}
                >
                  cancel
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
                    onChange={(e) => this.courseNameChanged(e)}
                  />
                </div>
              </div>
              <div className="details_container">
                <span
                  className="material-icons plus_subjec_icon"
                  onClick={(e) => this.addSubject(e)}
                >
                  add
                </span>
                <br />
                {this.state.course[courseName]["subjects"].length >= 1 && (
                  <div className="details_container">
                    {this.state.course[courseName]["subjects"].map(
                      (elm, j_index) => {
                        return (
                          <div className="detail_container" key={j_index}>
                            {elm}
                            <span
                              className="material-icons remove_icon"
                              onClick={(e) =>
                                this.removeSubject(
                                  e,
                                  j_index,
                                  "course_subjects"
                                )
                              }
                            >
                              remove_circle_outline
                            </span>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
                {this.state.addedSubjects.map((elm, j_index) => {
                  return (
                    <div className="detail_container" key={j_index}>
                      <input
                        type="text"
                        value={elm}
                        name={elm + "_edit"}
                        className="subject_edit_input"
                        onChange={(e) => this.subjectChanged(e, j_index)}
                      />
                      <span
                        className="material-icons remove_icon"
                        onClick={(e) =>
                          this.removeSubject(e, j_index, "added_subjects")
                        }
                      >
                        remove_circle_outline
                      </span>
                    </div>
                  );
                })}
              </div>
              <span
                className="material-icons save_icon"
                onClick={(e) => this.saveCourse(e)}
              >
                save
              </span>
            </div>
          </div>
        </Bounce>
      </Col>
    );
  }
}

export default EditCourse;
