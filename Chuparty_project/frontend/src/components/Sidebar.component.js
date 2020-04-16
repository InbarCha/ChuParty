import React, { Component } from 'react';

export default class Home extends Component {
    constructor(props){
        super(props);
        this.state = {
            parentClickHandler : props.parentClickHandler
        }
    }
    render() {
        return (
            <div className="sidebar">
                <div className='side_item' onClick={(e) => this.state.parentClickHandler("HOME") }>
                    <i className="material-icons">home</i>
                </div>
                <div className='side_description'>
                    <span>Home</span>
                </div>

                <div className='side_item' onClick={(e) => this.state.parentClickHandler("COURSES") }>
                    <i className="material-icons">school</i>
                </div>
                <div className='side_description'>
                    <span>Courses</span>
                </div>

                <div className='side_item' onClick={(e) => this.state.parentClickHandler("EXAM") }>
                    <i className="material-icons">web</i>
                </div>
                <div className='side_description'>
                    <span>Exam</span>
                </div>

                <div className='side_item' onClick={(e) => this.state.parentClickHandler("FEEDBACK") }>
                    <i className="material-icons">message</i>
                </div>
                <div className='side_description'>
                    <span>Feedback</span>
                </div>

                <div className='side_item' onClick={(e) => this.state.parentClickHandler("ADMIN") }>
                    <i className="material-icons">widgets</i>
                </div>
                <div className='side_description'>
                    <span>Admin</span>
                </div>
            </div>
        )
    }
}