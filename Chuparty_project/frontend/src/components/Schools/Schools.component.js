import React, { Component } from "react";
import { css } from "@emotion/core";
import { Container, Row } from "react-bootstrap";
import RotateLoader from "react-spinners/ClipLoader";
import School from "./School.component";

const SCHOOLS_ROUTE =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development"
    ? "http://localhost:8000/api/getSchools"
    : "/api/getSchools";

const override = css`
  display: block;
  margin: 0 auto;
`;

export default class Schools extends Component {
  constructor() {
    super();
    this.state = {
      schools: null,
      activeSchool: null,
      sonComponents: []
    };
  }
  componentDidMount() {
    /* schools should look like the following:
      [
        {"name": "Comp.Sci", "courses": [<COURSE>]}
      ]
    */
    fetch(SCHOOLS_ROUTE)
      .then((res) => {console.log(res); return res.json()})
      .then((data) => {
        console.log(data);
        this.setState({ schools: data });
      })
      .catch((err) => console.error("error while fetching schools:", err));
  }

  SetSonComponents() {
    let sonComponents = [];

    this.state.schools.forEach((elm, index) => {
      let newSchool = (
        <School
          bounce={false}
          school={elm}
          index={index}
          key={index}
          chooseActiveSchool={this.chooseActiveSchool}
          changeSchoolComponent={this.changeSchoolComponent}
        />
      );

      sonComponents.push(newSchool);
    });

    this.setState({ sonComponents: sonComponents });
  }

  getSchoolsArr() {
    return (
      <React.Fragment>
        <div className="page_title"> Courses </div>
        {this.state.activeSchool !== "" && (
          <React.Fragment>
            <div className="active_model_title">
              <span style={{ fontStyle: "italic", fontSize: "x-large" }}>
                Select School:{" "}
              </span>
              <span className="active_model">{this.state.activeSchool}</span>
            </div>
          </React.Fragment>
        )}
        <Container fluid className="model_items_container">
          <span
            className="material-icons add_course_icon"
            onClick={this.addCourse}
          >
            add
            </span>
          <Row>{this.state.sonComponents}</Row>
        </Container>
      </React.Fragment>
    );
  }

  render() {
    let res =
      this.state.schools !== null ? (
        this.getSchoolsArr()
      ) : (
          <div className="col-centered models_loading">
            <div className="loading_title"> Loading Schools... </div>
            <RotateLoader css={override} size={50} />
          </div>
        );
    return res;
  }
}
