import React, { Component } from "react";
import { css } from "@emotion/core";
import RotateLoader from "react-spinners/ClipLoader";
import { Row, Col } from "react-bootstrap";
import { MDBContainer, MDBRow, MDBCol, MDBBtn } from "mdbreact";
import "mdbreact/dist/css/mdb.css";
import nacl from "tweetnacl";
import utils from "tweetnacl-util";

const encodeBase64 = utils.encodeBase64;

// Our nonce must be a 24 bytes Buffer (or Uint8Array)
const nonce = nacl.randomBytes(24);
// Our secret key must be a 32 bytes Buffer (or Uint8Array)
const secretKey = Buffer.from("12345678123456781234567812345678", "utf8");

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
      this.setState({ usernameWarning: "'Username' field is empty!" });
    }
    if (password === "") {
      this.setState({ passwordWarning: "'Password' field is empty!" });
    }

    if (username !== "" && password !== "") {
      // Make sure your data is also a Buffer of Uint8Array
      const secretData = Buffer.from(password, "utf8");
      const encrypted = nacl.secretbox(secretData, nonce, secretKey);
      const passwordEncrypted = `${encodeBase64(nonce)}:${encodeBase64(
        encrypted
      )}`;
      console.log(passwordEncrypted);

      let request_body = {
        username: username,
        password: passwordEncrypted,
      };
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
            localStorage["logged_first_name"] = data["first_name"];
            localStorage["logged_last_name"] = data["last_name"];
            localStorage["logged_email"] = data["email"];
            localStorage["logged_type"] = data["type"];
            localStorage["logged_courses"] = data["courses"];
            localStorage["logged_schools"] = data["schools"];
            if (data["schools"] !== undefined) {
              localStorage["activeSchool"] = data["schools"][0];
            }
            if (data["examsSolved"] !== "None") {
              localStorage["logged_exams_solved"] = JSON.stringify(
                data["examsSolved"]
              );
            }
            if (data["questionsAnswered"] !== "None") {
              localStorage["logged_questions_answered"] = JSON.stringify(
                data["questionsAnswered"]
              );
            }

            this.props.setLoggedIn(true);

            if (
              localStorage["activeSchool"] !== "" &&
              localStorage["activeSchool"] !== undefined &&
              localStorage["logged_type"] === "Student"
            ) {
              this.props.parentClickHandler("COURSES");
            } else {
              this.props.parentClickHandler("HOME");
            }
          } else {
            this.setState({
              loginWarning: "'Username' or 'Password' are incorrect!",
            });
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
          ברוכים הבאים לChuParty!{" "}
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
                      disabled={this.state.isWaiting}
                    />
                    <label style={{ color: "red" }}>
                      {this.state.usernameWarning}
                    </label>
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
                      disabled={this.state.isWaiting}
                    />
                    <label style={{ color: "red" }}>
                      {this.state.passwordWarning}
                    </label>
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
                      <label style={{ color: "red" }}>
                        {this.state.loginWarning}
                      </label>
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
