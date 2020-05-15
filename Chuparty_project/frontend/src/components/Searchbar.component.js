import React, { Component } from "react";
import Logo from "./../assets/logo.png";
export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchInput: "",
    };
  }
  submitSearch(e) {
    this.props.filterBy(this.state.searchInput);
  }

  updateSearchInput(e) {
    this.setState({ searchInput: e.target.value });
    this.props.filterBy(e.target.value);
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
        <span class="material-icons account_icon">account_circle</span>
      </div>
    );
  }
}
