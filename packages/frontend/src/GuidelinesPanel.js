/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import "./App.css";

import Container from "@mui/material/Container";
import React from "react";

function GuidelinesPanel({ value, index }) {
  return value === index && (
    <Container maxWidth="xs">
      <br></br>
      <h3 css={{textAlign: "center"}}>Guidelines for borrowing books</h3>
      <ol>
        <li>Do not damage books</li>
        <li>Return all books</li>
        <li>If there are any damages, report to Joseph/Philip</li>
        <li><b>Each home may borrow up to 20 books for 4 weeks</b></li>
      </ol>
      </Container>
  );
}

export default GuidelinesPanel;
