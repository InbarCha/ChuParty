import React, { Component } from "react";
import Logo from "./../assets/logo.png";
export default class Home extends Component {
  render() {
    return (
      <div className="title">
        <img src={Logo} alt="logo" />
        <span>ChuParty</span>
        <div className="search-container">
          <form action="/action_page.php">
            <input type="text" placeholder="Search..." name="search" />
            <button type="submit">
              <i className="material-icons">search</i>
            </button>
          </form>
        </div>
      </div>
    );
  }
}
