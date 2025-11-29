const inititalState = {
  annotationsList: []
};

export const mainContentReducer = (state = inititalState, action) => {

  switch (action.type) {
    case "APPEND_NEW_COORDINATES":
      return { ...state, annotationsList: action.payload };

    default:
      return state;
  }
};
