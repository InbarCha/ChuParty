import React, { Component } from 'react';
const COURSES_ROUTE = '/api/getCourses';

export default class Courses extends Component {
    constructor() {
        super();
        this.state = {
            courses: null
        }
    }
    componentDidMount() {
        // course should look like the following:
        // name: "OOP"
        // subjects: Array(1)
        // 0: {name: "Object-Oriented Principles"}
        fetch(COURSES_ROUTE)
            .then(res => res.json())
            .then(data => { console.log(data); this.setState({ courses: data }) })
            .catch(err => console.error("error while fetching courses:", err));
    }
    getCoursesArr() {
        return this.state.courses.map((elm, index) => {
            return (
                <div key={index} className={"course"}>
                    <span>{elm.name}:</span>
                    <div className="subjects_container">
                        {elm.subjects.map((sub, j_index) => {
                            return (
                                <div key={j_index} className={"course_subject"}>
                                    {sub.name}
                                </div>
                            )
                        })}
                    </div>
                </div>
            )
        });
    }
    render() {
        let res = (this.state.courses !== null) ? this.getCoursesArr() : <div><span>Loading Courses..</span></div>;
        return (res)
    }
}