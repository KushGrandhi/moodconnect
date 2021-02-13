import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import logo from './logo.svg';
import './App.css';


function App() {
    const onSubmit = (event) => {
    event.preventDefault();
    console.log('to the next screen');
  };

  return (
   
    <div id ="loginform">
      <form onSubmit={onSubmit}>
      <h2>MoodConnect</h2><br/><br/>
        <label htmlFor="email">Enter Name</label>
        <input
        ></input>
        <br/> 
        <button id="loginbtn" type="submit">Login</button>
        
      </form>
    
    </div>
  );
}

export default App;
