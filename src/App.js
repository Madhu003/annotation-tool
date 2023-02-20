import React, { Component } from "react";
import { Provider } from "react-redux";
import store from "./store";
import "./App.css";
import MainContent from "./components/main-content/MainContent";
import { Sidebar } from "./components/side-bar/Sidebar";

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <div className="d-flex w-100">
          <div className="side-bar">
            <Sidebar />
          </div>
          <div className="main-content">
            <MainContent />
          </div>
        </div>
      </Provider>
    );
  }
}

export default App;
