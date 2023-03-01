import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { generateRandomString } from "../../util";
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
  const uploadedFile = useSelector(
    (state) => state.sideBarReducer.uploadedFile
  );
  const annotationsList = useSelector(
    (state) => state.mainContentReducer.annotationsList
  );
  const dispatch = useDispatch();

  useEffect(() => {
    canvas = document.querySelector("#myCanvas");
    ctx = canvas.getContext("2d");

    document.addEventListener("keydown", (e) => {
      if (e.code === "KeyZ" && e.ctrlKey) {
        imageStateList.pop();
        drawImage(imageStateList[imageStateList.length - 1]);
      }
    });
  }, []);

  useEffect(() => {
    drawImage(uploadedFile, () => {
      // return;
      // ctx.beginPath();
      // ctx.lineWidth = "2";
      // ctx.strokeStyle = "white";
      // // 198, 183, 1353, 360

      // sampleAnnotations.annotationsList.forEach((item) => {
      //   ctx.rect(
      //     item.coordinates[0],
      //     item.coordinates[1],
      //     item.coordinates[4] - item.coordinates[0],
      //     item.coordinates[5] - item.coordinates[1]
      //   );
      // });
      // ctx.stroke();
    });

    dispatch({
      type: "APPEND_NEW_COORDINATES",
      payload: [],
    });

    startingCordinates = {};
    imageStateList = [];
  }, [uploadedFile]);

  const mouseMoveHandler = (e) => {
    if (mouseState === MOUSE_STATE.mouseDown) {
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
    setmouseState(MOUSE_STATE.mouseDown);
    startingCordinates = { x: e.clientX, y: e.clientY };
  };

  const mouseUpHandler = (e) => {
    setmouseState(MOUSE_STATE.mouseUp);

    const [leftTopCoordinate_x, leftTopCoordinates_y] = getRealCoordinates([
      startingCordinates.x,
      startingCordinates.y,
    ]);

    const rightBottomCoordinates = {
      width: e.clientX - startingCordinates.x,
      height: e.clientY - startingCordinates.y,
    };

    if (rightBottomCoordinates.width && rightBottomCoordinates.height) {
      dispatch({
        type: "APPEND_NEW_COORDINATES",
        payload: [
          {
            coordinates: [
              leftTopCoordinate_x,
              leftTopCoordinates_y,
              rightBottomCoordinates.width,
              rightBottomCoordinates.height,
            ],
            fieldName: new Date().toTimeString(),
          },
          ...annotationsList,
        ],
      });
      console.log(annotationsList);

      setTimeout(() => {
        imageStateList.push(canvas.toDataURL());
      }, 100);
    }
  };

  const clickHandler = (e) => {
    const [x, y] = getRealCoordinates([
      startingCordinates.x,
      startingCordinates.y,
    ]);

    annotationsList.forEach((item) => {
      if (
        item.coordinates[0] <= x &&
        item.coordinates[1] <= y &&
        item.coordinates[4] >= x &&
        item.coordinates[5] >= y
      ) {
        item.fieldName = generateRandomString();
        document.querySelector("#field-name").value = item.fieldName;
      }
    });

    dispatch({
      type: "APPEND_NEW_COORDINATES",
      payload: [...annotationsList],
    });
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

  const getRealCoordinates = ([x, y]) => [
    x - canvas.offsetLeft + window.scrollX,
    y - canvas.offsetTop + window.scrollY,
  ];

  return (
    <div className="d-flex justify-content-center w-100 pt-4">
      <canvas
        id="myCanvas"
        onMouseMove={mouseMoveHandler}
        onMouseDown={mouseDownHandler}
        onMouseUp={mouseUpHandler}
        onClick={clickHandler}
      ></canvas>
      {/* {imageStateList.length}
      <div>
        {imageStateList.map((item) => (
          <img src={item} width="200" height="200" />
        ))}
      </div> */}
    </div>
  );
};

export default MainContent;

const sampleAnnotations = {
  id: "3m4fhpye4l",
  annotationsList: [
    {
      coordinates: [766, 321, 962, 321, 962, 456, 766, 456],
      id: "onfsmnp20r",
      fieldName: "",
      value: "",
    },
    {
      coordinates: [45, 312, 222, 312, 222, 454, 45, 454],
      id: "uiovztljly",
      fieldName: "",
      value: "",
    },
    {
      coordinates: [757, 20, 905, 20, 905, 129, 757, 129],
      id: "ho2ivhn4zq",
      fieldName: "",
      value: "",
    },
    {
      coordinates: [112, 16, 239, 16, 239, 133, 112, 133],
      id: "n2p3ydkj1z",
      fieldName: "",
      value: "",
    },
  ],
};
