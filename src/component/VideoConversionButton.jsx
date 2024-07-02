import React from "react";
import { Button } from "antd";
import { fetchFile } from "@ffmpeg/ffmpeg";
import { readFileAsBase64, sliderValueToVideoTime } from "../utils/utils";
import out from "../assets/icons//out.svg";
import dark_download from "../assets/icons/dark_download.svg";
import "./VideoConversionButton.css";

const VideoConversionButton = ({
  videoPlayerState,
  sliderValues,
  videoFile,
  ffmpeg,
  onConversionStart = () => {},
  onConversionEnd = () => {},
}) => {
  const convertToGif = async () => {
    if (!videoPlayerState || !videoPlayerState.duration) {
      onConversionEnd(false);
      return;
    }

    onConversionStart(true);

    const inputFileName = "input.mp4";
    const outputFileName = "output.gif";

    try {
      await ffmpeg.FS("writeFile", inputFileName, await fetchFile(videoFile));
      const [min, max] = sliderValues;
      const minTime = sliderValueToVideoTime(videoPlayerState.duration, min);
      const maxTime = sliderValueToVideoTime(videoPlayerState.duration, max);

      await ffmpeg.run(
        "-i",
        inputFileName,
        "-ss",
        `${minTime}`,
        "-to",
        `${maxTime}`,
        "-f",
        "gif",
        outputFileName
      );

      const data = ffmpeg.FS("readFile", outputFileName);
      const gifUrl = URL.createObjectURL(
        new Blob([data.buffer], { type: "image/gif" })
      );

      const link = document.createElement("a");
      link.href = gifUrl;
      link.setAttribute("download", "output.gif");
      link.click();
    } catch (error) {
      console.error("Error during GIF conversion:", error);
    }

    onConversionEnd(false);
  };

  const onCutTheVideo = async () => {
    if (!videoPlayerState || !videoPlayerState.duration) {
      onConversionEnd(false);
      return;
    }

    onConversionStart(true);

    const inputFileName = "input.mp4";
    const outputFileName = "output.mp4";

    try {
      await ffmpeg.FS("writeFile", inputFileName, await fetchFile(videoFile));
      const [min, max] = sliderValues;
      const minTime = sliderValueToVideoTime(videoPlayerState.duration, min);
      const maxTime = sliderValueToVideoTime(videoPlayerState.duration, max);

      await ffmpeg.run(
        "-ss",
        `${minTime}`,
        "-i",
        inputFileName,
        "-to",
        `${maxTime - minTime}`,
        "-c",
        "copy",
        outputFileName
      );

      const data = ffmpeg.FS("readFile", outputFileName);
      const dataURL = await readFileAsBase64(
        new Blob([data.buffer], { type: "video/mp4" })
      );

      const link = document.createElement("a");
      link.href = dataURL;
      link.setAttribute("download", "output.mp4");
      link.click();
    } catch (error) {
      console.error("Error during video cutting:", error);
    }

    onConversionEnd(false);
  };

  return (
    <div className="video-conversion-container">
      <Button className="video-conversion-button" onClick={convertToGif}>
        <img className="video-conversion-img" src={out} alt="GIF 내보내기" />
        <p className="video-conversion-text">GIF 내보내기</p>
      </Button>

      <Button className="video-conversion-button" onClick={onCutTheVideo}>
        <img className="video-conversion-img" src={dark_download} alt="비디오 저장하기" />
        <p className="video-conversion-text">비디오 저장하기</p>
      </Button>
    </div>
  );
};

export default VideoConversionButton;