import React, { Component } from "react";

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
          <span
            className="material-icons login_icon_unauth"
            onClick={this.toLogin}
          >
            input
          </span>
          <br />
          <img className="chuparty_banner"></img>
        </div>
      </div>
    );
  }
}

export default NonAauthenticated;
