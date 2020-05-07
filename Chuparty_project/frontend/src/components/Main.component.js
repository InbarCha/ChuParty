import React, { Component } from "react";
const SCHOOLS_ROUTE =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development"
    ? "http://localhost:8000/api/getSchools"
    : "/api/getSchools";

export default class Main extends Component {
  _isMounted = false;

  constructor() {
    super();
    this.state = {
      schools: null,
    };
  }
  componentDidMount() {
    this._isMounted = true;
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
      .then((res) => {
        if (this._isMounted) {
          res.json();
        }
      })
      .then((data) => {
        if (this._isMounted) {
          console.log(data);
          this.setState({ schools: data });
        }
      })
      .catch((err) => console.error("error while fetching schools:", err));
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  getSchoolsArr() {
    return <div>loaded :)</div>;
  }
  render() {
    let res =
      this.state.schools !== null ? (
        this.getSchoolsArr()
      ) : (
        <div>
          <span>Loading Schools..</span>
        </div>
      );
    return res;
  }
}
