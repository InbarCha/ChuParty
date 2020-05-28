import React, { Component } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Searchbar from "./Searchbar.component";
import Sidebar from "./Sidebar.component";
import Schools from "./Schools/Schools.component";
import Courses from "./Courses/Courses.component";
import Exams from "./Exams/Exams.component";
import Feedback from "./Feedback.component";
import Test from "./Test.component";
import Admin from "./Admin.component";
import Questions from "./Questions/Questions.component";
import Login from "./Auth/Login.component";
import Register from "./Auth/Register.component";
import Profile from "./Auth/Profile.component";
import NonAuthenticated from "./Auth/NonAuthenticatedcomponent";
import EditProfile from "./Auth/EditProfile.component";
import LecturerQuestionsPage from "./Questions/LecturerQuestionsPage.component";

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
      localStorage["loggedUsername"] !== "" &&
      localStorage["loggedUsername"] !== undefined
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

  onSideBarClick = (clickMsg) => {
    console.log(clickMsg);
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
            <Exams parentClickHandler={this.onSideBarClick} />
          ),
        });
        break;
      case "QUESTIONS":
        this.setState({ currentContentView: <Questions edit={false} /> });
        break;
      case "LECTURER_QUESTIONS_PAGE":
        this.setState({
          currentContentView: (
            <LecturerQuestionsPage parentClickHandler={this.onSideBarClick} />
          ),
        });
        break;
      case "QUESTIONS_EDIT":
        this.setState({ currentContentView: <Questions edit={true} /> });
        break;
      case "TEST":
        this.setState({ currentContentView: <Test /> });
        break;
      case "FEEDBACK":
        this.setState({ currentContentView: <Feedback /> });
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
      default:
        console.log("no clickMsg handler for:", clickMsg);
    }
  };

  setLoggedIn = (flg) => {
    this.setState({ isLoggedIn: flg });
  };

  filterBy(str) {
    console.log(`filtering by ${str}`);
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
