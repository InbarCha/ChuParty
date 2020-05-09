import React, { Component } from "react";
import { css } from "@emotion/core";
import RotateLoader from "react-spinners/ClipLoader";

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
    };
  }
  componentDidMount() {
    /* schools should look like the following:
        //
        { 
            "name": "Computer Science",
            "courses": [
                {
                "name": "Computer Networks",
                "subjects": [
                    {
                        "name": "HTTP"
                    },
                    {
                        "name": "UDP"
                    },
                    {
                        "name": "DNS"
                    }
                ]
                }
            ]
        }
        */
    fetch(SCHOOLS_ROUTE)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        this.setState({ schools: data });
      })
      .catch((err) => console.error("error while fetching schools:", err));
  }

  getSchoolsArr() {
    return <div>loaded :)</div>;
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
