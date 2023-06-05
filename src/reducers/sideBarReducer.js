const inititalState = {};

export const sideBarReducer = (state = inititalState, action) => {
  switch (action.type) {
    case "FILE_UPLOAD":
      return { ...state, uploadedFile: action.payload };
    case "DOWNLOAD_IMAGE":
      return { ...state };
    case "CHANGE_LABEL_TEXT":
      return { ...state, searchText: action.payload };  
    case "CHANGE_VALUE_TEXT":
      return { ...state, searchText: action.payload };    
    default:
      return state;
  }
};
