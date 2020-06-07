import React, { Component } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { css } from "@emotion/core";
import {
  MDBBtn,
  MDBDropdown,
  MDBDropdownToggle,
  MDBDropdownMenu,
  MDBDropdownItem,
} from "mdbreact";
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
const EDIT_STUDENT_ROUTE =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development"
    ? "http://localhost:8000/api/editStudent"
    : "/api/editStudent";
const EDIT_LECTURER_ROUTE =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development"
    ? "http://localhost:8000/api/editLecturer"
    : "/api/editLecturer";

const override = css`
  display: block;
  margin: 0 auto;
`;
const override1 = css`
  display: block;
  float: left;
`;

export default class Courses extends Component {
  constructor(props) {
    super(props);
    this.state = {
      all_courses: [],
      courses: null,
      courses_copy: null,
      activeCourse: localStorage["activeCourse"],
      activeSchool: localStorage["activeSchool"],
      sonComponents: [],
      loading: true,
      isSavingCourses: false,
      checkV: false,
      searchStr: props.filterBy || "",
    };
  }

  componentDidMount() {
    // courses should look like the following:
    // [{"OOP": {subjects: ["Object-Oriented Principles"]}}, ...]
    fetch(COURSES_ROUTE_FROM_SCHOOL + this.state.activeSchool)
      .then((res) => res.json())
      .then((data) => {
        if (localStorage["logged_type"] === "Admin") {
          let courses = data;
          this.setState({
            courses: courses,
          });
          this.SetSonComponents();
        } else {
          console.log(data);
          console.log(localStorage["logged_courses"]);
          let all_courses = data;
          let courses = [
            ...all_courses.filter(
              (course) =>
                localStorage["logged_courses"].indexOf(Object.keys(course)[0]) >
                -1
            ),
          ];
          let courses_copy = [
            ...all_courses.filter(
              (course) =>
                localStorage["logged_courses"].indexOf(Object.keys(course)[0]) >
                -1
            ),
          ];
          console.log(courses);
          this.setState({
            all_courses: data,
            courses: courses,
            courses_copy: courses_copy,
          });
          this.SetSonComponents();
        }
      })
      .catch((err) => console.error("error while fetching courses:", err));
  }

  componentDidUpdate(prevProps, prevState) {
    console.log("new props filter:", this.props.filterBy);
    if (this.props.filterBy !== this.state.searchStr) {
      console.log(`searching for ${this.props.filterBy}`);
      this.setState({ searchStr: this.props.filterBy.toLowerCase() });
    }
    if (prevState.searchStr !== this.state.searchStr) this.SetSonComponents();
  }

  deleteFromMyCourses = async (e, index) => {
    this.setState({ checkV: false });
    let courseName = Object.keys(this.state.courses[index])[0];
    let courses = this.state.courses;
    // let local_courses = localStorage["logged_courses"].split(",");
    // localStorage["logged_courses"] = [
    //   ...local_courses.filter((elm, index) => elm !== courseName),
    // ];
    // console.log(local_courses);
    await this.setState({
      courses: [
        ...courses.filter((course) => Object.keys(course)[0] !== courseName),
      ],
      checkV: false,
    });

    this.SetSonComponents();
  };

  chooseActiveCourse = (courseName, courseSubjects) => {
    localStorage["activeCourse"] = courseName;
    localStorage["activeCourseSubjects"] = courseSubjects;
    this.setState({ activeCourse: courseName });

    if (localStorage["logged_type"] === "Student") {
      this.props.parentClickHandler("COURSE_HOME");
    } else {
      this.props.parentClickHandler("EXAMS");
    }
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
    this.setState({ checkV: false });
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
            deleteFromMyCourses={this.deleteFromMyCourses}
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
      console.log(this.state.searchStr);
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
              deleteFromMyCourses={this.deleteFromMyCourses}
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
    this.setState({ checkV: false });
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
    let all_courses = this.state.all_courses;
    this.setState({
      checkV: false,
      courses: [...courses, course],
      all_courses: [...all_courses, course],
      sonComponents: sonComponents,
    });

    this.SetSonComponents();
  };

  addCourse = () => {
    this.changeCourseComponent(-1, "ADD_COURSE");
  };

  showDropdown = () => {
    this.setState({ showDropdownCourses: !this.state.showDropdownCourses });
  };

  async addToMyCourses(e, course) {
    let courses = this.state.courses;
    await this.setState({ courses: [...courses, course], checkV: false });
    this.SetSonComponents();
  }

  // {
  //     "username":"inbarcha",
  //     "changeSchool": "Computer Science"
  //     "changeRelevantCourses": [ "Computer Networks", ...]
  // }
  saveChangesInMyCourses = (e) => {
    if (!this.state.isSavingCourses) {
      let logged_courses = localStorage["logged_courses"].split(",");
      let courses = this.state.courses;
      let courses_copy_final = courses.map((elm, index) =>
        this.createDeepCopyCourse(elm)
      );
      let courses_copy = this.state.courses_copy.map((elm, index) =>
        this.createDeepCopyCourse(elm)
      );
      let courses_names = courses.map((course) => {
        return Object.keys(course)[0];
      });
      let courses_names_copy = courses_copy.map((course) => {
        return Object.keys(course)[0];
      });

      console.log(courses_names_copy);
      console.log(courses_names);
      //fiter out from logged courses every course which exists in courses_copy but not in courses
      logged_courses = logged_courses.filter(
        (elm) =>
          !(
            courses_names_copy.indexOf(elm) >= 0 &&
            courses_names.indexOf(elm) < 0
          )
      );

      if (courses_names.length === 0) {
        logged_courses = logged_courses.filter(
          (elm, index) => !(courses_names_copy.indexOf(elm) >= 0)
        );
      }

      if (logged_courses.length > 0) {
        courses_names = [
          ...courses_names,
          ...logged_courses.filter(
            (elm, index) => courses_names.indexOf(elm) < 0 && elm !== ""
          ),
        ];
        console.log(courses_names);
      }

      let request_body = { username: localStorage["loggedUsername"] };

      if (localStorage["logged_type"] === "Student") {
        request_body["changeRelevantCourses"] = courses_names;
        this.setState({ isSavingCourses: true });

        fetch(EDIT_STUDENT_ROUTE, {
          method: "POST",
          body: JSON.stringify(request_body),
        })
          .then((res) => res.json())
          .then((data) => {
            console.log(data);
            if (data["Changed Courses"] === "True") {
              this.setState({
                isSavingCourses: false,
                checkV: true,
                courses_copy: courses_copy_final,
              });
              localStorage["logged_courses"] = courses_names;
            }
          })
          .catch((err) => {
            this.setState({ isSavingCourses: false });
            console.error("error while saving changes to my courses:", err);
          });
      } else if (localStorage["logged_type"] === "Lecturer") {
        request_body["changeCoursesTeaching"] = courses_names;
        this.setState({ isSavingCourses: true });

        fetch(EDIT_LECTURER_ROUTE, {
          method: "POST",
          body: JSON.stringify(request_body),
        })
          .then((res) => res.json())
          .then((data) => {
            console.log(data);
            if (data["Changed Courses"] === "True") {
              this.setState({
                isSavingCourses: false,
                checkV: true,
                courses_copy: courses_copy_final,
              });
              localStorage["logged_courses"] = courses_names;
            }
          })
          .catch((err) => {
            this.setState({ isSavingCourses: false });
            console.error("error while saving changes to my courses:", err);
          });
      }
    }
  };

  arraysEqual(_arr1, _arr2) {
    if (
      !Array.isArray(_arr1) ||
      !Array.isArray(_arr2) ||
      _arr1.length !== _arr2.length
    )
      return false;

    var arr1 = _arr1.concat().sort();
    var arr2 = _arr2.concat().sort();

    for (var i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) return false;
    }

    return true;
  }

  render() {
    let res =
      this.state.courses !== null ? (
        <div dir="RTL">
          <div className="page_title"> קורסים </div>
          {this.state.activeCourse !== "" &&
            this.state.activeCourse !== undefined && (
              <React.Fragment>
                <div className="active_model_title" dir="RTL">
                  <span style={{ fontStyle: "italic", fontSize: "x-large" }}>
                    בית ספר פעיל:{" "}
                  </span>
                  <span className="active_model">
                    {this.state.activeSchool}
                  </span>
                </div>
                <div className="active_model_title" dir="RTL">
                  <span style={{ fontStyle: "italic", fontSize: "x-large" }}>
                    קורס פעיל:{" "}
                  </span>
                  <span className="active_model">
                    {this.state.activeCourse}
                  </span>
                </div>
              </React.Fragment>
            )}
          <Container fluid className="model_items_container">
            {(localStorage["logged_type"] === "Admin" ||
              localStorage["logged_type"] === "Lecturer") && (
              <span
                className="material-icons add_course_icon"
                onClick={this.addCourse}
              >
                add
              </span>
            )}
            {localStorage["logged_type"] !== "Admin" &&
              !this.arraysEqual(
                this.state.courses.map((elm) => Object.keys(elm)[0]),
                this.state.courses_copy.map((elm) => Object.keys(elm)[0])
              ) && (
                <React.Fragment>
                  <span
                    className="material-icons save_icon"
                    style={{ cursor: "pointer" }}
                    onClick={(e) => this.saveChangesInMyCourses(e)}
                  >
                    save
                  </span>
                  <RotateLoader
                    css={override1}
                    size={20}
                    loading={this.state.isSavingCourses}
                  />
                </React.Fragment>
              )}
            {this.state.checkV && (
              <span className="material-icons save_icon">check</span>
            )}
            <Row className="narrow_row">
              <Col className="text-center">
                {localStorage["logged_type"] !== "Admin" &&
                  this.state.all_courses.filter(
                    (course) =>
                      this.state.courses
                        .map((innerCourse) => Object.keys(innerCourse)[0])
                        .indexOf(Object.keys(course)[0]) < 0
                  ).length > 0 && (
                    <MDBDropdown>
                      <MDBDropdownToggle caret color="info">
                        {"הוסף לקורסים שלך "}
                      </MDBDropdownToggle>
                      <MDBDropdownMenu basic>
                        {this.state.all_courses
                          .filter(
                            (course) => this.state.courses.indexOf(course) < 0
                          )
                          .map((course, index) => {
                            return (
                              <MDBDropdownItem
                                key={index}
                                onClick={(e) => this.addToMyCourses(e, course)}
                              >
                                {Object.keys(course)[0]}
                              </MDBDropdownItem>
                            );
                          })}
                      </MDBDropdownMenu>
                    </MDBDropdown>
                  )}
              </Col>
            </Row>
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
