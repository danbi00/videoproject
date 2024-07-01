import React from "react";
import { Button } from "antd";
import { fetchFile } from "@ffmpeg/ffmpeg";
import { readFileAsBase64, sliderValueToVideoTime } from "../utils/utils";
import out from "../assets/icons/out.svg";
import dark_download from "../assets/icons/dark_download.svg";
import "./VideoConversionButton.css";

function VideoConversionButton({
  videoPlayerState,
  sliderValues,
  videoFile,
  ffmpeg,
  onConversionStart = () => {},
  onConversionEnd = () => {},
}) {
  const convertToGif = async () => {
    if (!videoPlayerState || !videoPlayerState.duration) {
      console.error("Invalid videoPlayerState or duration is undefined", videoPlayerState);
      onConversionEnd(false);
      return;
    }

    onConversionStart(true);

    const inputFileName = "input.mp4";
    const outputFileName = "output.gif";

    // 비디오 파일을 메모리로
    ffmpeg.FS("writeFile", inputFileName, await fetchFile(videoFile));

    const [min, max] = sliderValues;
    const minTime = sliderValueToVideoTime(videoPlayerState.duration, min);
    const maxTime = sliderValueToVideoTime(videoPlayerState.duration, max);

    console.log("FFmpeg Command: ", [
      "-i",
      inputFileName,
      "-ss",
      `${minTime}`,
      "-to",
      `${maxTime}`,
      "-f",
      "gif",
      outputFileName,
    ]);

    // 비디오를 자르고 gif로 
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

    console.log("FFmpeg Logs: ", ffmpeg.logs);

    // 파일 결과
    try {
      const data = ffmpeg.FS("readFile", outputFileName);

      // 이미지 URL로 변환
      const gifUrl = URL.createObjectURL(
        new Blob([data.buffer], { type: "image/gif" })
      );

      const link = document.createElement("a");
      link.href = gifUrl;
      link.setAttribute("download", "");
      link.click();
    } catch (error) {
      console.error("Error reading the output file: ", error);
    }

    // 종료
    onConversionEnd(false);
  };

  const onCutTheVideo = async () => {
    if (!videoPlayerState || !videoPlayerState.duration) {
      console.error("Invalid videoPlayerState or duration is undefined", videoPlayerState);
      onConversionEnd(false);
      return;
    }

    onConversionStart(true);

    const [min, max] = sliderValues;
    const minTime = sliderValueToVideoTime(videoPlayerState.duration, min);
    const maxTime = sliderValueToVideoTime(videoPlayerState.duration, max);

    const inputFileName = "input.mp4";
    const outputFileName = "output.mp4";

    ffmpeg.FS("writeFile", inputFileName, await fetchFile(videoFile));

    console.log("FFmpeg Command: ", [
      "-ss",
      `${minTime}`,
      "-i",
      inputFileName,
      "-t",
      `${maxTime}`,
      "-c",
      "copy",
      outputFileName,
    ]);

    await ffmpeg.run(
      "-ss",
      `${minTime}`,
      "-i",
      inputFileName,
      "-t",
      `${maxTime}`,
      "-c",
      "copy",
      outputFileName
    );

    console.log("FFmpeg Logs: ", ffmpeg.logs);

    try {
      const data = ffmpeg.FS("readFile", outputFileName);
      const dataURL = await readFileAsBase64(
        new Blob([data.buffer], { type: "video/mp4" })
      );

      const link = document.createElement("a");
      link.href = dataURL;
      link.setAttribute("download", "");
      link.click();
    } catch (error) {
      console.error("Error reading the output file: ", error);
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
}

export default VideoConversionButton;
