import React, { Component } from "react";
import { css } from "@emotion/core";
import RotateLoader from "react-spinners/ClipLoader";

const LOGIN_ROUTE =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development"
    ? "http://localhost:8000/api/logIn"
    : "/api/logIn";

const override = css`
  display: block;
  margin: 0 auto;
`;

export class Login extends Component {
  constructor() {
    super();
    this.state = {
      username: "",
      password: "",
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

  login = (e) => {
    e.preventDefault();
    console.log("login");

    let username = this.state.username;
    let password = this.state.password;

    if (username !== "" && password !== "") {
      let request_body = { username: username, password: password };
      this.setState({ isWaiting: true });

      fetch(LOGIN_ROUTE, {
        method: "post",
        body: JSON.stringify(request_body),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          this.setState({ isWaiting: false });

          if (data["isLoggedIn"] === true) {
            localStorage["loggedUsername"] = data["username"];
            this.props.setLoggedIn(true);
            this.props.parentClickHandler("HOME");
          } else {
            window.alert(
              "Can't log in! 'username' or 'password' are incorrect"
            );
          }
        })
        .catch((err) => {
          console.error("error while logging in:", err);
        });
    } else {
      window.alert("Can't login, 'username' or 'password' are empty!");
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

          <label htmlFor="email" className="label-email">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            maxLength="40"
            className="field field-email"
            onChange={(e) => this.passwordChanged(e)}
          />

          <input
            type="submit"
            value="Login"
            className="button"
            onClick={(e) => this.login(e)}
          />
        </form>
        <div className="col-centered model_loading">
          <RotateLoader css={override} loading={this.state.isWaiting} />
        </div>
      </div>
    );
  }
}

export default Login;
