import React, { Component } from 'react'
import axios from "axios";
import { Link, Redirect } from 'react-router-dom';
import ReactLoading from '../common/Loading';
import { ToastContainer, ToastStore } from 'react-toasts';
import { Button, Label } from 'reactstrap';

export default class ForgotPassword extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,            
            isLoading: false
        };   
        this.onSignup = this.onSignup.bind(this);             
    }

    renderRedirect() {
        if (this.state.redirect) {
            return <Redirect push to='/' />
        }
    }

    onSignup(event){
        event.preventDefault();
        const formElements = event.target.elements;        
        const firstName = formElements["firstName"].value;
        const emailId = formElements["emailid"].value;
        const password = formElements["password"].value;
        const confirmPassword = formElements["confirmPassword"].value;
        const signupData = {
            firstName,
            emailId,
            password,
            confirmPassword
        }
        //console.log(signupData);
    }

    render() {
        return (
            <div className="card bg-light">
                {this.renderRedirect()}
                <h4 className="card-header">Signup</h4>
                <div className="card-body">                    
                    <form onSubmit={this.onSignup}>                        
                        <Label for="firstName">First Name&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</Label>
                        <input className="mx-2 mb-2 p-1" type="text" name="firstName" placeholder="First Name" required/>                        
                        <br></br>
                        <Label for="emailId">Email ID&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</Label>
                        <input className="mx-2 mb-2 p-1" type="text" name="emailid" placeholder="Email ID" required />                        
                        <br></br>
                        <Label for="password">Password&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</Label>
                        <input className="mx-2 mb-2 p-1" type="password" name="password" placeholder="Password" required />                        
                        <br></br>
                        <Label for="confirmPassword">Retype Password</Label>
                        <input className="mx-2 mb-2 p-1" type="password" name="confirmPassword" placeholder="Retype Password" required />                        
                        <br></br>
                        <Button color="dark">Signup</Button>
                    </form>
                </div>                
                <ToastContainer store={ToastStore} position={ToastContainer.POSITION.BOTTOM_LEFT} />
            </div>
        )
    }
}
