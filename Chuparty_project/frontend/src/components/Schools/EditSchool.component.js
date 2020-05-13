import React, { Component } from "react";
import { Col } from "react-bootstrap";
import { css } from "@emotion/core";
import RotateLoader from "react-spinners/ClipLoader";
import { bounce } from "react-animations";
import styled, { keyframes } from "styled-components";

if (!process.env.NODE_ENV || process.env.NODE_ENV === "development")
  console.log("DEV enabled");
const EDIT_SCHOOL_ROUTE =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development"
    ? "http://localhost:8000/api/editSchool"
    : "/api/editSchool";
const DELETE_SCHOOL_ROUTE =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development"
    ? "http://localhost:8000/api/deleteSchool?name="
    : "/api/deleteSchool?name=";

const Bounce = styled.div`
  animation: 2s ${keyframes`${bounce}`};
`;

const override = css`
  display: block;
  margin: 0 auto;
`;

export class EditSchool extends Component {
  constructor(props) {
    super(props);
    this.state = {
      school: this.props.school,
      addedCourses: [],
      deletedCourses: [],
      loading: false,
    };
  }

  componentDidMount() {
    this.setState({ loading: false });
  }

  deleteSchool = (e) => {
    e.stopPropagation();

    if (!this.state.loading) {
      this.setState({ loading: true });

      //TODO: change to message-box
      if (window.confirm("Are you sure you want to delete this School?")) {
        let school = this.props.school_orig;
        let schoolName = school.name;

        fetch(DELETE_SCHOOL_ROUTE + schoolName)
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

  saveChangesToDb = () => {
    let school_orig = this.props.school_orig;
    let schoolNameOrig = school_orig.name;
    let schoolNameNew = this.state.school.name;

    let request_body = {};
    request_body["name"] = schoolNameOrig;

    //school name has changed
    if (schoolNameOrig !== schoolNameNew) {
      request_body["ChangeName"] = schoolNameNew;
    }

    if (this.state.addedCourses.length > 0) {
      request_body["AddToCourses"] = this.state.addedCourses
        .filter((subject) => subject !== "")
        .map((elm) => {
          return { name: elm };
        });
    }

    if (this.state.deletedCourses.length > 0) {
      request_body["DeleteFromCourses"] = this.state.deletedCourses
        .filter((course) => course !== "")
        .map((elm) => {
          return { name: elm };
        });
    }

    fetch(EDIT_SCHOOL_ROUTE, {
      method: "post",
      body: JSON.stringify(request_body),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        this.setState({ loading: false });
        this.props.changedSchool(data["Edited School"], this.props.index);
        this.props.changeSchoolComponent(this.props.index, "SCHOOL");
      })
      .catch((err) => {
        console.error("error while editing school:", err);
        this.setState({ loading: false });
      });
  };

  cancelEdit = (e) => {
    e.stopPropagation();
    if (!this.state.loading) {
      this.props.changeSchoolComponent(this.props.index, "SCHOOL");
    }
  };

  courseChanged = (e, index) => {
    let newVal = e.target.value;

    if (!this.state.loading) {
      let addedCourses = this.state.addedCourses;
      addedCourses[index] = newVal;

      this.setState({ addedCourses: addedCourses });
    }
  };

  schoolNameChanged = (e) => {
    if (!this.state.loading) {
      let newVal = e.target.value;

      let school = { ...this.state.school };
      let oldSchoolName = school.name;

      let newSchool = {};
      newSchool.name = newVal;
      newSchool.courses = school.courses;

      this.setState({ school: newSchool });
    }
  };

  addCourse = (e) => {
    e.stopPropagation();

    if (!this.state.loading) {
      let addedCourses = this.state.addedCourses;
      addedCourses = [...addedCourses, ""];
      this.setState({ addedCourses: addedCourses });
    }
  };

  removeCourse = (e, index, array_name) => {
    e.stopPropagation();

    if (!this.state.loading) {
      //remove an existing course subject
      if (array_name === "courses") {
        let school = this.state.school;
        let courseName = school.name
        let courses = school.courses;

        this.setState({
            deletedCourses: [...this.state.deletedCourses, courses[index]],
        });

        courses.splice(index, 1);
        school.courses = courses;
        this.setState({ school: school });
      }
      //remove one of the newly added subjects
      else if (array_name === "added_courses") {
        let addedCourses = this.state.addedCourses;
        addedCourses.splice(index, 1);
        this.setState({ addedCourses: addedCourses });
      }
    }
  };

  render() {
    let schoolName = this.state.school.name;
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
                  onClick={(e) => this.deleteSchool(e)}
                >
                  delete
                </span>
                <img className="edit_img" alt="" />
                <input
                  type="text"
                  defaultValue={schoolName}
                  name={schoolName + "_edit"}
                  className="modelTitle_edit_input"
                  disabled={this.state.loading}
                  onChange={(e) => this.schoolNameChanged(e)}
                />
              </div>
              <div className="details_container">
                <span
                  className="material-icons plus_subjec_icon"
                  onClick={(e) => this.addCourse(e)}
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
                {this.state.school.courses.length >= 1 && (
                  <React.Fragment>
                    {this.state.school.courses.map(
                      (elm, j_index) => {
                        return (
                          <div className="detail_container" key={j_index}>
                            {elm}
                            <span
                              className="material-icons remove_icon"
                              onClick={(e) =>
                                this.removeCourse(
                                  e,
                                  j_index,
                                  "courses"
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
                {this.state.addedCourses.map((elm, j_index) => {
                  return (
                    <div className="detail_container" key={j_index}>
                      <input
                        type="text"
                        value={elm}
                        name={elm + "_edit"}
                        className="subject_edit_input"
                        disabled={this.state.loading}
                        onChange={(e) => this.courseChanged(e, j_index)}
                      />
                      <span
                        className="material-icons remove_icon"
                        onClick={(e) =>
                          this.removeCourse(e, j_index, "added_courses")
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

export default EditSchool;
