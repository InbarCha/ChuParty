import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Main from './Main.component'
import Sidebar from './Sidebar.component'
import Searchbar from './Searchbar.component'

export default class Home extends Component{
    render(){
        return(
            <div className="Home">
                <header className="Home-header">
                    <Searchbar/>
                </header>
                <nav>
                    <Sidebar/>
                </nav>
                <div id="content_container">
                    <Router>
                        <Switch>
                            <Route exact path='/'>
                                {/* TODO: check if user is logged in*/}
                                <Main/>
                            </Route>
                            <Route path='/login'>
                                <span>We are at login</span>
                            </Route>
                            <Route path='/signup'>
                                <span>We are at signup</span>
                            </Route>
                            <Route path='/profile'>
                                <span>We are at profile</span>
                            </Route>
                        </Switch>
                    </Router>
                </div>
            </div>
        )
    }
}