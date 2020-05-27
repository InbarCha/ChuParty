import React, { Component } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { MDBTable, MDBTableBody, MDBTableHead, MDBBadge } from "mdbreact";
import { css } from "@emotion/core";
import RotateLoader from "react-spinners/ClipLoader";

const USERS_ROUTE =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development"
    ? "http://localhost:8000/api/getAllUsers"
    : "/api/getAllUsers";
const DELETE_USER =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development"
    ? "http://localhost:8000/api/deleteUser?username="
    : "/api/deleteUser?username=";
const LOGOUT_ROUTE =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development"
    ? "http://localhost:8000/api/logOut"
    : "/api/logOut";

const override = css`
  display: block;
  margin: 0 auto;
`;

export default class Admin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      users: null,
    };
  }

  componentDidMount() {
    this.setState({ loading: true });
    fetch(USERS_ROUTE)
      .then((res) => {
        console.log(res);
        return res.json();
      })
      .then((data) => {
        this.setState({ loading: false });
        this.setState({ users: data });
      })
      .catch((err) => {
        console.error("error while fetching schools:", err);
        this.setState({ loading: false });
      });
  }

  editUser = (e, index) => {
    let user = this.state.users[index];

    localStorage["editUserAsAdmin"] = true;
    localStorage["asAdmin_originalUsername"] = user["username"];
    localStorage["username_to_edit_as_admin"] = user["username"];
    localStorage["first_name_to_edit_as_admin"] = user["first_name"];
    localStorage["last_name_to_edit_as_admin"] = user["last_name"];
    localStorage["email_to_edit_as_admin"] = user["email"];

    this.props.parentClickHandler("EDIT_PROFILE");
  };

  deleteUser = (e, index) => {
    let users = this.state.users;
    let user = users[index];
    let username = user["username"];

    if (
      window.confirm(
        "Are you sure you want to delete '" + user["username"] + "'?"
      )
    ) {
      this.setState({ loading: true });
      fetch(DELETE_USER + username)
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          this.setState({
            users: [...users.filter((user) => user["username"] !== username)],
          });

          if (username === localStorage["loggedUsername"]) {
            //logout - deleted user is the logged-in user
            fetch(LOGOUT_ROUTE)
              .then((res) => res.json())
              .then((data) => {
                if (data["isLoggedOut"] === true) {
                  this.setState({ loading: false });
                  localStorage.removeItem("loggedUsername");
                  localStorage.removeItem("logged_first_name");
                  localStorage.removeItem("logged_last_name");
                  localStorage.removeItem("logged_email");
                  localStorage.removeItem("logged_type");
                  localStorage.removeItem("logged_courses");
                  localStorage.removeItem("activeSchool");
                  localStorage.removeItem("activeCourse");
                  localStorage.removeItem("activeExamID");
                  localStorage.removeItem("email_to_edit_as_admin");
                  localStorage.removeItem("editUserAsAdmin");
                  localStorage.removeItem("username_to_edit_as_admin");
                  localStorage.removeItem("first_name_to_edit_as_admin");
                  localStorage.removeItem("last_name_to_edit_as_admin");
                  localStorage.removeItem("asAdmin_originalUsername");
                  localStorage.removeItem("logged_schools");
                  this.props.setLoggedIn(false);
                  this.props.parentClickHandler("NON_AUTHENTICATED");
                }
              })
              .catch((err) => {
                console.error("error while logging out:", err);
                this.setState({ loading: false });
              });
          } else {
            this.setState({ loading: false });
          }
        })
        .catch((err) => {
          console.error("error while fetching courses:", err);
          this.setState({ loading: false });
        });
    }
  };

  render() {
    let res =
      this.state.users === null ? (
        <div className="col-centered model_loading">
          <div className="loading_title"> Loading Users... </div>
          <RotateLoader css={override} loading={this.state.loading} size={50} />
        </div>
      ) : (
        <div>
          <Container fluid className="model_items_container">
            <Row>
              <Col className="text-center">
                <h1>
                  <MDBBadge color="info">Users</MDBBadge>
                </h1>
                <RotateLoader
                  className="users_rotate_loader"
                  css={override}
                  loading={this.state.loading}
                  size={50}
                />
              </Col>
            </Row>
            <Row>
              <Col className="text-center">
                <MDBTable className="admin_table">
                  <MDBTableHead color="info-color" textWhite>
                    <tr>
                      <th>UserID</th>
                      <th>First Name</th>
                      <th>Last Name</th>
                      <th>Email</th>
                      <th>School</th>
                      <th>Permissions</th>
                      <th>Edit</th>
                      <th>Delete</th>
                    </tr>
                  </MDBTableHead>
                  <MDBTableBody>
                    {this.state.users.map((user, index) => {
                      return (
                        <tr key={index}>
                          <td>{user["username"]}</td>
                          <td>{user["first_name"]}</td>
                          <td>{user["last_name"]}</td>
                          <td>{user["email"]}</td>
                          <td>
                            {!Array.isArray(user["school"]) && user["school"]}
                            {Array.isArray(user["school"]) &&
                              user["school"].map((elm) => <div>{elm}</div>)}
                          </td>
                          <td>{user["permissions"]}</td>
                          <td>
                            <span
                              className="material-icons"
                              style={{ cursor: "pointer" }}
                              onClick={(e) => this.editUser(e, index)}
                            >
                              settings
                            </span>
                          </td>
                          <td>
                            <span
                              className="material-icons remove_icon"
                              onClick={(e) => this.deleteUser(e, index)}
                            >
                              remove_circle_outline
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </MDBTableBody>
                </MDBTable>
              </Col>
            </Row>
          </Container>
        </div>
      );
    return res;
  }
}
