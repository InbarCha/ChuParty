import React, { Component } from "react";
import { Col } from "react-bootstrap";

export class Course extends Component {
  render() {
    let courseName = Object.keys(this.props.course)[0];

    return (
      <Col xs={12} sm={12} md={6} lg={4} xl={3}>
        <div
          className={"model col-centered"}
          onClick={this.props.chooseActiveCourse.bind(this, courseName)}
        >
          <div className="model_container">
            <div className="model_name">
              <img className="course_img" alt="" />
              <div style={{ fontSize: "x-large", fontWeight: "bold" }}>
                {courseName}
              </div>
            </div>
            {this.props.course[courseName]["subjects"].length >= 1 && (
              <div className="details_container">
                {this.props.course[courseName]["subjects"].map(
                  (elm, j_index) => {
                    return (
                      <div className="detail_container" key={j_index}>
                        {elm}
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>
        </div>
      </Col>
    );
  }
}

export default Course;
