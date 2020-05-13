import React, { Component } from "react";
import { Col } from "react-bootstrap";
import { bounce } from "react-animations";
import styled, { keyframes } from "styled-components";
import { css } from "@emotion/core";
import RotateLoader from "react-spinners/ClipLoader";
import scrollToComponent from "react-scroll-to-component";

const SET_SCHOOL_ROUTE =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development"
    ? "http://localhost:8000/api/setSchool"
    : "/api/setSchool";

const Bounce = styled.div`
  animation: 2s ${keyframes`${bounce}`};
`;

const override = css`
  display: block;
  margin: 0 auto;
`;

export class AddSchool extends Component {
  constructor() {
    super();
    this.state = {
      school: "",
      addedCourses: [],
      loading: false,
    };
  }

  componentDidMount() {
    //create default empty course
    let school = {};
    school.name = "School Name";
    school.courses = [];

    this.setState({ school: school, loading: false });

    //scroll down to new component
    scrollToComponent(this, {
      offset: 0,
      align: "middle",
      duration: 500,
      ease: "inCirc",
    });
  }

  cancelEdit = (e) => {
    e.stopPropagation();
    if (!this.state.loading) {
      this.props.deleteFromSonComponents(this.props.index);
    }
  };

  schoolNameChanged = (e) => {
    if (!this.state.loading) {
      let newVal = e.target.value;

      let school = { ...this.state.school };
    //   let oldSchoolName = school.name;

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

  courseChanged = (e, index) => {
    if (!this.state.loading) {
      let newVal = e.target.value;

      let addedCourses = this.state.addedCourses;
      addedCourses[index] = newVal;

      this.setState({ addedCourses: addedCourses });
    }
  };

  removeCourse = (e, index) => {
    e.stopPropagation();

    if (!this.state.loading) {
      let addedCourses = this.state.addedCourses;
      addedCourses.splice(index, 1);
      this.setState({ addedCourses: addedCourses });
    }
  };

  saveChangesToDb = () => {
    let school = this.state.school;
    let schoolName = school.name;

    let request_body = { name: schoolName };

    if (this.state.addedCourses.length > 0) {
      request_body["courses"] = this.state.addedCourses
        .filter((course) => course !== "")
        .map((elm) => {
          return { name: elm }; // do i want this?
        });
    }

    fetch(SET_SCHOOL_ROUTE, {
      method: "post",
      body: JSON.stringify(request_body),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        if (data["Status"] === "Added School") {
          //propagate changes to the school itself
          this.props.addSchoolToSonComponents(data["New School"]);
        } else if (data["Status"] === "School Already Exists") {
          //TODO: Change to messageBox
          window.alert("Course Already Exists!");
          this.props.deleteFromSonComponents(this.props.index);
        }
        this.setState({ loading: false });
      })
      .catch((err) => {
        console.error("error while creating course:", err);
        this.setState({ loading: false });
      });
  };

  saveSchool = (e) => {
    e.stopPropagation();

    if (!this.state.loading) {
      let school = this.state.school;
      let schoolName = school.name;

      //COURSE NAME ISN'T EMPTY - CREATE THE NEW COURSE
      if (schoolName !== "Course Name") {
        this.setState({ loading: true });

        let courses = school.courses;

        if (this.state.addedCourses.length > 0) {
          school.courses = [
            ...courses,
            ...this.state.addedCourses.filter((course) => course !== ""),
          ];
        }

        //save changes to db
        this.saveChangesToDb();
      }
      //SCHOOL NAME IS EMPTY - DELETE ADD COMPONENT
      else {
        this.props.deleteFromSonComponents(this.props.index);
      }
    }
  };

  render() {
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
                  className="material-icons save_icon"
                  onClick={(e) => this.saveSchool(e)}
                >
                  save
                </span>
                <img className="new_course_img" alt="" />
                <div style={{ fontSize: "x-large", fontWeight: "bold" }}>
                  <input
                    type="text"
                    placeholder="School Name"
                    name="course_namw"
                    className="modelTitle_edit_input"
                    disabled={this.state.loading}
                    onChange={(e) => this.schoolNameChanged(e)}
                  />
                </div>
              </div>
              <div className="details_container">
                <span
                  className="material-icons plus_subjec_icon"
                  onClick={(e) => this.addCourse(e)}
                >
                  add
                </span>
                <br />
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
                        onClick={(e) => this.removeCourse(e, j_index)}
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

export default AddSchool;
