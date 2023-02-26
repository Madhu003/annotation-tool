import React from "react";
// import pdfjsLib from 'pdfjs-dist';
// import pdfjs from 'pdfjs-dist/build/pdf';
// import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';
// pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

import "./sidebar.css";
import { useDispatch, useSelector } from "react-redux";
import { dataURItoBlob, generateRandomString } from "../../util";
// import pdf from "pdfjs";

export const Sidebar = () => {
  const annotationsList = useSelector(
    (state) => state.mainContentReducer.annotationsList
  );
  const dispatch = useDispatch();

  const loadPdf = async (fileObject) => {
    return;
    // const loadingTask = pdfjsLib.getDocument(fileObject);
    // const pdf = await loadingTask.promise;
    // const numPages = pdf.numPages;

    // for (let i = 1; i <= numPages; i++) {
    //   const page = await pdf.getPage(i);
    //   const viewport = page.getViewport({ scale: 1 });
    //   const canvas = document.createElement('canvas');
    //   canvas.width = viewport.width;
    //   canvas.height = viewport.height;
    //   const context = canvas.getContext('2d');
    //   const renderContext = {
    //     canvasContext: context,
    //     viewport: viewport,
    //   };
    //   const renderTask = page.render(renderContext);
    //   await renderTask.promise;
    //   const image = canvas.toDataURL('image/png');
    //   console.log(image)
    //   // Do something with the image, such as save it to an array or display it on the page
    // }
  };

  const imageUploadHandler = (e) => {
    console.log(e);
    if (e.target.files && e.target.files[0]) {
      const fileObject = e.target.files[0];
      const fileReader = new FileReader();

      if (fileObject.type == "application/pdf") {
        fileReader.onload = function (e) {
          console.log(e);

          loadPdf(fileObject);
        };
      } else {
        fileReader.onload = (e) => {
          dispatch({ type: "FILE_UPLOAD", payload: e.target.result });
        };

        fileReader.readAsDataURL(e.target.files[0]);
      }
    }
  };

  const downloadJsonHandler = () => {
    const JsonToExport = {
      id: generateRandomString(),
      annotationsList: annotationsList.map((item) => {
        const [x, y, width, height] = item.coordinates;
        return {
          ...item,
          id: generateRandomString(),
          fieldName: "",
          value: "",
          coordinates: [
            x,
            y,
            x + width,
            y,
            x + width,
            y + height,
            x,
            y + height,
          ],
        };
      }),
    };

    const aElement = document.createElement("a");
    aElement.href =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(JsonToExport, "", 4));
    aElement.download = "test.json";
    aElement.click();
  };

  const downloadImageHandler = () => {
    const canvas = document.querySelector("#myCanvas");

    const imageURL = URL.createObjectURL(dataURItoBlob(canvas.toDataURL()));
    const aElement = document.createElement("a");
    aElement.href = imageURL;
    aElement.download = "test.png";
    aElement.click();
  };

  return (
    <div className="d-flex flex-column container">
      <div className="upload-section mt-4">
        <input
          className="form-control"
          type="file"
          onChange={imageUploadHandler}
          // accept="image/*, application/pdf"
          accept="image/*"
        />
      </div>

      <button
        className="btn btn-sm btn-primary mt-4"
        onClick={downloadJsonHandler}
      >
        Download JSON
      </button>

      <button
        className="btn btn-sm btn-primary mt-4"
        onClick={downloadImageHandler}
      >
        Download Image
      </button>

      <hr />

      <div class="input-group">
        <input
          type="text"
          class="form-control"
          placeholder="Field Name"
          id="field-name"
        />
        <div class="input-group-append">
          <button
            class="btn btn-primary"
            type="button"
            style={{ borderBottomLeftRadius: 0, borderTopLeftRadius: 0 }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
