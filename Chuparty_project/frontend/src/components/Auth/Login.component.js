import React, { Component } from "react";
import { css } from "@emotion/core";
import RotateLoader from "react-spinners/ClipLoader";
import { Container, Row, Col } from "react-bootstrap";
import { MDBContainer, MDBRow, MDBCol, MDBBtn } from "mdbreact";
import "mdbreact/dist/css/mdb.css";

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
      usernameWarning: "",
      passwordWarning: "",
      loginWarning: "",
    };
  }

  usernameChanged = (e) => {
    let newVal = e.target.value;
    this.setState({ username: newVal, usernameWarning: "", loginWarning: "" });
  };

  passwordChanged = (e) => {
    let newVal = e.target.value;
    this.setState({ password: newVal, passwordWarning: "", loginWarning: "" });
  };

  login = (e) => {
    e.preventDefault();
    console.log("login");

    let username = this.state.username;
    let password = this.state.password;

    if (username === "") {
      this.setState({ usernameWarning: "שדה 'שם המשתמש' ריק" });
    }
    if (password === "") {
      this.setState({ passwordWarning: "שדה 'סיסמא' ריק" });
    }

    if (username !== "" && password !== "") {
      let request_body = { username: username, password: password };
      this.setState({ isWaiting: true });

      fetch(LOGIN_ROUTE, {
        method: "POST",
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
            this.setState({ loginWarning: "'שם המשתמש' או 'סיסמא' לא נכונים" });
          }
        })
        .catch((err) => {
          console.error("error while logging in:", err);
        });
    }
  };

  register = (e) => {
    this.props.parentClickHandler("REGISTER");
  };

  render() {
    return (
      <div>
        <div dir="RTL" className="page_title_unauth">
          ברוכים הבאים לChuparty!{" "}
        </div>
        <hr />
        <Row>
          <Col
            xl={{ span: 4, offset: 4 }}
            lg={{ span: 6, offset: 3 }}
            md={{ span: 6, offset: 3 }}
            sm={{ span: 8, offset: 2 }}
            className="login_wrapper"
          >
            <MDBContainer>
              <MDBRow>
                <MDBCol className="col col-cen">
                  <form className="login_form">
                    <p className="h4 text-center mb-4">Sign in</p>
                    <label
                      htmlFor="defaultFormLoginEmailEx"
                      className="grey-text"
                    >
                      Your Username
                    </label>
                    <input
                      type="text"
                      id="defaultFormLoginEmailEx"
                      className="form-control"
                      onChange={this.usernameChanged}
                    />
                    <br />
                    <label
                      htmlFor="defaultFormLoginPasswordEx"
                      className="grey-text"
                    >
                      Your password
                    </label>
                    <input
                      type="password"
                      id="defaultFormLoginPasswordEx"
                      className="form-control"
                      onChange={this.passwordChanged}
                    />
                    <div className="text-center mt-4">
                      <MDBBtn color="indigo" type="submit" onClick={this.login}>
                        Login
                      </MDBBtn>
                      <MDBBtn
                        color="indigo"
                        type="submit"
                        onClick={this.register}
                      >
                        No Account? Register!
                      </MDBBtn>
                    </div>
                    <div className="col-centered model_loading">
                      <RotateLoader
                        css={override}
                        loading={this.state.isWaiting}
                      />
                    </div>
                    <img className="login_img" alt="not found" />
                  </form>
                </MDBCol>
              </MDBRow>
            </MDBContainer>
          </Col>
        </Row>
      </div>
    );
  }
}

export default Login;
