import React, { useEffect, useState, useRef } from 'react';
import ReactPlayer from 'react-player';
import './VideoPlayer.css';

export function VideoPlayer({
  src,
  onPlayerChange = () => {},
  onChange = () => {},
  startTime = undefined,
}) {
  const [source, setSource] = useState();
  const playerRef = useRef(null);

  useEffect(() => {
    if (src instanceof Blob) {
      const objectUrl = URL.createObjectURL(src);
      setSource(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else if (typeof src === 'string') {
      setSource(src);
    } else {
      console.error('src is not a valid Blob or URL string');
    }
  }, [src]);

  useEffect(() => {
    if (startTime !== undefined && playerRef.current) {
      playerRef.current.seekTo(startTime, 'seconds');
    }
  }, [startTime]);

  const handleProgress = (state) => {
    if (onChange) {
      onChange(state);
    }
  };

  return (
    <div className="video-player-container">
      <div className="video-player">
        <ReactPlayer
          ref={playerRef}
          url={source}
          controls
          width="100%"
          height="100%"
          onProgress={handleProgress}
          onReady={() => onPlayerChange(playerRef.current)}
        />
      </div>
    </div>
  );
}
