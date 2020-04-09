import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Main from './Main.component'

export default class Home extends Component{
    render(){
        return(
            <div className="Home">
                <header className="Home-header">
                    <h1>ChuParty</h1>
                </header>
                <Router>
                    <Switch>
                        <Route exact path='/'>
                            {/* TODO: check if user is logged in*/}
                            <Main/>
                        </Route>
                        <Route path='/login'>
                            <h1>We are at login</h1>
                        </Route>
                        <Route path='/signup'>
                            <h1>We are at signup</h1>
                        </Route>
                        <Route path='/profile'>
                            <h1>We are at profile</h1>
                        </Route>
                    </Switch>
                </Router>
            </div>
        )
    }
}