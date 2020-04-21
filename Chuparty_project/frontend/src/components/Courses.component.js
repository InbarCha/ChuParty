import React, { Component } from 'react';
if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') console.log("DEV enabled");
const COURSES_ROUTE = (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') ?
    'http://localhost:8000/api/getCourses' : '/api/getCourses';

export default class Courses extends Component {
    constructor() {
        super();
        this.state = {
            courses: null
        }
    }
    componentDidMount() {
        // courses should look like the following:
        // [{"OOP": {subjects: ["Object-Oriented Principles"]}}, ...]
        fetch(COURSES_ROUTE)
            .then(res => res.json())
            .then(data => { console.log(data); this.setState({ courses: data }) })
            .catch(err => console.error("error while fetching courses:", err));
    }
    getCoursesArr() {
        return (this.state.courses.map((elm, index) => {
            let k = Object.keys(elm)[0];
            return <div key={index} className={"course"}>{k}
                <div className="subjects_container">
                    {elm[k]["subjects"].map((elm, j_index)=>{
                        return <div key={j_index}>{elm}</div>
                    })}
                </div>
            </div>
        }))
    }
    render() {
        let res = (this.state.courses !== null) ? this.getCoursesArr() : <div><span>Loading Courses..</span></div>;
        return (res)
    }
}