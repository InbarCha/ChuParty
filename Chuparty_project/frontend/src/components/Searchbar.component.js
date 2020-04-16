import React, { Component } from 'react';

export default class Home extends Component{
    render(){
        return(
            <div className="title">
                <span>ChuParty</span>
                <div className="search-container">
                    <form action="/action_page.php">
                        <input type="text" placeholder="Search..." name="search"/>
                        <button type="submit"><i className="material-icons">search</i></button>
                    </form>
                </div>
            </div>
        )
    }
}