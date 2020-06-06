import React, { Component } from 'react';
import RotateLoader from "react-spinners/ClipLoader";
import { css } from "@emotion/core";
import Checkbox from "@material-ui/core/Checkbox";

const GENERATE_EXAM_ROUTE = !process.env.NODE_ENV || process.env.NODE_ENV === "development"
    ? "http://localhost:8000/api/generateExam"
    : "/api/generateExam";

const override = css`
  display: block;
  margin: 0 auto;
`;

export default class CourseHome extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            activeCourse: props.activeCourse,
            activeCourseSubjects: props.activeCourseSubjects.split(','),
            filteredSubjects: props.activeCourseSubjects.split(','), // after componentDidMount: [subjectName, isChecked]
            exam: null
        }
    }

    componentDidMount() {
        const subjects = this.state.filteredSubjects.map(e => [e, true]); // [subjectName, isChecked]
        this.setState({ filteredSubjects: subjects, loading: false });
    }

    generateExam = () => {
        let request_body = {
            course: this.state.activeCourse,
            subjects: this.state.filteredSubjects.filter(e => e[1]).map(e => e[0]),
            numberOfQuestions: 12, //TODO: maybe users should tell us how many questions they want to answer?
            username: localStorage["loggedUsername"]
        };
        console.log(request_body);
        if (request_body.subjects.length < 1)
            return alert("No subjects selected");
        this.setState({ loading: true });
        fetch(GENERATE_EXAM_ROUTE, {
            method: "post",
            body: JSON.stringify(request_body),
        })
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                this.setState({ loading: false });
                if (data["Status"] === "Generated an Exam") {
                    let exam = data["Generated Exam"];
                    let activeExamID = Object.keys(exam)[0];
                    localStorage["activeExamID"] = activeExamID;
                    localStorage["activeExamName"] = exam[activeExamID]["name"];
                    localStorage["activeExamDate"] = exam[activeExamID]["date"];
                    this.props.parentClickHandler("TEST");
                } else {
                    window.alert("Can't generate an exam");
                }
            })
            .catch((err) => {
                console.error("error while editing exam:", err);
                this.setState({ loading: false });
            });
    };

    handleCheckboxChange = (index) => {
        let subjects = this.state.filteredSubjects;
        subjects[index][1] = !subjects[index][1];
        this.setState({ filteredSubjects: subjects });
    }

    allAreChecked = () => {
        return this.state.filteredSubjects.filter(e => e[1]).length === this.state.filteredSubjects.length;
    }

    handleCheckAllChange = (event) => {
        const check = !this.allAreChecked();
        let subjects = this.state.filteredSubjects;
        for (let sub of subjects)
            sub[1] = check;
        this.setState({ filteredSubjects: subjects });
    }
    goToStats = (event) => {
        this.props.parentClickHandler("STATISTICS");
    }

    render() {
        return !this.state.loading ? (
            <div id="courseHomeGrid">
                <div id="gridHeader">
                    <h2>{this.state.activeCourse}</h2>
                    <hr />
                    <br />
                </div>
                <div className="gridCol" style={{ gridColumnStart: "2" }}>
                    <h3>סטטיסטיקה אישית</h3>
                    <hr />
                    <br />
                    <br />
                    <p style={{ marginBottom: "30%" }}>
                        כאן נקבל סטטיסטיקה אישית עבור קורס {this.state.activeCourse}.
                        <br />
                        מומלץ לעבור על הסטטיסטיקה האישית כל כמה מבחנים,
                        <br />
                        כך נוכל לסנן נושאים הקלים לנו ולתעדף שאלות בנושאים אותם נרצה לחזק.
                        <br />
                        <br />
                        בכל מקרה המבחן נוצר באופן שמותאם אישית לרמתך.
                        <br />
                        שליטה על נושאי המבחן היא רק עוד דרך לשיפור תהליך הלמידה,
                        <br />
                        והסטטיסטיקה האישית תמיד תוכל לעזור לנו לבחור נושאים מתאימים.
                        <br />
                    </p>
                    <span className="btn" onClick={this.goToStats}>עבור לסטטיסטיקה</span>
                </div>
                <div className="gridCol">
                    <h3>קבל מבחן חדש</h3>
                    <hr />
                    <br />
                    <br />
                    <p style={{ marginBottom: "30%" }}>
                        בלחיצה על התחל מבחן נוצר במיוחד עבורך מבחן בנושא {this.state.activeCourse}.
                        <br />
                        המבחן מורכב רק משאלות בנושאים אותם בחרת
                        <br />
                        כך שמתאפשר לתרגל לפי נושאים ולתחזק את רמתך.
                        <br />
                        <br />
                        המבחן נוצר באופן שמותאם אישית לרמתך
                        <br />
                        כך שככל שנתמיד לתרגל נבטיח ציונים טובים יותר.
                        <br />
                        <br />
                    </p>
                    <span className="btn" onClick={this.generateExam}>התחל מבחן</span>
                </div>
                <div className="subjectsChecklist">
                    <h3>:רשימת הנושאים</h3>
                    <div>
                        <p id="selectAll">בחר הכל</p>
                        <Checkbox className="chBox"
                            checked={this.allAreChecked()}
                            onChange={this.handleCheckAllChange}
                            inputProps={{ "aria-label": "primary checkbox" }}
                        />
                    </div>
                    {this.state.activeCourseSubjects.map((sub, i) =>
                        <div key={i} onClick={this.handleCheckboxChange.bind(this, i)} className="sub">
                            <label>{sub}</label>
                            <Checkbox className="chBox" key={i}
                                checked={this.state.filteredSubjects[i][1]}
                                inputProps={{ "aria-label": "primary checkbox" }}
                            />
                        </div>
                    )}
                </div>
            </div>
        )
            : (
                <div className="col-centered models_loading" dir="RTL">
                    <div className="loading_title"> טוען... </div>
                    <RotateLoader css={override} size={50} />
                </div>
            )
    }
}