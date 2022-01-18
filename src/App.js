import React, { Component } from 'react';
import './App.css';
import Viewer from './Viewer';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }

  componentDidMount() {
    window.addEventListener('resize', () => {
      this.setState({
        width: window.innerWidth,
        height: window.innerHeight
      });
    });
  }

  render() {
    return (
      <Viewer width={this.state.width} height={this.state.height} />
    );
  }
}

export default App;
