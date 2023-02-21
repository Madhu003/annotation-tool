import React from "react";
import "./sidebar.css";
import { sideBarReducer } from "../../reducers/sideBarReducer";
import { useDispatch } from "react-redux";

export const Sidebar = () => {
  const dispatch = useDispatch();

  const dataURItoBlob = (dataURI) => {
    var mime = dataURI.split(",")[0].split(":")[1].split(";")[0];
    var binary = atob(dataURI.split(",")[1]);
    var array = [];
    for (var i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], { type: mime });
  };

  return (
    <div className="d-flex flex-column container">
      <div className="upload-section">
        <input
          className="form-control my-4"
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
        onClick={() => {
          const canvas = document.querySelector("#myCanvas");

          const baseUrl = canvas.toDataURL();
          const blob = new Blob([baseUrl], { type: "plain/text" });

          const imageURL = URL.createObjectURL(dataURItoBlob(baseUrl));
          console.log(imageURL);
          const aElement = document.createElement("a");
          aElement.href = imageURL;
          aElement.download = "test.png";
          aElement.click();
          // dispatch({ type: "DOWNLOAD_IMAGE" })
        }}
      >
        Download Image
      </button>
    </div>
  );
};
