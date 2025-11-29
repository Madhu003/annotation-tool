import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { generateRandomString } from "../../util";
import uploadPlaceholder from "../../assets/file-drop-img.webp";
import "./mainContent.css";

const MAX_WIDTH = 1000;
const MAX_HEIGHT = 850;

const MOUSE_STATE = {
  mouseDown: 1,
  mouseUp: 2,
};
let startingCordinates = {};
let imageStateList = [];
let canvas = null;
let ctx = null;
let mouseMoveHandlerAfterThrottle = () => {};
let flag = true;

const MainContent = () => {
  const [mouseState, setmouseState] = useState(MOUSE_STATE.mouseUp);
  const [isCursorInBox, setIsCursorInBox] = useState(false);

  const uploadedFile = useSelector(
    (state) => state.sideBarReducer.uploadedFile
  );
  const annotationsList = useSelector(
    (state) => state.mainContentReducer.annotationsList
  );
  const dispatch = useDispatch();

  useEffect(() => {
    document.addEventListener("keydown", (e) => {
      if (e.code === "KeyZ" && e.ctrlKey) {
        imageStateList.pop();
        drawImage(imageStateList[imageStateList.length - 1]);
      }
    });
  }, []);

  useEffect(() => {
    if (uploadedFile) {
      canvas = document.querySelector("#myCanvas");
      ctx = canvas.getContext("2d");
    }

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

  useEffect(() => {}, [annotationsList]);

  const mouseMoveHandler = (e) => {
    if (flag) {
      flag = false;

      setTimeout(() => {
        if (mouseState === MOUSE_STATE.mouseDown) {
          const [x, y] = getRealCoordinates(e);
          const rightBottomCoordinates = { x, y };
          console.log("move", [
            startingCordinates.x,
            startingCordinates.y,
            rightBottomCoordinates.x - startingCordinates.x, // width
            rightBottomCoordinates.y - startingCordinates.y,
          ]);

          drawImage(imageStateList[imageStateList.length - 1], () => {
            ctx.beginPath();
            ctx.lineWidth = "2";
            ctx.strokeStyle = "#ffffff";
            ctx.rect(
              startingCordinates.x,
              startingCordinates.y,
              rightBottomCoordinates.x - startingCordinates.x, // width
              rightBottomCoordinates.y - startingCordinates.y // height
            );
            ctx.stroke();
          });
        } else {
          let isInBox = false;
          const [x, y] = getRealCoordinates(e);

          for (let i = 0; i < annotationsList.length; i++) {
            let [x1, y1, x2, y2] = annotationsList[i].coordinates;
            x2 += x1;
            y2 += y1;

            if (x1 <= x && y1 <= y && x2 >= x && y2 >= y) {
              isInBox = true;
              break;
            }
          }
          setIsCursorInBox(isInBox);
          // console.log({ x, y, ann: annotationsList[0]?.coordinates, isInBox });
        }
        flag = true;
      }, 50);
    }
  };

  const mouseDownHandler = (e) => {
    setmouseState(MOUSE_STATE.mouseDown);
    const [x, y] = getRealCoordinates(e);
    startingCordinates = { x, y };
  };

  const mouseUpHandler = (e) => {
    setmouseState(MOUSE_STATE.mouseUp);
    let [x2, y2] = getRealCoordinates(e);
    if (startingCordinates.x == x2 && startingCordinates.y == y2) return;

    let x1 = Math.min(startingCordinates.x, x2);
    let y1 = Math.min(startingCordinates.y, y2);

    x2 = Math.max(startingCordinates.x, x2);
    y2 = Math.max(startingCordinates.y, y2);
    console.log("up", [x1, y1, x2 - x1, y2 - y1]);
    dispatch({
      type: "APPEND_NEW_COORDINATES",
      payload: [
        {
          coordinates: [x1, y1, x2 - x1, y2 - y1],
          fieldName: "untitled",
        },
        ...annotationsList,
      ],
    });

    console.log(annotationsList);

    setTimeout(() => {
      imageStateList.push(canvas.toDataURL());
    }, 100);
  };

  const clickHandler = (e) => {
    console.log("click clallded");
    const [x, y] = getRealCoordinates(e);
    if (startingCordinates.x != x || startingCordinates.y != y) return;

    for (let i = 0; i < annotationsList.length; i++) {
      let [x1, y1, x2, y2] = annotationsList[i].coordinates;
      x2 += x1;
      y2 += y1;
      annotationsList[i].selected = false;

      if (x1 <= x && y1 <= y && x2 >= x && y2 >= y) {
        annotationsList[i].selected = true;
        dispatch({
          type: "CHANGE_LABEL_TEXT",
          payload: annotationsList[i].value,
        });
      }
    }

    drawImage(uploadedFile, () => {
      annotationsList.forEach((item) => {
        console.log("click", item.coordinates);

        const x1 = item.coordinates[0];
        const y1 = item.coordinates[1];
        const x2 = item.coordinates[2];
        const y2 = item.coordinates[3];

        ctx.beginPath();
        ctx.lineWidth = "2";
        ctx.strokeStyle = item.selected ? "#ff0000" : "#ffffff";
        ctx.rect(
          x1,
          y1,
          x2, // width
          y2 // height
        );
        ctx.stroke();
      });
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

  const getRealCoordinates = (e) => [
    e.clientX - canvas.offsetLeft + window.scrollX,
    e.clientY - canvas.offsetTop + window.scrollY,
  ];

  const clickPlaceholderHandler = () => {
    document.querySelector("#image-paceholder")?.click();
  };

  const dropImageHandler = (e) => {
    e.preventDefault();

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const fileObject = e.dataTransfer.files[0];
      const fileReader = new FileReader();

      if (fileObject.type == "application/pdf") {
        fileReader.onload = function (e) {
          loadPdf(fileObject);
        };
      } else {
        fileReader.onload = (e) => {
          dispatch({ type: "FILE_UPLOAD", payload: e.target.result });
        };

        fileReader.readAsDataURL(e.dataTransfer.files[0]);
      }
    }
  };

  return (
    <div className="d-flex justify-content-center w-100 pt-4">
      {uploadedFile ? (
        <canvas
          id="myCanvas"
          onMouseMove={mouseMoveHandler}
          onMouseDown={mouseDownHandler}
          onMouseUp={mouseUpHandler}
          onClick={clickHandler}
          style={{ cursor: isCursorInBox ? "pointer" : "crosshair" }}
        ></canvas>
      ) : (
        <img
          id="upload-placeholder"
          src={uploadPlaceholder}
          onClick={clickPlaceholderHandler}
          onDrop={dropImageHandler}
          onDragOver={(e) => e.preventDefault()}
        />
      )}
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
