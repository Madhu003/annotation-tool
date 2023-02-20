import { combineReducers, createStore } from "redux";
import { sideBarReducer } from "./reducers/sideBarReducer";

const store = createStore(combineReducers({ sideBarReducer }));
export default store;
