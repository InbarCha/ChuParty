import React, { Component } from "react";
import { Col } from "react-bootstrap";
import { bounce } from "react-animations";
import styled, { keyframes } from "styled-components";

const Bounce = styled.div`
  animation: 2s ${keyframes`${bounce}`};
`;

export class School extends Component {
  editSchool = (e) => {
    e.stopPropagation();
    this.props.changeSchoolComponent(this.props.index, "EDIT");
  };

  render() {
    let SchoolName = this.props.school.name;
    let newSchool = (
      <div
        className={"model col-centered"}
        onClick={this.props.chooseActiveSchool.bind(this, SchoolName)}
      >
        <div className="model_container">
          <div className="model_name">
            {localStorage["logged_type"] === "Admin" && (
              <span
                className="material-icons settings_icon"
                onClick={(e) => this.editSchool(e)}
              >
                settings
              </span>
            )}
            <img className="school_img" alt="" />
            <div className="course_name_text">{SchoolName}</div>
          </div>
          {SchoolName.length >= 1 && (
            <div className="details_container">
              {this.props.school.courses.map((elm, j_index) => {
                return (
                  <div className="detail_container" key={j_index}>
                    {elm}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
    return (
      <React.Fragment>
        {this.props.bounce && (
          <Col xs={12} sm={12} md={6} lg={6} xl={4}>
            <Bounce className="bounce_div"> {newSchool} </Bounce>
          </Col>
        )}
        {!this.props.bounce && (
          <Col xs={12} sm={12} md={6} lg={6} xl={4}>
            {newSchool}
          </Col>
        )}
      </React.Fragment>
    );
  }
}

export default School;
