import React, { Component } from "react";
import { MDBContainer, MDBRow, MDBCol, MDBBadge } from "mdbreact";
import { Row, Col } from "react-bootstrap";

export class Profile extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: localStorage["loggedUsername"],
      first_name: localStorage["logged_first_name"],
      last_name: localStorage["logged_last_name"],
      email: localStorage["logged_email"],
      type: localStorage["logged_type"],
    };
  }

  render() {
    return (
      <div>
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
                    <h1>
                      <MDBBadge color="primary">Profile</MDBBadge>
                    </h1>
                    <br />
                    <h5>
                      <MDBBadge color="info">Your Username</MDBBadge>
                    </h5>
                    <label
                      htmlFor="defaultFormLoginEmailEx"
                      className="grey-text"
                    >
                      {this.state.username}
                    </label>
                    <br />
                    <h5>
                      <MDBBadge color="info">Your First Name</MDBBadge>
                    </h5>
                    <label
                      htmlFor="defaultFormLoginPasswordEx"
                      className="grey-text"
                    >
                      {this.state.first_name}
                    </label>
                    <br />
                    <h5>
                      <MDBBadge color="info">Your Last Name</MDBBadge>
                    </h5>
                    <label
                      htmlFor="defaultFormLoginPasswordEx"
                      className="grey-text"
                    >
                      {this.state.last_name}
                    </label>
                    <br />
                    <h5>
                      <MDBBadge color="info">Your Email</MDBBadge>
                    </h5>
                    <label
                      htmlFor="defaultFormLoginPasswordEx"
                      className="grey-text"
                    >
                      {this.state.email}
                    </label>
                    <br />
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

export default Profile;
