import React, { Component } from "react";
import { css } from "@emotion/core";
import RotateLoader from "react-spinners/ClipLoader";

const REGISTER_ROUTE =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development"
    ? "http://localhost:8000/api/register"
    : "/api/register";

const override = css`
  display: block;
  margin: 0 auto;
`;

export class Register extends Component {
  constructor() {
    super();
    this.state = {
      username: "",
      password: "",
      first_name: "",
      last_name: "",
      email: "",
      isWaiting: false,
    };
  }

  usernameChanged = (e) => {
    let newVal = e.target.value;
    this.setState({ username: newVal });
  };

  passwordChanged = (e) => {
    let newVal = e.target.value;
    this.setState({ password: newVal });
  };

  firstNameChanged = (e) => {
    let newVal = e.target.value;
    this.setState({ first_name: newVal });
  };

  lastNameChanged = (e) => {
    let newVal = e.target.value;
    this.setState({ last_name: newVal });
  };

  emailChanged = (e) => {
    let newVal = e.target.value;
    this.setState({ email: newVal });
  };

  register = (e) => {
    e.preventDefault();
    console.log("login");

    let username = this.state.username;
    let password = this.state.password;
    let first_name = this.state.first_name;
    let last_name = this.state.last_name;
    let email = this.state.email;

    if (
      username !== "" &&
      password !== "" &&
      first_name !== "" &&
      last_name !== ""
    ) {
      let request_body = {
        username: username,
        password: password,
        first_name: first_name,
        last_name: last_name,
        email: email,
      };
      this.setState({ isWaiting: true });

      console.log(request_body);

      fetch(REGISTER_ROUTE, {
        method: "POST",
        body: JSON.stringify(request_body),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          this.setState({ isWaiting: false });

          if (data["isRegistered"] === true) {
            localStorage["loggedUsername"] = data["username"];
            this.props.setLoggedIn(true);
            this.props.parentClickHandler("HOME");
          } else {
            window.alert("Can't Register!");
          }
        })
        .catch((err) => {
          console.error("error while registering:", err);
        });
    } else {
      window.alert(
        "Can't register: 'username' / 'password' / 'first name' / 'last name' are empty!"
      );
    }
  };

  render() {
    return (
      <div>
        <div dir="RTL" className="page_title_unauth">
          ברוכים הבאים לChuparty!{" "}
        </div>
        <hr />
        <form className="form col-centered">
          <label htmlFor="name" className="label-name">
            Username
          </label>
          <input
            type="text"
            id="name"
            name="name"
            maxLength="40"
            className="field field-name"
            onChange={(e) => this.usernameChanged(e)}
          />

          <label htmlFor="email" className="label-password">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            maxLength="40"
            className="field field-password"
            onChange={(e) => this.passwordChanged(e)}
          />
          <label htmlFor="first-name" className="label-first-name">
            First Name
          </label>
          <input
            type="text"
            id="first-name"
            name="first-name"
            maxLength="40"
            className="field field-first-name"
            onChange={(e) => this.firstNameChanged(e)}
          />
          <label htmlFor="last-name" className="label-last-name">
            Last Name
          </label>
          <input
            type="text"
            id="last-name"
            name="last-name"
            maxLength="40"
            className="field field-last-name"
            onChange={(e) => this.lastNameChanged(e)}
          />
          <label htmlFor="email" className="label-email">
            Email
          </label>
          <input
            type="text"
            id="last-email"
            name="email"
            maxLength="40"
            className="field field-email"
            onChange={(e) => this.emailChanged(e)}
          />
          <input
            type="submit"
            value="Register"
            className="button-register"
            onClick={(e) => this.register(e)}
          />
        </form>
        <div className="col-centered model_loading">
          <RotateLoader css={override} loading={this.state.isWaiting} />
        </div>
      </div>
    );
  }
}

export default Register;
