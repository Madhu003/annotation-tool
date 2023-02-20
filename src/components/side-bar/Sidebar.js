import React from "react";
import "./sidebar.css";
import { sideBarReducer } from "../../reducers/sideBarReducer";
import { useDispatch } from "react-redux";

export const Sidebar = () => {
  const dispatch = useDispatch();

  return (
    <div className="d-flex flex-column container">
      <div className="upload-section">
        <input
          type="file"
          onChange={(e) => {
            console.log(e);
            if (e.target.files && e.target.files[0]) {
              let reader = new FileReader();

              reader.onload = function (e) {
                dispatch({ type: "FILE_UPLOAD", payload: e.target.result });
              };

              reader.readAsDataURL(e.target.files[0]);
            }
          }}
        />
      </div>
      <button
        className="btn btn-sm btn-primary"
        onClick={() => dispatch({ type: "DOWNLOAD_IMAGE" })}
      >
        Download Image
      </button>
    </div>
  );
};
