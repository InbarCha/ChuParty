import React, { Component } from "react";
import Logo from "./../assets/logo.png";

const LOGOUT_ROUTE =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development"
    ? "http://localhost:8000/api/logOut"
    : "/api/logOut";

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchInput: "",
    };

    this.logout = this.logout.bind(this);
    this.toProfile = this.toProfile.bind(this);
  }
  submitSearch(e) {
    this.props.filterBy(this.state.searchInput);
  }

  updateSearchInput(e) {
    this.setState({ searchInput: e.target.value });
    this.props.filterBy(e.target.value);
  }

  logout() {
    if (window.confirm("Are you sure you want to logout?")) {
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
            localStorage.removeItem("login_time");
            this.props.setLoggedIn(false);
            this.props.parentClickHandler("NON_AUTHENTICATED");
          }
        })
        .catch((err) => console.error("error while logging out:", err));
    }
  }

  toProfile() {
    this.props.parentClickHandler("PROFILE");
  }

  render() {
    return (
      <div className="title">
        <img src={Logo} alt="logo" />
        <span>ChuParty</span>
        <div className="search-container">
          <div id="searchBtnContainer">
            <input
              type="text"
              placeholder="Search..."
              onChange={this.updateSearchInput.bind(this)}
            />
            <button onClick={this.submitSearch.bind(this)}>
              <i className="material-icons">search</i>
            </button>
          </div>
        </div>
        {this.props.isLoggedIn && (
          <React.Fragment>
            <span
              className="material-icons account_icon"
              onClick={this.toProfile}
            >
              account_circle
            </span>
            <span
              className="material-icons account_icon_leave"
              onClick={this.logout}
            >
              exit_to_app
            </span>
          </React.Fragment>
        )}
      </div>
    );
  }
}
