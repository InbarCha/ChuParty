import React, { Component } from "react";
import { Col } from "react-bootstrap";
import { bounce } from "react-animations";
import styled, { keyframes } from "styled-components";
import { css } from "@emotion/core";
import RotateLoader from "react-spinners/ClipLoader";
import scrollToComponent from "react-scroll-to-component";

const SET_COURSE_ROUTE =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development"
    ? "http://localhost:8000/api/setCourse"
    : "/api/setCourse";

const Bounce = styled.div`
  animation: 2s ${keyframes`${bounce}`};
`;

const override = css`
  display: block;
  margin: 0 auto;
`;

export class AddCourse extends Component {
  constructor() {
    super();
    this.state = {
      course: "",
      addedSubjects: [],
      loading: false,
    };
  }

  componentDidMount() {
    //create default empty course
    let course = {};
    course["Course Name"] = {};
    course["Course Name"]["subjects"] = [];

    this.setState({ course: course, loading: false });

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

  courseNameChanged = (e) => {
    if (!this.state.loading) {
      let newVal = e.target.value;

      let course = { ...this.state.course };
      let oldCourseName = Object.keys(course)[0];

      let newCourse = {};
      newCourse[newVal] = {};
      newCourse[newVal]["subjects"] = course[oldCourseName]["subjects"];

      this.setState({ course: newCourse });
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

  subjectChanged = (e, index) => {
    if (!this.state.loading) {
      let newVal = e.target.value;

      let addedSubjects = this.state.addedSubjects;
      addedSubjects[index] = newVal;

      this.setState({ addedSubjects: addedSubjects });
    }
  };

  removeSubject = (e, index) => {
    e.stopPropagation();

    if (!this.state.loading) {
      let addedSubjects = this.state.addedSubjects;
      addedSubjects.splice(index, 1);
      this.setState({ addedSubjects: addedSubjects });
    }
  };

  // {
  //   "name" : "Operating Systems",
  //   "subjects": [
  //     {
  //       "name": "processes"
  //     },
  //     {
  //       "name": "threads"
  //     }
  //   ]
  // }
  saveChangesToDb = () => {
    let course = this.state.course;
    let courseName = Object.keys(course)[0];

    let request_body = { name: courseName };

    if (this.state.addedSubjects.length > 0) {
      request_body["subjects"] = this.state.addedSubjects
        .filter((subject) => subject !== "")
        .map((elm) => {
          return { name: elm };
        });
    }

    console.log(request_body);

    fetch(SET_COURSE_ROUTE, {
      method: "post",
      body: JSON.stringify(request_body),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        if (data["Status"] === "Added Course") {
          //propagate changes to the course itself
          this.props.addCourseToSonComponents(data["New Course"]);
        } else if (data["Status"] === "Course Already Exists") {
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

  saveCourse = (e) => {
    e.stopPropagation();

    if (!this.state.loading) {
      let course = this.state.course;
      let courseName = Object.keys(course)[0];

      //COURSE NAME ISN'T EMPTY - CREATE THE NEW COURSE
      if (courseName !== "Course Name") {
        this.setState({ loading: true });

        let subjects = course[courseName]["subjects"];

        if (this.state.addedSubjects.length > 0) {
          course[courseName]["subjects"] = [
            ...subjects,
            ...this.state.addedSubjects.filter((subject) => subject !== ""),
          ];
        }

        //save changes to db
        this.saveChangesToDb();
      }
      //COURSE NAME IS EMPTY - DELETE ADD COMPONENT
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
                  className="material-icons cancel_edit_course"
                  onClick={(e) => this.cancelEdit(e)}
                >
                  cancel
                </span>
                <span
                  className="material-icons save_icon"
                  onClick={(e) => this.saveCourse(e)}
                >
                  save
                </span>
                <img className="new_course_img" alt="" />
                <div style={{ fontSize: "x-large", fontWeight: "bold" }}>
                  <input
                    type="text"
                    placeholder="Course Name"
                    name="course_namw"
                    className="modelTitle_edit_input"
                    disabled={this.state.loading}
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
                        onClick={(e) => this.removeSubject(e, j_index)}
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

export default AddCourse;
