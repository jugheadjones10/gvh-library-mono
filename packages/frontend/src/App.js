/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { styled, useTheme } from "@mui/material/styles";
import "./App.css";
//I use the emotion css prop UNLESS I need to use one of the custom attributes
//that can be accessed with sx.

import React, { useState, useEffect } from "react";

import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import useMediaQuery from "@mui/material/useMediaQuery";
import ShoppingBasketIcon from "@mui/icons-material/ShoppingBasket";
import Badge from "@mui/material/Badge";

import BrowsePanel from "./BrowsePanel";
import GuidelinesPanel from "./GuidelinesPanel";
import BookBasketPanel from "./BookBasketPanel";

function App() {
  const [value, setValue] = useState(0);
  const [bookBasket, setBookBasket] = useState([]);

  const theme = useTheme();
  const aboveMD = useMediaQuery(theme.breakpoints.up("md")) ? "md" : false;
  const aboveSM = useMediaQuery(theme.breakpoints.up("sm")) ? "sm" : false;
  const aboveXS = useMediaQuery(theme.breakpoints.up("xs")) ? "xs" : false;
  const imageWidth = useImageWidth(aboveMD, aboveSM, aboveXS);

  const handleChange = (event, newValue) => {
    setValue(newValue);
 };

  return (
    <Container maxWidth={aboveMD ? "md" : aboveSM ? "sm" : "xs"}>
      <Typography sx={{ color: "#64291B" }} variant="h3" m={3} align="center">
        GVH Library
      </Typography>

      <div css={{ position: "relative" }}>
        <Tabs value={value} onChange={handleChange} centered>
          <StyledTab label="Browse" />
          <StyledTab label="Guidelines" />
        </Tabs>
        <StyledBadge badgeContent={bookBasket.length} color="primary">
          <ShoppingBasketIcon
            onClick={() => {
              setValue(2);
            }}
            color={value === 2 ? "primary" : "action"}
            fontSize="large"
          />
        </StyledBadge>
      </div>
      <BrowsePanel
        value={value}
        index={0}
        bookBasket={bookBasket}
        setBookBasket={setBookBasket}
        setValue={setValue}
        imageWidth={imageWidth}
      />
      <GuidelinesPanel value={value} index={1} />
      <BookBasketPanel
        value={value}
        index={2}
        bookBasket={bookBasket}
        setBookBasket={setBookBasket}
        imageWidth={imageWidth}
      />
    </Container>
  );
}

const StyledBadge = styled(Badge)(({ theme }) => ({
  position: "absolute",
  right: 0,
  top: 0,
  "& .MuiBadge-badge": {
    top: 13,
    color: "white",
  },
}));

const StyledTab = styled(Tab)({
  textTransform: "none",
  fontWeight: "bold",
});

function useImageWidth(aboveMD, aboveSM, aboveXS) {
  const [imageWidth, setImageWidth] = useState(0)
  const widthObject = {
    md: 206,
    sm: 177,
    xs: 201,
  };

  useEffect(() => {
    const which = aboveMD || aboveSM || aboveXS;
    setImageWidth(widthObject[which])
  }, [aboveMD, aboveSM, aboveXS])

  return imageWidth
}

export default App;
