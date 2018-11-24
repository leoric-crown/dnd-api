import React, { Component } from 'react';
import './App.css'
import TurnTracker from './TurnTracker'

const CHARACTER_NAME = 'characterName'
const INITIATIVE = 'initiative'
const AC = 'ac'
const HP = 'hp'

class Form extends Component {
  state = {
      name: '',
      initiative: '',
      ac: '',
      hp: '',
      characters: []
  }
  sendRequestBody = () => {
    const {name, initiative, ac, hp} = this.state
    return {
      name,
      initiative,
      ac,
      hp
    }
  }
  handleSubmit = (event) => {
    event.preventDefault();
    fetch('http://localhost:5000/post', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify ( this.sendRequestBody() )
    })
      .then(res => res.json())
      .then(data => this.setState({characters: data}))
      .then(this.clearInput())
      .catch(e => console.log(e))
  }
  handleInput = (value, key) => {
    switch(key) {
      case CHARACTER_NAME:
        this.setState({name: value})
        break;
      case INITIATIVE:
        this.setState({initiative: value})
        break
      case AC:
        this.setState({ac: value})
        break
      case HP:
        this.setState({hp: value})
        break
      default:
        break;
    }
  }
  clearInput = () => {
    this.setState({name: '', initiative: '', ac: '', hp: ''})
  }
  componentDidMount() {
    fetch('http://localhost:5000/characters')
      .then(res => res.json())
      .then(data => {
        this.setState({characters: data})
      })
      .catch(e => console.log(e))
  }
  render() {
    const { name, initiative, ac, hp} = this.state
    return (
      <div>
      <form onSubmit = {this.handleSubmit}>
        <input type = "text"
          placeholder = 'Character Name'
          value = {name}
          onChange = {(event) => {this.handleInput(event.target.value, CHARACTER_NAME)}}
        />
        <br/>
        <input type = "text"
          placeholder = "Initiative"
          value = {initiative}
          onChange = {(event) => {this.handleInput(event.target.value, INITIATIVE)}}
        />
        <br/>
        <input type = "text"
          placeholder = "Armor Class"
          value = {ac}
          onChange = {(event) => {this.handleInput(event.target.value, AC)}}
        />
        <br/>
        <input type = "text"
          placeholder = "Hit Points"
          value = {hp}
          onChange = {(event) => {this.handleInput(event.target.value, HP)}}
        />
        <br/>
        <button type = "submit">
          Add
        </button>
      </form>
      <TurnTracker characters={this.state.characters}/>
      </div>
    )
  }
}

export default Form
