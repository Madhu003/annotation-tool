const inititalState = {};

export const sideBarReducer = (state = inititalState, action) => {
  switch (action.type) {
    case "FILE_UPLOAD":
      return { ...state, uploadedFile: action.payload };
    case "DOWNLOAD_IMAGE":
      return { ...state };
    default:
      return state;
  }
};
