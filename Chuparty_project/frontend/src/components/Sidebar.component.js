import React, { Component } from 'react';

export default class Home extends Component{
    render(){
        return(
            <div className="sidebar">
                <div className='side_item'>
                    <i class="material-icons">home</i>
                    <span>Home</span>
                </div>
                <div className='side_item'>
                    <i class="material-icons">school</i>
                    <span>Courses</span>
                </div>
                <div className='side_item'>
                    <i class="material-icons">web</i>
                    <span>Exam</span>
                </div>
                <div className='side_item'>
                    <i class="material-icons">message</i>
                    <span>Feedback</span>
                </div>
                <div className='side_item'>
                    <i class="material-icons">widgets</i>
                    <span>Admin</span>
                </div>
            </div>
        )
    }
}