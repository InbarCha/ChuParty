import React, { Component } from "react";
import { MDBBtn } from "mdbreact";

export class NonAauthenticated extends Component {
  constructor(props) {
    super(props);
    this.toLogin = this.toLogin.bind(this);
  }

  toLogin() {
    this.props.parentClickHandler("LOGIN");
  }

  render() {
    return (
      <div dir="RTL">
        <div className="page_title_unauth">ברוכים הבאים לChuparty! </div>
        <hr />
        <div className="unauth_description">
          המערכת המספקת את היכולת לתרגל את הקורסים שלכם,
          <br />
          ולפתור מבחנים בצורה נוחה
          <br />
          <MDBBtn color="default" type="submit" onClick={this.toLogin}>
            Login
          </MDBBtn>
          <br />
          <img className="chuparty_banner" alt="not found"></img>
        </div>
      </div>
    );
  }
}

export default NonAauthenticated;
