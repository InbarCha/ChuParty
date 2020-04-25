import React, { Component } from "react";
import { Container, Row, Col } from "react-bootstrap";
import uuid from "react-uuid";

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
    };
  }
  componentDidMount() {
    // courses should look like the following:
    // [{"OOP": {subjects: ["Object-Oriented Principles"]}}, ...]
    fetch(COURSES_ROUTE)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        this.setState({ courses: data });
      })
      .catch((err) => console.error("error while fetching courses:", err));
  }

  chooseActiveCourse = (courseName) => {
    localStorage["activeCourse"] = courseName;
    this.setState({ activeCourse: courseName });
    this.props.parentClickHandler("EXAM");
  };

  getCoursesArr() {
    let content = [];
    let columns = [];

    this.state.courses.map((elm, index) => {
      let courseName = Object.keys(elm)[0];
      let newCourse = (
        <Col md={4} lg={3} key={index}>
          <div
            className={"course col-centered"}
            onClick={this.chooseActiveCourse.bind(this, courseName)}
            key={index}
          >
            <div className="subject_name"> {courseName} </div>
            {elm[courseName]["subjects"].length >= 1 && (
              <div className="subjects_container">
                {elm[courseName]["subjects"].map((elm, j_index) => {
                  return (
                    <div className="subject_container" key={j_index}>
                      {elm}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Col>
      );

      content.push(newCourse);
    });

    return content;
  }

  render() {
    let res =
      this.state.courses !== null ? (
        <React.Fragment>
          {this.state.activeCourse !== "" && (
            <React.Fragment>
              <div className="active_model_title">Active Course:</div>
              <div className="active_model"> {this.state.activeCourse} </div>
            </React.Fragment>
          )}
          <Container fluid>
            <Row>{this.getCoursesArr()}</Row>
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
