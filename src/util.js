export const generateRandomString = () => {
  let str = "0123456789ancdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < 10; i++) {
    result += str.charAt(Math.floor(Math.random() * str.length));
  }

  return result;
};

export const dataURItoBlob = (dataURI) => {
  const mime = dataURI.split(",")[0].split(":")[1].split(";")[0];
  const binary = atob(dataURI.split(",")[1]);

  const array = binary.split("").map((_, i) => binary.charCodeAt(i));

  return new Blob([new Uint8Array(array)], { type: mime });
};
