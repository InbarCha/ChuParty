import React, { Component } from "react";
import { css } from "@emotion/core";
import RotateLoader from "react-spinners/ClipLoader";
import { Row, Col } from "react-bootstrap";
import { MDBContainer, MDBRow, MDBCol, MDBBtn } from "mdbreact";
import Checkbox from "@material-ui/core/Checkbox";

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
      checkedStudent: false,
      checkedLecturer: false,
      checkedAdmin: false,
      usernameWarning: "",
      passwordWarning: "",
      firstNameWarning: "",
      lastNameWarning: "",
      emailWarning: "",
      registerWarning: "",
    };
  }

  usernameChanged = (e) => {
    let newVal = e.target.value;
    this.setState({
      username: newVal,
      usernameWarning: "",
      registerWarning: "",
    });
  };

  passwordChanged = (e) => {
    let newVal = e.target.value;
    this.setState({
      password: newVal,
      passwordWarning: "",
      registerWarning: "",
    });
  };

  firstNameChanged = (e) => {
    let newVal = e.target.value;
    this.setState({
      first_name: newVal,
      firstNameWarning: "",
      registerWarning: "",
    });
  };

  lastNameChanged = (e) => {
    let newVal = e.target.value;
    this.setState({
      last_name: newVal,
      lastNameWarning: "",
      registerWarning: "",
    });
  };

  emailChanged = (e) => {
    let newVal = e.target.value;
    this.setState({ email: newVal, emailWarning: "", registerWarning: "" });
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

    if (username === "") {
      this.setState({ usernameWarning: "'Username' field is empty!" });
    }
    if (password === "") {
      this.setState({ passwordWarning: "'Password' field is empty!" });
    }
    if (first_name === "") {
      this.setState({ firstNameWarning: "'First Name' field is empty!" });
    }
    if (last_name === "") {
      this.setState({ lastNameWarning: "'LastName' field is empty!" });
    }
    if (email === "") {
      this.setState({ emailWarning: "'email' field is empty!" });
    }

    let type = "";
    if (this.state.checkedStudent) {
      type = "Student";
    } else if (this.state.checkedLecturer) {
      type = "Lecturer";
    } else if (this.state.checkedAdmin) {
      type = "Admin";
    } else {
      this.setState({ registerWarning: "You didn't choose account type!" });
    }

    if (
      username !== "" &&
      password !== "" &&
      first_name !== "" &&
      last_name !== "" &&
      email !== "" &&
      type !== ""
    ) {
      this.setState({ registerWarning: "" });
      let request_body = {
        username: username,
        password: password,
        first_name: first_name,
        last_name: last_name,
        email: email,
        type: type,
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
            this.setState({ registerWarning: data["reason"] });
          }
        })
        .catch((err) => {
          console.error("error while registering:", err);
        });
    }
  };

  toLogin = () => {
    this.props.parentClickHandler("LOGIN");
  };

  handleCheckboxChange = (e, index) => {
    if (index === 1) {
      this.setState({
        checkedStudent: !this.state.checkedStudent,
        checkedAdmin: false,
        checkedLecturer: false,
      });
    } else if (index === 2) {
      this.setState({
        checkedLecturer: !this.state.checkedLecturer,
        checkedStudent: false,
        checkedAdmin: false,
      });
    } else if (index === 3) {
      this.setState({
        checkedAdmin: !this.state.checkedAdmin,
        checkedStudent: false,
        checkedLecturer: false,
      });
    }
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
                    <p className="h4 text-center mb-4">Register</p>
                    <label
                      htmlFor="defaultFormLoginEmailEx"
                      className="grey-text"
                    >
                      Your Username
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      onChange={this.usernameChanged}
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
                    />
                    <label style={{ color: "red" }}>
                      {this.state.passwordWarning}
                    </label>
                    <br />
                    <label
                      htmlFor="defaultFormLoginEmailEx"
                      className="grey-text"
                    >
                      Your First Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      onChange={this.firstNameChanged}
                    />
                    <label style={{ color: "red" }}>
                      {this.state.firstNameWarning}
                    </label>
                    <br />
                    <label
                      htmlFor="defaultFormLoginEmailEx"
                      className="grey-text"
                    >
                      Your Last Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      onChange={this.lastNameChanged}
                    />
                    <label style={{ color: "red" }}>
                      {this.state.lastNameWarning}
                    </label>
                    <br />
                    <label
                      htmlFor="defaultFormLoginEmailEx"
                      className="grey-text"
                    >
                      Email
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      onChange={this.emailChanged}
                    />
                    <label style={{ color: "red" }}>
                      {this.state.emailWarning}
                    </label>
                    <br />
                    <label className="grey-text" style={{ fontWeight: "bold" }}>
                      Please Choose Type:
                    </label>
                    <br />
                    <Checkbox
                      checked={this.state.checkedStudent}
                      onChange={(e) => this.handleCheckboxChange(e, 1)}
                      inputProps={{ "aria-label": "primary checkbox" }}
                    />
                    <label className="grey-text">Student</label>
                    <br />
                    <Checkbox
                      checked={this.state.checkedLecturer}
                      onChange={(e) => this.handleCheckboxChange(e, 2)}
                      inputProps={{ "aria-label": "primary checkbox" }}
                    />
                    <label className="grey-text">Lecturer</label>
                    <br />
                    <Checkbox
                      checked={this.state.checkedAdmin}
                      onChange={(e) => this.handleCheckboxChange(e, 3)}
                      inputProps={{ "aria-label": "primary checkbox" }}
                    />
                    <label className="grey-text">Admin</label>
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
                    <label style={{ color: "red" }}>
                      {this.state.registerWarning}
                    </label>
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
