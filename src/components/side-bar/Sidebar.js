import React from "react";
// import pdfjsLib from 'pdfjs-dist';
// import pdfjs from 'pdfjs-dist/build/pdf';
// import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';
// pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

import "./sidebar.css";
import { useDispatch, useSelector } from "react-redux";
// import pdf from "pdfjs";

export const Sidebar = () => {
  const annotationsList = useSelector(
    (state) => state.mainContentReducer.annotationsList
  );
  const dispatch = useDispatch();

  const dataURItoBlob = (dataURI) => {
    const mime = dataURI.split(",")[0].split(":")[1].split(";")[0];
    const binary = atob(dataURI.split(",")[1]);

    const array = binary.split("").map((_, i) => binary.charCodeAt(i));

    return new Blob([new Uint8Array(array)], { type: mime });
  };

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

  return (
    <div className="d-flex flex-column container">
      <div className="upload-section mt-4">
        <input
          className="form-control"
          type="file"
          onChange={imageUploadHandler}
          accept="image/*, application/pdf"
        />
      </div>

      <button
        className="btn btn-sm btn-primary mt-4"
        onClick={() => {
          const aElement = document.createElement("a");
          const dataStr =
            "data:text/json;charset=utf-8," +
            encodeURIComponent(JSON.stringify(annotationsList, "", 4));
          aElement.href = dataStr;
          aElement.download = "test.json";
          aElement.click();
          // dispatch({ type: "DOWNLOAD_IMAGE" })
        }}
      >
        Download JSON
      </button>

      <button
        className="btn btn-sm btn-primary mt-4"
        onClick={() => {
          const canvas = document.querySelector("#myCanvas");

          const baseUrl = canvas.toDataURL();

          const imageURL = URL.createObjectURL(dataURItoBlob(baseUrl));
          const aElement = document.createElement("a");
          aElement.href = imageURL;
          aElement.download = "test.png";
          aElement.click();
          // dispatch({ type: "DOWNLOAD_IMAGE" })
        }}
      >
        Download Image
      </button>

      <hr />

      <div class="input-group">
        <input type="text" class="form-control" placeholder="Field Name" />
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
