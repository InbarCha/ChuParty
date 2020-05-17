import React, { Component } from "react";
import { css } from "@emotion/core";
import RotateLoader from "react-spinners/ClipLoader";
import { Container, Row, Col } from "react-bootstrap";
import { MDBContainer, MDBRow, MDBCol, MDBBtn } from "mdbreact";

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

  //TODO: when registering, set whether the new user is student, lecturer or admin. Then create a user in the matching model
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

  toLogin = () => {
    this.props.parentClickHandler("LOGIN");
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
            lg={{ span: 4, offset: 4 }}
            md={{ span: 6, offset: 3 }}
            sm={{ span: 8, offset: 2 }}
            className="login_wrapper"
          >
            <MDBContainer>
              <MDBRow>
                <MDBCol className="col col-cen">
                  <form className="login_form">
                    <p className="h4 text-center mb-4">Register</p>
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
                    />{" "}
                    <br />
                    <label
                      htmlFor="defaultFormLoginEmailEx"
                      className="grey-text"
                    >
                      Your First Name
                    </label>
                    <input
                      type="text"
                      id="defaultFormLoginEmailEx"
                      className="form-control"
                      onChange={this.firstNameChanged}
                    />
                    <br />
                    <label
                      htmlFor="defaultFormLoginEmailEx"
                      className="grey-text"
                    >
                      Your Last Name
                    </label>
                    <input
                      type="text"
                      id="defaultFormLoginEmailEx"
                      className="form-control"
                      onChange={this.lastNameChanged}
                    />
                    <br />
                    <label
                      htmlFor="defaultFormLoginEmailEx"
                      className="grey-text"
                    >
                      Email
                    </label>
                    <input
                      type="text"
                      id="defaultFormLoginEmailEx"
                      className="form-control"
                      onChange={this.emailChanged}
                    />
                    <div className="text-center mt-4">
                      <MDBBtn
                        color="indigo"
                        type="submit"
                        onClick={this.register}
                      >
                        Register
                      </MDBBtn>
                      <MDBBtn
                        color="indigo"
                        type="submit"
                        onClick={this.toLogin}
                      >
                        Back to Login
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
        <div className="col-centered model_loading">
          <RotateLoader css={override} loading={this.state.isWaiting} />
        </div>
      </div>
    );
  }
}

export default Register;
