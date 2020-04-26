import React, { Component } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Searchbar from "./Searchbar.component";
import Sidebar from "./Sidebar.component";
import Main from "./Main.component";
import Courses from "./Courses/Courses.component";
import Exams from "./Exams/Exams.component";
import Feedback from "./Feedback.component";
import Admin from "./Admin.component";
import Questions from "./Questions/Questions.component";

export default class Home extends Component {
  constructor() {
    super();
    this.state = {
      currentPageStatus: "waiting",
      currentCourse: "",
      currentContentView: <Main />,
    };
  }
  onSideBarClick = (clickMsg) => {
    console.log(clickMsg);
    switch (clickMsg) {
      case "HOME":
        this.setState({ currentContentView: <Main /> });
        break;
      case "COURSES":
        this.setState({
          currentContentView: (
            <Courses parentClickHandler={this.onSideBarClick} />
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
        this.setState({ currentContentView: <Questions /> });
        break;
      case "FEEDBACK":
        this.setState({ currentContentView: <Feedback /> });
        break;
      case "ADMIN":
        this.setState({ currentContentView: <Admin /> });
        break;
      default:
        console.log("no clickMsg handler for:", clickMsg);
    }
  };

  render() {
    return (
      <div className="Home">
        <Router>
          <Switch>
            <Route exact path="/">
              <header>
                <Searchbar />
              </header>
              <nav>
                <Sidebar parentClickHandler={this.onSideBarClick} />
              </nav>
              {/* TODO: check if user is logged in*/}
              <div id="content_container">{this.state.currentContentView}</div>
            </Route>
            <Route path="/login">
              <span>We are at login</span>
            </Route>
            <Route path="/signup">
              <span>We are at signup</span>
            </Route>
            <Route path="/profile">
              <span>We are at profile</span>
            </Route>
          </Switch>
        </Router>
      </div>
    );
  }
}
