import React, { Component } from "react";
import { Row, Col } from "react-bootstrap";
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBBtn,
  MDBDropdown,
  MDBDropdownToggle,
  MDBDropdownMenu,
  MDBDropdownItem,
} from "mdbreact";
import Checkbox from "@material-ui/core/Checkbox";
import { css } from "@emotion/core";
import RotateLoader from "react-spinners/ClipLoader";

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

  saveEdit = (e) => {
    e.preventDefault();

    let original_username = localStorage["loggedUsername"];
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
                  <p className="h4 text-center mb-4">Edit Profile</p>
                  <label
                    htmlFor="defaultFormLoginEmailEx"
                    className="grey-text"
                  >
                    Change Your Username
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    defaultValue={this.state.username}
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
                    defaultValue={this.state.first_name}
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
                    defaultValue={this.state.last_name}
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
                    defaultValue={this.state.email}
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
                    <MDBBtn
                      color="indigo"
                      type="submit"
                      onClick={this.toProfile}
                    >
                      Back to Profile
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
    );
  }
}

export default EditProfile;
