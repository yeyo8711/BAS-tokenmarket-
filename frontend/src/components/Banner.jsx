import React from "react";
import video from "../assets/bannervideo.mp4";

const Banner = () => {
  return (
    <div className="banner">
      <video
        src={video}
        width="600"
        height="200"
        controls={false}
        autoPlay
        loop
        muted
      ></video>
    </div>
  );
};

export default Banner;
