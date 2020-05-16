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
    fetch(LOGOUT_ROUTE)
      .then((res) => res.json())
      .then((data) => {
        if (data["isLoggedOut"] === true) {
          localStorage.removeItem("loggedUsername");
          this.props.setLoggedIn(false);
          this.props.parentClickHandler("NON_AUTHENTICATED");
        }
      })
      .catch((err) => console.error("error while logging out:", err));
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
