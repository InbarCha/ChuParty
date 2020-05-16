import React, { Component } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Searchbar from "./Searchbar.component";
import Sidebar from "./Sidebar.component";
import Schools from "./Schools/Schools.component";
import Courses from "./Courses/Courses.component";
import Exams from "./Exams/Exams.component";
import Feedback from "./Feedback.component";
import Admin from "./Admin.component";
import Questions from "./Questions/Questions.component";
import Login from "./Auth/Login.component";
import Register from "./Auth/Register.component";
import Profile from "./Auth/Profile.component";
import NonAuthenticated from "./Auth/NonAuthenticatedcomponent";

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
      this.setState({ isLoggedIn: true, currentContentView: <Schools /> });
    }
  }

  onSideBarClick = (clickMsg) => {
    console.log(clickMsg);
    switch (clickMsg) {
      case "HOME":
        this.setState({ currentContentView: <Schools /> });
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
      case "QUESTIONS_EDIT":
        this.setState({ currentContentView: <Questions edit={true} /> });
        break;
      case "FEEDBACK":
        this.setState({ currentContentView: <Feedback /> });
        break;
      case "ADMIN":
        this.setState({ currentContentView: <Admin /> });
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
        this.setState({ currentContentView: <Profile /> });
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
