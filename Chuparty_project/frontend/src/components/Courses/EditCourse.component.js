import React, { Component } from "react";
import { Col } from "react-bootstrap";
import { css } from "@emotion/core";
import RotateLoader from "react-spinners/ClipLoader";
import { bounce } from "react-animations";
import styled, { keyframes } from "styled-components";

if (!process.env.NODE_ENV || process.env.NODE_ENV === "development")
  console.log("DEV enabled");
const EDIT_COURSE_ROUTE =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development"
    ? "http://localhost:8000/api/editCourse"
    : "/api/editCourse";
const DELETE_COURSE_ROUTE =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development"
    ? "http://localhost:8000/api/deleteCourse?name="
    : "/api/deleteCourse?name=";

const Bounce = styled.div`
  animation: 2s ${keyframes`${bounce}`};
`;

const override = css`
  display: block;
  margin: 0 auto;
`;

export class EditCourse extends Component {
  constructor(props) {
    super(props);
    this.state = {
      course: this.props.course,
      addedSubjects: [],
      deletedSubjects: [],
      loading: false,
    };
  }

  componentDidMount() {
    this.setState({ loading: false });
  }

  deleteCourse = (e) => {
    e.stopPropagation();

    if (!this.state.loading) {
      this.setState({ loading: true });

      //TODO: change to message-box
      if (window.confirm("Are you sure you want to delete this courese?")) {
        let course = this.props.course_orig;
        let courseName = Object.keys(course)[0];

        fetch(DELETE_COURSE_ROUTE + courseName)
          .then((res) => res.json())
          .then((data) => {
            console.log(data);
            this.props.deleteFromSonComponents(this.props.index);
            this.setState({ loading: false });
          })
          .catch((err) => {
            console.error("error while fetching courses:", err);
            this.setState({ loading: false });
          });
      }
    }
  };

  saveCourse = (e) => {
    e.stopPropagation();
    if (!this.state.loading) {
      this.setState({ loading: true });
      this.saveChangesToDb();
    }
  };

  //save changes to the DB
  // {
  //   "name": "OOP",
  //   "ChangeName": "Object-Oriented Programming"
  //   "AddToSubjects":[
  //             {
  //                 "name": "C++"
  //             }
  //         ]
  //     "DeleteFromSubjects": [
  //             {
  //                 "name": "c"
  //             }
  //         ]
  //   ]
  // }
  saveChangesToDb = () => {
    let course_orig = this.props.course_orig;
    let courseNameOrig = Object.keys(course_orig)[0];
    let courseNameNew = Object.keys(this.state.course)[0];

    let request_body = {};
    request_body["name"] = courseNameOrig;

    //course name has changed
    if (courseNameOrig !== courseNameNew) {
      request_body["ChangeName"] = courseNameNew;
    }

    if (this.state.addedSubjects.length > 0) {
      request_body["AddToSubjects"] = this.state.addedSubjects
        .filter((subject) => subject !== "")
        .map((elm) => {
          return { name: elm };
        });
    }

    if (this.state.deletedSubjects.length > 0) {
      request_body["DeleteFromSubjects"] = this.state.deletedSubjects
        .filter((subject) => subject !== "")
        .map((elm) => {
          return { name: elm };
        });
    }

    fetch(EDIT_COURSE_ROUTE, {
      method: "post",
      body: JSON.stringify(request_body),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        this.setState({ loading: false });
        this.props.changedCourse(data["Edited Course"], this.props.index);
        this.props.changeCourseComponent(this.props.index, "COURSE");
      })
      .catch((err) => {
        console.error("error while editing course:", err);
        this.setState({ loading: false });
      });
  };

  cancelEdit = (e) => {
    e.stopPropagation();
    if (!this.state.loading) {
      this.props.changeCourseComponent(this.props.index, "COURSE");
    }
  };

  subjectChanged = (e, index) => {
    let newVal = e.target.value;

    if (!this.state.loading) {
      let addedSubjects = this.state.addedSubjects;
      addedSubjects[index] = newVal;

      this.setState({ addedSubjects: addedSubjects });
    }
  };

  courseNameChanged = (e) => {
    if (!this.state.loading) {
      let newVal = e.target.value;

      let course = { ...this.state.course };
      let oldCourseName = Object.keys(course)[0];

      let newCourse = {};
      newCourse[newVal] = {};
      newCourse[newVal]["subjects"] = course[oldCourseName]["subjects"];

      this.setState({ course: newCourse });
      console.log(Object.keys(this.state.course)[0]);
    }
  };

  addSubject = (e) => {
    e.stopPropagation();

    if (!this.state.loading) {
      let addedSubjects = this.state.addedSubjects;
      addedSubjects = [...addedSubjects, ""];
      this.setState({ addedSubjects: addedSubjects });
    }
  };

  removeSubject = (e, index, array_name) => {
    e.stopPropagation();

    if (!this.state.loading) {
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
                  className="material-icons cancel_edit_model"
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
                <input
                  type="text"
                  defaultValue={courseName}
                  name={courseName + "_edit"}
                  className="modelTitle_edit_input"
                  disabled={this.state.loading}
                  onChange={(e) => this.courseNameChanged(e)}
                />
              </div>
              <div className="details_container">
                <span
                  className="material-icons plus_subjec_icon"
                  onClick={(e) => this.addSubject(e)}
                >
                  add
                </span>
                <span
                  className="material-icons save_icon"
                  onClick={(e) => this.saveCourse(e)}
                >
                  save
                </span>
                <br />
                {this.state.course[courseName]["subjects"].length >= 1 && (
                  <React.Fragment>
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
                  </React.Fragment>
                )}
                {this.state.addedSubjects.map((elm, j_index) => {
                  return (
                    <div className="detail_container" key={j_index}>
                      <input
                        type="text"
                        value={elm}
                        name={elm + "_edit"}
                        className="subject_edit_input"
                        disabled={this.state.loading}
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
                <div className="col-centered model_loading">
                  <RotateLoader css={override} loading={this.state.loading} />
                </div>
              </div>
            </div>
          </div>
        </Bounce>
      </Col>
    );
  }
}

export default EditCourse;
