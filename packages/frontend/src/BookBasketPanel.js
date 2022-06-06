/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { styled } from "@mui/material/styles";
import "./App.css";

import React from "react";

import { useFormik } from "formik";
import * as Yup from "yup";
import Masonry from "react-masonry-css";
import ImageLoad from "./ImageLoad";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CancelIcon from "@mui/icons-material/Cancel";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import Backdrop from "@mui/material/Backdrop";
import { useTheme } from "@mui/material/styles";
import BrowsePanelBook from "./BrowsePanelBook";

const submissionEndpoint = process.env.NODE_ENV === "development"
      ? process.env.REACT_APP_DEV_FORM_SUBMISSION_API
      : process.env.REACT_APP_PRODUCTION_FORM_SUBMISSION_API

function BookBasketPanel({ value, index, bookBasket, setBookBasket, imageWidth }) {
  function onBookRemoved(book) {
    setBookBasket((x) => [...x.filter((y) => y.number !== book.number)]);
  }
  const theme = useTheme();

 const formik = useFormik({
    initialValues: { home: "" },
    validationSchema: Yup.object({
      home: Yup.string().required("Please input a value"),
    }),
    onSubmit: (values, { resetForm }) => {
      values["books"] = bookBasket;

      fetch(submissionEndpoint + "/submit-books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/html",
        },
        body: JSON.stringify(values, null, 2),
      })
        .then((success) => {
          if (success) {
            alert("Form successfully submitted");
          } else {
            alert("Error. Please try again");
          }
          formik.setSubmitting(false);
          setBookBasket([]);
          resetForm({ values: "" });
        })
        .catch((err) => {
          alert("My client error: " + err);
        });
    },
  });

  return (
    value === index && (
      <>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-start",
            m: 1,
            justifyContent: "center",
          }}
        >
          <form id="submitBooksForm" onSubmit={formik.handleSubmit}>
            <TextField
              id="home"
              {...formik.getFieldProps("home")}
              label="Name of Home"
              variant="outlined"
              size="small"
              margin="none"
              error={formik.touched.home && formik.errors.home ? true : false}
              helperText={
                formik.touched.home && formik.errors.home
                  ? formik.errors.home
                  : " "
              }
            />
          </form>

          <Button
            variant="contained"
            type="submit"
            disabled={formik.isSubmitting}
            form="submitBooksForm"
            sx={{
              color: "white",
              textTransform: "none",
              ml: 0.5,
              mr: 0.5,
              p: 1,
            }}
          >
            Submit Form
          </Button>
        </Box>
        <Masonry
          breakpointCols={{
            [theme.breakpoints.values.xl]: 4,
            [theme.breakpoints.values.md]: 3,
            [theme.breakpoints.values.sm]: 2,
          }}
          className="masonry"
          columnClassName="masonry-column"
          css={{ overflow: "visible" }}
        >
          {bookBasket.map((book) => (
            <BrowsePanelBook
              key={book.number}
              book={book}
              imageWidth={imageWidth}
             bookBasketOnRemove={onBookRemoved} 
            />
          ))}
        </Masonry>

        <Backdrop
          css={{
            color: "#fff",
          }}
          open={formik.isSubmitting}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      </>
    )
  );
}

export default BookBasketPanel;
