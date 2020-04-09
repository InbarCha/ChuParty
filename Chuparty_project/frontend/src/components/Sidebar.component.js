import React, { Component } from 'react';

export default class Home extends Component{
    render(){
        return(
            <div className="sidebar">
                <div className='side_item'>
                    <span>Home</span>
                </div>
                <div className='side_item'>
                    <span>Courses</span>
                </div>
                <div className='side_item'>
                    <span>Exam</span>
                </div>
                <div className='side_item'>
                    <span>Feedback</span>
                </div>
                <div className='side_item'>
                    <span>Admin</span>
                </div>
            </div>
        )
    }
}