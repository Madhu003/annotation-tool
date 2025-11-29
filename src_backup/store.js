import { combineReducers, createStore } from "redux";
import { sideBarReducer } from "./reducers/sideBarReducer";
import { mainContentReducer } from "./reducers/mainContentReducer";

const store = createStore(
  combineReducers({ sideBarReducer, mainContentReducer })
);
export default store;
