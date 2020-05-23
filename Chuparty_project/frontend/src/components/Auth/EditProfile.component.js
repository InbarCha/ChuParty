import React, { Component } from "react";
import { Row, Col } from "react-bootstrap";
import { MDBContainer, MDBRow, MDBCol, MDBBtn } from "mdbreact";
import Checkbox from "@material-ui/core/Checkbox";
import { css } from "@emotion/core";
import RotateLoader from "react-spinners/ClipLoader";

const EDIT_USER_ROUTE =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development"
    ? "http://localhost:8000/api/editUser"
    : "/api/editUser";

const override = css`
  display: block;
  margin: 0 auto;
`;

export class EditProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: localStorage["loggedUsername"],
      password: "",
      first_name: localStorage["logged_first_name"],
      last_name: localStorage["logged_last_name"],
      email: localStorage["logged_email"],
      isWaiting: false,
      checkedStudent: false,
      checkedLecturer: false,
      checkedAdmin: false,
      usernameWarning: "",
      passwordWarning: "",
      firstNameWarning: "",
      lastNameWarning: "",
      emailWarning: "",
      schoolWarning: "",
      registerWarning: "",
      schools: [],
      userSchool: "",
    };
  }

  componentDidMount() {
    console.log(this.props.asAdmin);
    if (this.props.asAdmin) {
      this.setState({
        username: this.props.username,
        first_name: this.props.first_name,
        last_name: this.props.last_name,
        email: this.props.email,
      });
    }
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

  toProfile = () => {
    this.props.parentClickHandler("PROFILE");
  };

  toAdminConsole = () => {
    localStorage.removeItem("email_to_edit_as_admin");
    localStorage.removeItem("editUserAsAdmin");
    localStorage.removeItem("username_to_edit_as_admin");
    localStorage.removeItem("first_name_to_edit_as_admin");
    localStorage.removeItem("last_name_to_edit_as_admin");
    localStorage.removeItem("asAdmin_originalUsername");
    this.props.parentClickHandler("ADMIN");
  };

  saveEdit = (e) => {
    e.preventDefault();

    let original_username = "";
    if (!this.props.asAdmin) {
      original_username = localStorage["loggedUsername"];
    } else {
      original_username = localStorage["asAdmin_originalUsername"];
    }
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

    if (
      username !== "" &&
      password !== "" &&
      first_name !== "" &&
      last_name !== "" &&
      email !== ""
    ) {
      this.setState({ registerWarning: "" });

      // {
      //   "username": "david",
      //   "change_username": "davidsh",
      //   "change_password": "12345678",
      //   "change_first_name": "david",
      //   "change_last_name": "shaulov",
      //   "change_email": "david@gmail.com".
      // }
      let request_body = {
        username: original_username,
        change_username: username,
        change_password: password,
        change_first_name: first_name,
        change_last_name: last_name,
        change_email: email,
      };
      this.setState({ isWaiting: true });

      console.log(request_body);

      //fetch
      fetch(EDIT_USER_ROUTE, {
        method: "POST",
        body: JSON.stringify(request_body),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          this.setState({ isWaiting: false });

          if (data["Changed Username"] === "True" && !this.props.asAdmin) {
            localStorage["loggedUsername"] = username;
          }
          if (data["Changed First Name"] === "True" && !this.props.asAdmin) {
            localStorage["logged_first_name"] = first_name;
          }
          if (data["Changed Last Name"] === "True" && !this.props.asAdmin) {
            localStorage["logged_last_name"] = last_name;
          }
          if (data["Changed First Name"] === "True" && !this.props.asAdmin) {
            localStorage["logged_email"] = email;
          }

          if (!this.props.asAdmin) {
            this.props.parentClickHandler("PROFILE");
          } else {
            this.toAdminConsole();
          }
        })
        .catch((err) => {
          console.error("error while registering:", err);
        });
    }
  };

  render() {
    return (
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
                  {!this.props.asAdmin && (
                    <p className="h4 text-center mb-4">Edit Profile</p>
                  )}
                  {this.props.asAdmin && (
                    <p className="h4 text-center mb-4">Edit User as Admin</p>
                  )}
                  <label
                    htmlFor="defaultFormLoginEmailEx"
                    className="grey-text"
                  >
                    Change Your Username
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={this.state.username}
                    disabled={this.state.isWaiting}
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
                    Change Your password
                  </label>
                  <input
                    type="password"
                    id="defaultFormLoginPasswordEx"
                    className="form-control"
                    disabled={this.state.isWaiting}
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
                    Change Your First Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    disabled={this.state.isWaiting}
                    value={this.state.first_name}
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
                    Change Your Last Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    disabled={this.state.isWaiting}
                    value={this.state.last_name}
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
                    Change Your Email
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    disabled={this.state.isWaiting}
                    value={this.state.email}
                    onChange={this.emailChanged}
                  />
                  <label style={{ color: "red" }}>
                    {this.state.emailWarning}
                  </label>
                  <br />
                  {this.state.userSchool && (
                    <label className="user_school_label">
                      {this.state.userSchool}
                    </label>
                  )}
                  <div className="text-center mt-4">
                    <MDBBtn
                      color="indigo"
                      type="submit"
                      onClick={this.saveEdit}
                    >
                      Save Edit
                    </MDBBtn>
                    {!this.props.asAdmin && (
                      <MDBBtn
                        color="indigo"
                        type="submit"
                        onClick={this.toProfile}
                      >
                        Back to Profile
                      </MDBBtn>
                    )}
                    {this.props.asAdmin && (
                      <MDBBtn
                        color="indigo"
                        type="submit"
                        onClick={this.toAdminConsole}
                      >
                        Back to Admin Console
                      </MDBBtn>
                    )}
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
    );
  }
}

export default EditProfile;
