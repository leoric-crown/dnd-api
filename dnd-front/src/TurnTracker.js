import React, {Component} from 'react'
import ReactTable from 'react-table'
import 'react-table/react-table.css'

class TurnTracker extends Component {
  state = {
    characterList: [],
    currentActorName: null,
    characterOptions: null,
    selectedCharacter: null,
  }
  nextTurn = (event) => {
    const { characterList, currentActorName } = this.state

    const prevIndex = characterList.map(a => a.name).indexOf(currentActorName)
    this.setState({
      currentActorName: characterList[(prevIndex + 1) % characterList.length].name
    })
  }
  handleSelectCharacter = (event) => {
    console.log(event.target.value)
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
        this.updateState(data)
      })
      .catch(e => console.log(e))
  }
  updateState = (data) => {
    var characterOptions = []
    var newCharacterList = data
    const { currentActorName, characterList } = this.state
    const currentActor = {
      name: currentActorName,
      index: characterList.map(a => a.name).indexOf(currentActorName)
    }
    var newActorName = currentActorName
    if(newCharacterList.length > 0 && newCharacterList.map(a => a.name).indexOf(currentActorName) === -1) {
      if(currentActor.index === characterList.length - 1) {
        newActorName = newCharacterList[0].name
      }
      else {
        newActorName = newCharacterList[currentActor.index].name
      }
    }
    for(var k = 0; k < newCharacterList.length ; k++) {
      characterOptions.push(<option key={k} value={newCharacterList[k].name}>{newCharacterList[k].name}</option>)
    }
    console.log('newcharacterlist', newCharacterList)
    this.setState({
      characterList: newCharacterList,
      characterOptions: characterOptions,
      currentActorName: newCharacterList.length > 0 ? newActorName : null,
      selectedCharacter: newCharacterList.length > 0 ? newCharacterList[0].name : null
    })
  }
  componentDidMount() {
    fetch('http://localhost:5000/characters')
      .then(res => res.json())
      .then(data => {
        this.updateState(data)
      })
      .catch(e => console.log(e))
  }
  componentDidUpdate(prevProps) {
    if(this.props.characters !== prevProps.characters) {
      /*console.log(this.props.characters)
      console.log(prevProps.characters)
      fetch('http://localhost:5000/characters')
        .then(res => res.json())
        .then(data => {
          this.updateState(data)
        })
        .catch(e => console.log(e))
        */
        this.updateState(this.props.characters)
    }
  }
  render() {
    console.log(this.state)
    const {characterList, currentActorName, selectedCharacter} = this.state
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
      <select value={selectedCharacter} id='characterSelect' onChange={this.handleSelectCharacter}>
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
            props.style.backgroundColor = (rowInfo.row.name === {currentActorName} ? 'green' : null)
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
