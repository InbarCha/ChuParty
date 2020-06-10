import React, { Component } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Searchbar from "./Searchbar.component";
import Sidebar from "./Sidebar.component";
import Schools from "./Schools/Schools.component";
import Courses from "./Courses/Courses.component";
import Exams from "./Exams/Exams.component";
import Statistics from "./Statistics/Statistics.component";
import Test from "./Test.component";
import Admin from "./Admin.component";
import Questions from "./Questions/Questions.component";
import Login from "./Auth/Login.component";
import Register from "./Auth/Register.component";
import Profile from "./Auth/Profile.component";
import NonAuthenticated from "./Auth/NonAuthenticatedcomponent";
import EditProfile from "./Auth/EditProfile.component";
import TestResult from "./TestResult.component";
import CourseHome from "./Courses/CourseHome.component";

const LOGOUT_ROUTE =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development"
    ? "http://localhost:8000/api/logOut"
    : "/api/logOut";
const GET_USER_ROUTE =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development"
    ? "http://localhost:8000/api/getUserByUsername"
    : "/api/getUserByUsername";

export default class Home extends Component {
  _isMounted = false;

  constructor() {
    super();
    this.state = {
      currentPageStatus: "waiting",
      currentCourse: "",
      currentContentView: (
        <NonAuthenticated parentClickHandler={this.onSideBarClick} />
      ),
      searchStr: "",
      isLoggedIn: false,
    };
  }

  componentDidMount() {
    if (
      !localStorage["login_time"] ||
      (localStorage["login_time"] !== undefined &&
        Date.now() - localStorage["login_time"] >= 441764440000)
    ) {
      // 2 weeks
      this.logout();
    } else if (localStorage["login_time"]) {
      // check if user was not deleted
      fetch(GET_USER_ROUTE + `?username=${localStorage["loggedUsername"]}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.Status != "User Exists") this.logout();
          else console.log(data.Status);
        });
    }
    if (
      localStorage["loggedUsername"] !== "" &&
      localStorage["loggedUsername"] !== undefined &&
      localStorage["login_time"]
    ) {
      this.setState({ isLoggedIn: true });
      if (
        localStorage["activeSchool"] !== "" &&
        localStorage["activeSchool"] !== undefined &&
        localStorage["logged_type"] === "Student"
      ) {
        this.setState({
          currentContentView: (
            <Courses
              parentClickHandler={this.onSideBarClick}
              filterBy={this.state.searchStr}
            />
          ),
        });
      } else {
        this.setState({
          currentContentView: (
            <Schools parentClickHandler={this.onSideBarClick} />
          ),
        });
      }
    }
  }

  logout() {
    fetch(LOGOUT_ROUTE)
      .then((res) => res.json())
      .then((data) => {
        if (data["isLoggedOut"] === true) {
          localStorage.removeItem("loggedUsername");
          localStorage.removeItem("logged_first_name");
          localStorage.removeItem("logged_last_name");
          localStorage.removeItem("logged_email");
          localStorage.removeItem("logged_type");
          localStorage.removeItem("logged_courses");
          localStorage.removeItem("logged_schools");
          localStorage.removeItem("activeSchool");
          localStorage.removeItem("activeCourse");
          localStorage.removeItem("activeExamID");
          localStorage.removeItem("email_to_edit_as_admin");
          localStorage.removeItem("editUserAsAdmin");
          localStorage.removeItem("username_to_edit_as_admin");
          localStorage.removeItem("first_name_to_edit_as_admin");
          localStorage.removeItem("last_name_to_edit_as_admin");
          localStorage.removeItem("asAdmin_originalUsername");
          localStorage.removeItem("activeCourseSubjects");
          localStorage.removeItem("activeExamName");
          localStorage.removeItem("activeExamDate");
          localStorage.removeItem("logged_exams_solved");
          localStorage.removeItem("student_success_rates");
          localStorage.removeItem("logged_questions_answered");
          localStorage.removeItem("activeSubmittedItems");
          this.setLoggedIn(false);
          this.onSideBarClick("NON_AUTHENTICATED");
        }
      })
      .catch((err) => console.error("error while logging out:", err));
  }

  onSideBarClick = (clickMsg) => {
    // check if user still exists in the background whenever we navigate
    if (
      clickMsg != "LOGIN" &&
      clickMsg != "REGISTER" &&
      clickMsg != "NON_AUTHENTICATED"
    )
      fetch(GET_USER_ROUTE + `?username=${localStorage["loggedUsername"]}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.Status != "User Exists") this.logout();
          else console.log(data.Status);
        });
    // console.log(clickMsg);
    switch (clickMsg) {
      case "HOME":
        this.setState({
          currentContentView: (
            <Schools parentClickHandler={this.onSideBarClick} />
          ),
        });
        break;
      case "COURSES":
        this.setState({
          currentContentView: (
            <Courses
              parentClickHandler={this.onSideBarClick}
              filterBy={this.state.searchStr}
            />
          ),
        });
        break;
      case "EXAMS":
        this.setState({
          currentContentView: (
            <Exams
              parentClickHandler={this.onSideBarClick}
              filterBy={this.state.searchStr}
            />
          ),
        });
        break;
      case "QUESTIONS":
        this.setState({ currentContentView: <Questions edit={false} /> });
        break;
      case "QUESTIONS_EDIT":
        this.setState({ currentContentView: <Questions edit={true} /> });
        break;
      case "TEST":
        this.setState({ currentContentView: <Test /> });
        break;
      case "STATISTICS":
        this.setState({ currentContentView: <Statistics /> });
        break;
      case "COURSE_HOME":
        this.setState({
          currentContentView: (
            <CourseHome
              parentClickHandler={this.onSideBarClick}
              activeCourse={localStorage.getItem("activeCourse")}
              activeCourseSubjects={localStorage["activeCourseSubjects"]}
            />
          ),
        });
        break;
      case "ADMIN":
        this.setState({
          currentContentView: (
            <Admin
              parentClickHandler={this.onSideBarClick}
              setLoggedIn={this.setLoggedIn}
            />
          ),
        });
        break;
      case "NON_AUTHENTICATED":
        this.setState({
          currentContentView: (
            <NonAuthenticated parentClickHandler={this.onSideBarClick} />
          ),
        });
        break;
      case "REGISTER":
        this.setState({
          currentContentView: (
            <Register
              parentClickHandler={this.onSideBarClick}
              setLoggedIn={this.setLoggedIn}
            />
          ),
        });
        break;
      case "LOGIN":
        this.setState({
          currentContentView: (
            <Login
              parentClickHandler={this.onSideBarClick}
              setLoggedIn={this.setLoggedIn}
              saveExamsSolved={this.saveExamsSolved}
            />
          ),
        });
        break;
      case "PROFILE":
        this.setState({
          currentContentView: (
            <Profile parentClickHandler={this.onSideBarClick} />
          ),
        });
        break;
      case "EDIT_PROFILE":
        if (localStorage["editUserAsAdmin"] === "true") {
          this.setState({
            currentContentView: (
              <EditProfile
                parentClickHandler={this.onSideBarClick}
                asAdmin={true}
                username={localStorage["username_to_edit_as_admin"]}
                first_name={localStorage["first_name_to_edit_as_admin"]}
                last_name={localStorage["last_name_to_edit_as_admin"]}
                email={localStorage["email_to_edit_as_admin"]}
              />
            ),
          });
        } else {
          this.setState({
            currentContentView: (
              <EditProfile parentClickHandler={this.onSideBarClick} />
            ),
          });
        }
        break;
      case "TEST_RESULTS":
        let submittedItems = JSON.parse(localStorage["activeSubmittedItems"]);
        // console.log(submittedItems);

        if (submittedItems !== undefined && submittedItems !== null) {
          this.setState({
            currentContentView: (
              <TestResult items={submittedItems} sendResultsFlg={false} />
            ),
          });
        }
        break;
      default:
      // console.log("no clickMsg handler for:", clickMsg);
    }
  };

  saveExamsSolved = (examsSolved) => {
    this.setState({ examsSolved: examsSolved });
  };

  setLoggedIn = (flg) => {
    this.setState({ isLoggedIn: flg });
  };

  filterBy(str) {
    // console.log(`filtering by ${str}`);
    this.setState({ searchStr: str });
    this.setState({
      currentContentView: React.cloneElement(this.state.currentContentView, {
        filterBy: str,
      }),
    });
  }

  render() {
    return (
      <div className="Home">
        <Router>
          <Switch>
            <Route exact path="/">
              <header>
                <Searchbar
                  filterBy={this.filterBy.bind(this)}
                  parentClickHandler={this.onSideBarClick}
                  setLoggedIn={this.setLoggedIn}
                  isLoggedIn={this.state.isLoggedIn}
                />
              </header>
              {this.state.isLoggedIn && (
                <nav>
                  <Sidebar parentClickHandler={this.onSideBarClick} />
                </nav>
              )}
              <div id="content_container">{this.state.currentContentView}</div>
            </Route>
          </Switch>
        </Router>
      </div>
    );
  }
}
