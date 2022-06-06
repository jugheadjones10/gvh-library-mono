/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { styled } from "@mui/material/styles";
import "./App.css";
import "antd/dist/antd.css";

import React from "react";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckIcon from "@mui/icons-material/Check";

import bookPlaceholder from "./book-placeholder.png";
import ImageLoad from "./ImageLoad";

function BrowsePanelBook({
  book,
  imageWidth,
  bookBasketOnRemove,
  isChoosing,
  isChosen,
  onBookClicked,
}) {
  const bookStack = (
    <Stack>
      <ImageLoad
        bookHeight={
          book.imageurl ? (book.height / book.width) * imageWidth : null
        }
        bookWidth={book.imageurl ? imageWidth : null}
        blurhash={book.blurhash}
        src={
          book.imageurl
            ? processUrl(book.imageurl, imageWidth)
            : bookPlaceholder
        }
      />
      <Box
        sx={{
          color: "white",
          p: 1,
          bgcolor: "text.secondary",
        }}
      >
        {book.title}
      </Box>
   </Stack>
  )

  return (
    bookBasketOnRemove ?

     ( <div css={{ position: "relative" }}>
        <HoverableCancelIcon onClick={() => bookBasketOnRemove(book)} />
    <Stack>
      <ImageLoad
        bookHeight={
          book.imageurl ? (book.height / book.width) * imageWidth : null
        }
        blurhash={book.blurhash}
        src={
          book.imageurl
            ? processUrl(book.imageurl, imageWidth)
            : bookPlaceholder
        }
      />
      <Box
        sx={{
          color: "white",
          p: 1,
          bgcolor: "text.secondary",
        }}
      >
        {book.title}
      </Box>
    </Stack>
      </div>)
    :
    (<div
      onClick={() => {
        if (isChoosing) {
          onBookClicked(book);
        }
      }}
      css={{ position: "relative" }}
    >
      {isChoosing &&
          (isChosen(book.number) ? (
            <Box
              sx={{
                bgcolor: "text.secondary",
                position: "absolute",
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CheckIcon fontSize="large" css={{ color: "white" }} />
            </Box>
          ) : (
            <CheckBoxOutlineBlankIcon
             fontSize="large"
              css={{
                position: "absolute",
                color: "white",
                top: 10,
                left: 10,
              }}
            />
          ))}
      {bookStack}
    </div>)
  );
}
const HoverableCancelIcon = styled(CancelIcon)({
  position: "absolute",
  top: 1,
  left: 1,
  color: "white",
  "&:hover": { color: "black" },
});

function processUrl(url, width) {
  return `https://gvh-library.b-cdn.net/signature/width:${width}/resizing_type:fill/format:webp/plain/${encodeURIComponent(
    url
  )}`;
}

export default React.memo(BrowsePanelBook);
