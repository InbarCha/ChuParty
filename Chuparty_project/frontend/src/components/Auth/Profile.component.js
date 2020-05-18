import React, { Component } from "react";

export class Profile extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: localStorage["username"],
      first_name: localStorage["logged_first_name"],
      last_name: localStorage["logged_last_name"],
      email: localStorage["logged_email"],
      type: localStorage["logged_type"],
    };
  }

  render() {
    return (
      <div>Hello {this.state.first_name + " " + this.state.last_name}!</div>
    );
  }
}

export default Profile;
