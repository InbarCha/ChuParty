import React, { Component } from "react";
import { Container, Row, Col } from "react-bootstrap";

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

    this.state.courses.forEach((elm, index) => {
      let courseName = Object.keys(elm)[0];
      let newCourse = (
        <Col xs={12} sm={12} md={6} lg={4} xl={3} key={index}>
          <div
            className={"model col-centered"}
            onClick={this.chooseActiveCourse.bind(this, courseName)}
            key={index}
          >
            <div className="model_container">
              <div className="model_name">
                <img className="course_img" alt="" />
                <div style={{ fontSize: "x-large", fontWeight: "bold" }}>
                  {courseName}
                </div>
              </div>
              {elm[courseName]["subjects"].length >= 1 && (
                <div className="details_container">
                  {elm[courseName]["subjects"].map((elm, j_index) => {
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
