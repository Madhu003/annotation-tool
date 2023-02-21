import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
// let annotationsList = [];

const MainContent = () => {
  //   const [mouseState, setmouseState] = useState(MOUSE_STATE.mouseUp);
  const dispatch = useDispatch();
  const uploadedFile = useSelector(
    (state) => state.sideBarReducer.uploadedFile
  );
  const annotationsList = useSelector((state) => {
    return state.mainContentReducer.annotationsList;
  });

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

      const leftTopCoordinates = {
        x: startingCordinates.x - canvas.offsetLeft,
        y: startingCordinates.y - canvas.offsetTop,
      };

      const rightBottomCoordinates = {
        width: e.clientX - startingCordinates.x,
        height: e.clientY - startingCordinates.y,
      };

      dispatch({
        type: "APPEND_NEW_COORDINATES",
        payload: [
          {
            coordinates: [
              leftTopCoordinates.x,
              leftTopCoordinates.y,
              e.clientX,
              e.clientY,
            ],
          },
          ...(annotationsList || []),
        ],
      });

      setTimeout(() => {
        imageStateList.push(canvas.toDataURL());
      }, 100);
    });
  }, []);

  useEffect(
    () =>
      drawImage(uploadedFile, () => {
        // ctx.beginPath();
        // ctx.lineWidth = "1";
        // ctx.strokeStyle = "white";
        // // 198, 183, 1353, 360
        // sampleAnnotations.forEach((item) => {
        //   ctx.rect(
        //     item[0],
        //     item[1],
        //     item[2] - item[0] - canvas.offsetLeft,
        //     item[3] - item[1] - canvas.offsetTop
        //   );
        // });
        // ctx.stroke();
      }),
    [uploadedFile]
  );

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
      <canvas id="myCanvas"></canvas>
    </div>
  );
};

export default MainContent;

const sampleAnnotations = [
  [88, 91, 798, 199],
  [323, 94, 1024, 184],
  [556, 93, 1245, 194],
  [783, 90, 1470, 196],
  [102, 302, 790, 414],
  [328, 301, 1017, 409],
  [559, 297, 1251, 398],
  [784, 299, 1476, 404],
];
