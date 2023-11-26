import React, { useState, useEffect } from "react";
import logo from "./assets/logo.png";

const ComicForm = ({ onGenerateComic, isLoading, progress }) => {
  const [textInput, setTextInput] = useState("");

  const handleInputChange = (e) => {
    setTextInput(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onGenerateComic(textInput);
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <label style={{ color: "#fff", fontSize:"20px" }}>
          Enter Text:
          <input
            style={{
              height: "30px",
              width: "20vw",
              margin: "10px 10px 10px 10px",
              borderRadius:"10px",
              border:"0px"
            }}
            type="text"
            value={textInput}
            onChange={handleInputChange}
          />
        </label>
        <button
          className="button-29"
          style={{
            height: "30px",
            width: "10vw",
            margin: "10px 10px 10px 10px",
          }}
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Generating..." : "Generate Comic"}
        </button>
        <span style={{ color: "white" }}>
          {isLoading && <p>Loading: {progress}%</p>}
        </span>
      </form>
    </>
  );
};

const ComicStrip = ({ images }) => {
  return (
    <div className="comic-strip">
      {images.map((image, index) => (
        <img
          key={index}
          className="comic-panel"
          src={URL.createObjectURL(image)}
          alt={`Comic Strip Panel ${index + 1}`}
        />
      ))}
    </div>
  );
};

const Main = () => {
  const [comicImages, setComicImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isLoading && progress < 100) {
        setProgress((prevProgress) => prevProgress + 10);
      }
    }, 300000); // Adjust the interval as needed

    return () => clearInterval(interval);
  }, [isLoading, progress]);

  const onGenerateComic = async (text) => {
    setIsLoading(true);
    setProgress(0);

    try {
      const generatedImages = await Promise.all(
        Array.from(
          { length: 10 },
          async (_, index) =>
            await query({ inputs: `${text} - Panel ${index + 1}` })
        )
      );
      setComicImages(generatedImages);
    } catch (error) {
      console.error("Error generating comic:", error);
    } finally {
      setIsLoading(false);
      setProgress(100);
    }
  };

  const onSaveCollage = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
  
    // Set canvas dimensions to A4 size (adjust as needed)
    canvas.width = 794; // A4 width in pixels
    canvas.height = 1123; // A4 height in pixels
  
    // Ensure all images are loaded before drawing them onto the canvas
    const imagePromises = comicImages.map((image) => createImageBitmap(image));
  
    Promise.all(imagePromises)
      .then((bitmaps) => {
        // Draw each image onto the canvas
        bitmaps.forEach((bitmap, index) => {
          const x = (index % 2) * (canvas.width / 2);
          const y = Math.floor(index / 2) * (canvas.height / 5);
          ctx.drawImage(bitmap, x, y, canvas.width / 2, canvas.height / 5);
        });
  
        // Convert the canvas content to a data URL and trigger download
        const dataURL = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = dataURL;
        link.download = "comic_collage.png";
        link.click();
      })
      .catch((error) => {
        console.error("Error creating image bitmaps:", error);
      });
  };
  

  return (
    <div>
      <img src={logo} height={"100px"} style={{margin:"60px 10px 10px 10px"}} />
      <h1 style={{ color: "#fff", position: "relative" }}>
        Comic Strip Generator
      </h1>
      <ComicForm
        onGenerateComic={onGenerateComic}
        isLoading={isLoading}
        progress={progress}
      />
      {isLoading && progress < 100 && <p>Loading: {progress}%</p>}
      {comicImages.length > 0 && <ComicStrip images={comicImages} />}
      {comicImages.length > 0 && (
        <button className="button-29" onClick={onSaveCollage}>Save Collage</button>
      )}
      <p style={{color:"#fff", fontWeight:"00"}}>This tool uses Dashtoon API, the image may take 3-4 minutes to render depending upon the API.</p>
    </div>
  );
};

async function query(data) {
  const response = await fetch(
    "https://xdwvg9no7pefghrn.us-east-1.aws.endpoints.huggingface.cloud",
    {
      headers: {
        Accept: "image/png",
        Authorization:
          "Bearer VknySbLLTUjbxXAXCjyfaFIPwUTCeRXbFSOjwRiCxsxFyhbnGjSFalPKrpvvDAaPVzWEevPljilLVDBiTzfIbWFdxOkYJxnOPoHhkkVGzAknaOulWggusSFewzpqsNWM",
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(data),
    }
  );
  const result = await response.blob();
  return result;
}

export default Main;
