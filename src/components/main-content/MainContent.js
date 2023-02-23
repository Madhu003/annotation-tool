import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./mainContent.css";

const MAX_WIDTH = 1000;
const MAX_HEIGHT = 850;

const MOUSE_STATE = {
  mouseDown: 1,
  mouseUp: 2,
};
let startingCordinates = {};
let imageStateList = [];
// let width = null;
// let height = null;
let canvas = null;
let ctx = null;

const MainContent = () => {
  const [mouseState, setmouseState] = useState(MOUSE_STATE.mouseUp);
  const dispatch = useDispatch();
  const uploadedFile = useSelector(
    (state) => state.sideBarReducer.uploadedFile
  );
  const annotationsList = useSelector(
    (state) => state.mainContentReducer.annotationsList
  );

  useEffect(() => {
    canvas = document.querySelector("#myCanvas");
    ctx = canvas.getContext("2d");
  }, []);

  useEffect(() => {
    drawImage(uploadedFile, () => {
      // return;
      ctx.beginPath();
      ctx.lineWidth = "2";
      ctx.strokeStyle = "white";
      // 198, 183, 1353, 360

      sampleAnnotations.forEach((item) => {
        ctx.rect(
          item.coordinates[0],
          item.coordinates[1],
          item.coordinates[2],
          item.coordinates[3]
        );
      });
      ctx.stroke();
    });
  }, [uploadedFile]);

  const mouseMoveHandler = (e) => {
    if (mouseState == MOUSE_STATE.mouseDown) {
      const leftTopCoordinates = {
        x: startingCordinates.x - canvas.offsetLeft + window.scrollX,
        y: startingCordinates.y - canvas.offsetTop + window.scrollY,
      };

      const rightBottomCoordinates = {
        width: e.clientX - startingCordinates.x,
        height: e.clientY - startingCordinates.y,
      };

      drawImage(imageStateList[imageStateList.length - 1], () => {
        ctx.beginPath();
        ctx.lineWidth = "2";
        ctx.strokeStyle = "#ffffff";
        ctx.rect(
          leftTopCoordinates.x,
          leftTopCoordinates.y,
          rightBottomCoordinates.width,
          rightBottomCoordinates.height
        );
        ctx.stroke();
      });
    }
  };

  const mouseDownHandler = (e) => {
    // mouseState = MOUSE_STATE.mouseDown;
    setmouseState(MOUSE_STATE.mouseDown);
    startingCordinates = { x: e.clientX, y: e.clientY };
  };

  const mouseUpHandler = (e) => {
    setmouseState(MOUSE_STATE.mouseUp);
    // mouseState = MOUSE_STATE.mouseUp;

    const leftTopCoordinates = {
      x: startingCordinates.x - canvas.offsetLeft,
      y: startingCordinates.y - canvas.offsetTop,
    };

    const rightBottomCoordinates = {
      x: e.clientX - startingCordinates.x,
      y: e.clientY - startingCordinates.y,
    };

    dispatch({
      type: "APPEND_NEW_COORDINATES",
      payload: [
        {
          coordinates: [
            leftTopCoordinates.x,
            leftTopCoordinates.y,
            rightBottomCoordinates.x,
            rightBottomCoordinates.y,
          ],
        },
        ...annotationsList,
      ],
    });
    console.log(annotationsList);
    setTimeout(() => {
      imageStateList.push(canvas.toDataURL());
    }, 100);
  };

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
    <div className="d-flex justify-content-center w-100 pt-4">
      <canvas
        id="myCanvas"
        onMouseMove={mouseMoveHandler}
        onMouseDown={mouseDownHandler}
        onMouseUp={mouseUpHandler}
      ></canvas>
    </div>
  );
};

export default MainContent;

const sampleAnnotations = [
  {
    coordinates: [-1, 411, 40, 36],
  },
  {
    coordinates: [-1, 23, 40, 36],
  },
  {
    coordinates: [272, 294, 345, 219],
  },
  {
    coordinates: [247, 106, 164, 72],
  },
  {
    coordinates: [918, 92, 69, 80],
  },
  {
    coordinates: [2, 526, 36, 33],
  },
];
