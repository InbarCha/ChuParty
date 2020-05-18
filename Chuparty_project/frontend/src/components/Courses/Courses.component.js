import React, { Component } from "react";
import { Container, Row } from "react-bootstrap";
import { css } from "@emotion/core";
import RotateLoader from "react-spinners/ClipLoader";
import Course from "./Course.component";
import EditCourse from "./EditCourse.component";
import AddCourse from "./AddCourse.component";

if (!process.env.NODE_ENV || process.env.NODE_ENV === "development")
  console.log("DEV enabled");
const COURSES_ROUTE =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development"
    ? "http://localhost:8000/api/getCourses"
    : "/api/getCourses";
const COURSES_ROUTE_FROM_SCHOOL =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development"
    ? "http://localhost:8000/api/getCoursesFromSchool?school="
    : "/api/getCoursesFromSchool?school=";

const override = css`
  display: block;
  margin: 0 auto;
`;

export default class Courses extends Component {
  constructor(props) {
    super(props);
    this.state = {
      courses: null,
      activeCourse: localStorage["activeCourse"],
      activeSchool: localStorage["activeSchool"],
      sonComponents: [],
      loading: true,
      searchStr: props.filterBy || "",
    };
  }

  componentDidMount() {
    // courses should look like the following:
    // [{"OOP": {subjects: ["Object-Oriented Principles"]}}, ...]
    fetch(COURSES_ROUTE_FROM_SCHOOL + this.state.activeSchool)
      .then((res) => res.json())
      .then((data) => {
        this.setState({ courses: data });
        this.SetSonComponents();
      })
      .catch((err) => console.error("error while fetching courses:", err));
  }

  componentDidUpdate(prevProps) {
    console.log("new props filter:", this.props.filterBy);
    if (this.props.filterBy !== this.state.searchStr) {
      console.log(`searching for ${this.props.filterBy}`);
      this.setState({ searchStr: this.props.filterBy.toLowerCase() });
      this.SetSonComponents();
    }
  }

  chooseActiveCourse = (courseName) => {
    localStorage["activeCourse"] = courseName;
    this.setState({ activeCourse: courseName });
    this.props.parentClickHandler("EXAMS");
  };

  changedCourse = (course, index) => {
    let courses = this.state.courses;
    courses[index] = course;

    if (Object.keys(course)[0] !== this.state.activeCourse) {
      localStorage["activeCourse"] = Object.keys(course)[0];
      this.setState({ activeCourse: localStorage["activeCourse"] });
    }

    this.setState({ courses: courses });
  };

  createDeepCopyCourse = (course) => {
    let courseName = Object.keys(course)[0];
    let subjects = course[courseName]["subjects"];

    let course_copy = {};
    course_copy[courseName] = {};
    course_copy[courseName]["subjects"] = [...subjects];

    return course_copy;
  };

  changeCourseComponent = (index, component) => {
    let sonComponents = this.state.sonComponents;
    let course_orig = "";
    let course_copy = "";
    if (index !== -1) {
      course_orig = this.state.courses[index];
      course_copy = this.createDeepCopyCourse(course_orig);
    }

    switch (component) {
      case "EDIT":
        sonComponents[index] = (
          <EditCourse
            key={index}
            index={index}
            course={course_copy}
            course_orig={course_orig}
            changeCourseComponent={this.changeCourseComponent}
            changedCourse={this.changedCourse}
            deleteFromSonComponents={this.deleteFromSonComponents}
          />
        );
        break;
      case "COURSE":
        sonComponents[index] = (
          <Course
            bounce={true}
            key={index}
            index={index}
            chooseActiveCourse={this.chooseActiveCourse}
            changeCourseComponent={this.changeCourseComponent}
            course={this.state.courses[index]}
          />
        );
        break;
      case "ADD_COURSE":
        sonComponents = [
          ...sonComponents,
          <AddCourse
            key={sonComponents.length}
            index={sonComponents.length}
            deleteFromSonComponents={this.deleteFromSonComponents}
            addCourseToSonComponents={this.addCourseToSonComponents}
          />,
        ];
        break;
      default:
        console.log("no handler for:", component);
    }

    this.setState({ sonComponents: sonComponents });
  };

  SetSonComponents() {
    if (this.state.courses !== null) {
      let courses = this.state.courses;
      let sonComponents = [];
      if (this.state.searchStr !== "")
        courses = courses.filter(
          (
            e // filter by course name OR subject name
          ) =>
            Object.keys(e)[0].toLowerCase().indexOf(this.state.searchStr) !==
              -1 ||
            e[Object.keys(e)[0]]["subjects"].find(
              (e) => e.toLowerCase().indexOf(this.state.searchStr) !== -1
            )
        );
      courses.forEach((elm, index) => {
        let newCourse = "";
        if (elm !== null && elm !== undefined && elm !== "") {
          console.log(elm);
          newCourse = (
            <Course
              bounce={false}
              course={elm}
              index={index}
              key={index}
              chooseActiveCourse={this.chooseActiveCourse}
              changeCourseComponent={this.changeCourseComponent}
            />
          );
        }
        sonComponents.push(newCourse);
      });
      this.setState({ sonComponents: sonComponents });
    }
  }

  deleteFromSonComponents = (index) => {
    let courses = this.state.courses;
    let sonComponents = this.state.sonComponents;

    console.log(sonComponents.length - 1);
    console.log(index);

    if (index < sonComponents.length - 1) {
      courses[index] = "";
      sonComponents[index] = "";
    } else if (index === sonComponents.length - 1) {
      sonComponents.pop();
      courses.pop();
    }

    this.setState({ courses: courses, sonComponents: sonComponents });
  };

  addCourseToSonComponents = (course) => {
    let sonComponents = this.state.sonComponents;
    sonComponents.pop();

    let courses = this.state.courses;
    this.setState({
      courses: [...courses, course],
      sonComponents: sonComponents,
    });

    this.SetSonComponents();
  };

  addCourse = () => {
    this.changeCourseComponent(-1, "ADD_COURSE");
  };

  render() {
    let res =
      this.state.courses !== null ? (
        <div dir="RTL">
          <div className="page_title"> קורסים </div>
          {this.state.activeCourse !== "" && (
            <React.Fragment>
              <div className="active_model_title" dir="RTL">
                <span style={{ fontStyle: "italic", fontSize: "x-large" }}>
                  בית ספר פעיל:{" "}
                </span>
                <span className="active_model">{this.state.activeSchool}</span>
              </div>
              <div className="active_model_title" dir="RTL">
                <span style={{ fontStyle: "italic", fontSize: "x-large" }}>
                  קורס פעיל:{" "}
                </span>
                <span className="active_model">{this.state.activeCourse}</span>
              </div>
            </React.Fragment>
          )}
          <Container fluid className="model_items_container">
            <span
              className="material-icons add_course_icon"
              onClick={this.addCourse}
            >
              add
            </span>
            <Row>{this.state.sonComponents}</Row>
          </Container>
        </div>
      ) : (
        <div className="col-centered models_loading" dir="RTL">
          <div className="loading_title"> טוען קורסים... </div>
          <RotateLoader css={override} size={50} />
        </div>
      );
    return res;
  }
}
