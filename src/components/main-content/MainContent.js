import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import "./mainContent.css";

const MAX_WIDTH = 1000;
const MAX_HEIGHT = 850;

const MainContent = () => {
  const uploadedFile = useSelector(
    (state) => state.sideBarReducer.uploadedFile
  );

  console.log(uploadedFile);

  useEffect(() => {
    console.log(uploadedFile);
    uploadedFile;
    const canvas = document.querySelector("#myCanvas");
    let ctx = canvas.getContext("2d");

    let newImage = new Image();
    newImage.src = uploadedFile;

    newImage.onload = function () {
      debugger;
      let width = this.width;
      let height = this.height;
      if (width > height) {
        if (width > MAX_WIDTH) {
          height = height * (MAX_WIDTH / width);
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width = width * (MAX_HEIGHT / height);
          height = MAX_HEIGHT;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(newImage, 0, 0, width, height);
    };
  }, [uploadedFile]);

  return (
    <div className="d-flex">
      <canvas id="myCanvas"></canvas>
    </div>
  );
};

export default MainContent;
