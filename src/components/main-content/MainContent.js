import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import "./mainContent.css";

const MAX_WIDTH = 1000;
const MAX_HEIGHT = 850;

const MOUSE_STATE = {
  mouseDown: 1,
  mouseUp: 2,
};
let mouseState = MOUSE_STATE.mouseUp;
let startingCordinates = {};
let imageStateList = [];
let width = null;
let height = null;
let canvas = null;
let ctx = null;
let annotationsList = [];

const MainContent = () => {
  //   const [mouseState, setmouseState] = useState(MOUSE_STATE.mouseUp);
  const uploadedFile = useSelector(
    (state) => state.sideBarReducer.uploadedFile
  );

  useEffect(() => {
    canvas = document.querySelector("#myCanvas");
    ctx = canvas.getContext("2d");

    canvas.addEventListener("mousemove", (e) => {
      if (mouseState == MOUSE_STATE.mouseDown) {
        const leftTopCoordinates = {
          x: startingCordinates.x - canvas.offsetLeft,
          y: startingCordinates.y - canvas.offsetTop,
        };

        const rightBottomCoordinates = {
          width: e.clientX - startingCordinates.x,
          height: e.clientY - startingCordinates.y,
        };

        console.log(rightBottomCoordinates);
        drawImage(imageStateList[imageStateList.length - 1], () => {
          ctx.beginPath();
          ctx.lineWidth = "1";
          ctx.strokeStyle = "white";
          ctx.rect(
            leftTopCoordinates.x,
            leftTopCoordinates.y,
            rightBottomCoordinates.width,
            rightBottomCoordinates.height
          );
          ctx.stroke();
        });
      }
    });
    canvas.addEventListener("mousedown", (e) => {
      // setmouseState(MOUSE_STATE.mouseDown)
      mouseState = MOUSE_STATE.mouseDown;
      startingCordinates = { x: e.clientX, y: e.clientY };
    });
    canvas.addEventListener("mouseup", (e) => {
      // setmouseState(MOUSE_STATE.mouseUp)
      mouseState = MOUSE_STATE.mouseUp;
      imageStateList.push(canvas.toDataURL());

      const leftTopCoordinates = {
        x: startingCordinates.x - canvas.offsetLeft,
        y: startingCordinates.y - canvas.offsetTop,
      };

      const rightBottomCoordinates = {
        width: e.clientX - startingCordinates.x,
        height: e.clientY - startingCordinates.y,
      };
      annotationsList.push([
        leftTopCoordinates.x,
        leftTopCoordinates.y,
        e.clientX,
        e.clientY,
      ]);
      console.log(annotationsList);
    });
  }, []);

  useEffect(() => drawImage(uploadedFile), [uploadedFile]);

  const drawImage = (uploadedFile, callback) => {
    let newImage = new Image();
    newImage.src = uploadedFile;

    newImage.onload = function () {
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
      imageStateList.push(canvas.toDataURL());

      if (callback) callback();
    };
  };

  return (
    <div className="d-flex">
      {mouseState}
      <canvas id="myCanvas"></canvas>
    </div>
  );
};

export default MainContent;
