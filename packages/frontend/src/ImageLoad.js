import React, { useState, useEffect } from "react";

import Skeleton from "@mui/material/Skeleton";

import { Blurhash } from "react-blurhash";

function ImageLoad({ bookHeight, blurhash, src }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // start loading original image
    const imageToLoad = new Image();
    imageToLoad.src = src;
    imageToLoad.onload = () => {
      // When image is loaded replace the src and set loading to false
      setLoading(false);
    };
  }, [src]);

 return loading ? (
    blurhash ? (
      <Blurhash hash={blurhash} width="100%" height={bookHeight} />
    ) : (
      <Skeleton variant="rectangular" height={300} />
    )
  ) : (
    <img width="100%" height={bookHeight} alt="hey" loading="lazy" src={src} />
  );
}
export default React.memo(ImageLoad);
