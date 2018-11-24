import React, {Component} from 'react'
import ReactTable from 'react-table'
import 'react-table/react-table.css'

class TurnTracker extends Component {
  state = {
    characterList: [],
    currentActorName: '',
    characterOptions: null,
    selectedCharacter: ''
  }
  nextTurn = (event) => {
    const { characterList, currentActorName } = this.state

    const prevIndex = characterList.map(a => a.name).indexOf(currentActorName)
    this.setState({
      currentActorName: characterList[(prevIndex + 1) % characterList.length].name
    })
  }
  handleSelectCharacter = (event) => {
    console.log(event.target)
    this.setState({selectedCharacter: event.target.value})
  }
  removeCharacter = (event) => {
    const requestBody = {
      name: this.state.selectedCharacter
    }
    fetch('http://localhost:5000/remove', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify ( requestBody )
    })
      .then(res => res.json())
      .then(data => {
        var characterOptions = []
        var characterList = data
        for(var k = 0; k < characterList.length ; k++) {
          console.log(k)
          characterOptions.push(<option key={k} value={characterList[k].name}>{characterList[k].name}</option>)
        }
        console.log(characterOptions)
        this.setState({ characterList: characterList, characterOptions: characterOptions, selectedCharacter: characterList.length === 0 ? '' : characterList[0].name})
      })
      .catch(e => console.log(e))
  }
  componentDidMount() {
    fetch('http://localhost:5000/characters')
      .then(res => res.json())
      .then(data => {
        var characterOptions = []
        var characterList = data
        for(var k = 0; k < characterList.length ; k++) {
          console.log(k)
          characterOptions.push(<option key={k} value={characterList[k].name}>{characterList[k].name}</option>)
        }
        console.log(characterOptions)
        this.setState({ characterList: characterList, characterOptions: characterOptions, selectedCharacter: characterList.length === 0 ? '' : characterList[0].name})
      })
      .catch(e => console.log(e))
  }
  componentDidUpdate(prevProps) {
    if(this.props.characters !== prevProps.characters) {
      fetch('http://localhost:5000/characters')
        .then(res => res.json())
        .then(data => {
          var characterOptions = []
          var characterList = data
          for(var k = 0; k < characterList.length ; k++) {
            console.log(k)
            characterOptions.push(<option key={k} value={characterList[k].name}>{characterList[k].name}</option>)
          }
          console.log(characterOptions)
          this.setState({ characterList: characterList, characterOptions: characterOptions, selectedCharacter: characterList.length === 0 ? '' : characterList[0].name})
        })
        .catch(e => console.log(e))
    }
  }
  render() {
    console.log(this.state)
    const {characterList, currentActorName} = this.state
    const columns = [
      {
        Header: 'Name',
        accessor: 'name',
        getProps: (state, rowInfo, column) => {
          var props = {
            style: {
              textAlign: 'center'
            }
          }
          if(rowInfo && rowInfo.row && rowInfo.row.name) {
            props.style.backgroundColor = (rowInfo.row.name === currentActorName ? 'green' : null)
            }
          return props
        },
        getHeaderProps: (state, rowInfo, column, instance) => {
          return {
            style: {
              fontWeight: 'bold'
            }
          }
        }
      },
      {
        Header: 'Initiative',
        accessor: 'initiative',
        getProps: (state, rowInfo, column) => {
          return{
            style: {
              textAlign: 'center'
            }
          }
        },
        getHeaderProps: (state, rowInfo, column, instance) => {
          return {
            style: {
              fontWeight: 'bold'
            }
          }
        }
      },
      {
        Header:'Armor Class',
        accessor: 'ac',
        getProps: (state, rowInfo, column) => {
          return{
            style: {
              textAlign: 'center'
            }
          }
        },
        getHeaderProps: (state, rowInfo, column, instance) => {
          return {
            style: {
              fontWeight: 'bold'
            }
          }
        }
      },
      {
        Header:'Hit Points',
        accessor: 'hp',
        getProps: (state, rowInfo, column) => {
          return{
            style: {
              textAlign: 'center'
            }
          }
        },
        getHeaderProps: (state, rowInfo, column, instance) => {
          return {
            style: {
              fontWeight: 'bold'
            }
          }
        }
      }
    ]
    return (
      <div>
      <select id='characterSelect' onChange={this.handleSelectCharacter}>
        {this.state.characterOptions}
      </select>
      <button type = "submit" onClick = {this.removeCharacter}>
        Remove Character
      </button>
      <br/>
      <button type = "submit" onClick = {this.nextTurn}>
        <h4>Next Turn</h4>
      </button>
      <ReactTable
        getTrProps={(state,rowInfo,column) => {
          var props = {
            style: {}
          }
          if(rowInfo && rowInfo.row && rowInfo.row.name) {
            props.style.background = rowInfo.row.name === 'Rhuuan' ? 'green' : null
          }
          return props
        }}
        data = {characterList}
        columns = {columns}
        defaultPageSize ={20}
        className ="-striped -highlight"
        sortable = {false}
      />
      </div>
    )
  }
}

export default TurnTracker
