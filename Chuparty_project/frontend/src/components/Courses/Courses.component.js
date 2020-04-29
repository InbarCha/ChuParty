import React, { Component } from "react";
import { Container, Row } from "react-bootstrap";
import Course from "./Course.component";
import EditCourse from "./EditCourse.component";

if (!process.env.NODE_ENV || process.env.NODE_ENV === "development")
  console.log("DEV enabled");
const COURSES_ROUTE =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development"
    ? "http://localhost:8000/api/getCourses"
    : "/api/getCourses";

export default class Courses extends Component {
  constructor() {
    super();
    this.state = {
      courses: [],
      activeCourse: localStorage["activeCourse"],
      content: [],
    };
  }
  componentDidMount() {
    // courses should look like the following:
    // [{"OOP": {subjects: ["Object-Oriented Principles"]}}, ...]
    fetch(COURSES_ROUTE)
      .then((res) => res.json())
      .then((data) => {
        this.setState({ courses: data });
        this.setCoursesArr();
      })
      .catch((err) => console.error("error while fetching courses:", err));
  }

  chooseActiveCourse = (courseName) => {
    localStorage["activeCourse"] = courseName;
    this.setState({ activeCourse: courseName });
    this.props.parentClickHandler("EXAMS");
  };

  changeCourseComponent = (index, component) => {
    let content = this.state.content;

    switch (component) {
      case "EDIT":
        content[index] = (
          <EditCourse
            key={index}
            index={index}
            course={this.state.courses[index]}
            changeCourseComponent={this.changeCourseComponent}
          />
        );
        break;
      case "COURSE":
        content[index] = (
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
      default:
        console.log("no handler for:", component);
    }

    this.setState({ content: content });
  };

  setCoursesArr() {
    let content = [];

    this.state.courses.forEach((elm, index) => {
      let newCourse = (
        <Course
          bounce={false}
          course={elm}
          index={index}
          key={index}
          chooseActiveCourse={this.chooseActiveCourse}
          changeCourseComponent={this.changeCourseComponent}
        />
      );

      content.push(newCourse);
    });

    this.setState({ content: content });
    return content;
  }

  render() {
    let res =
      this.state.courses !== null ? (
        <React.Fragment>
          <div className="page_title"> Courses </div>
          {this.state.activeCourse !== "" && (
            <React.Fragment>
              <div className="active_model_title">
                <span style={{ fontStyle: "italic", fontSize: "x-large" }}>
                  Active Course:{" "}
                </span>
                <span className="active_model">{this.state.activeCourse}</span>
              </div>
            </React.Fragment>
          )}
          <Container fluid className="model_items_container">
            <Row>{this.state.content}</Row>
          </Container>
        </React.Fragment>
      ) : (
        <div>
          <span>Loading Courses..</span>
        </div>
      );
    return res;
  }
}
