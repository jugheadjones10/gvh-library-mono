const {
  GetObjectCommand,
  ListObjectsCommand,
  PutObjectCommand,
  S3Client,
} = require("@aws-sdk/client-s3");

const { GoogleSpreadsheet } = require("google-spreadsheet");

const stream = require("stream");
const { promisify } = require("util");
const fs = require("fs");
const got = require("got");

// Set the AWS Region.
const REGION = "ap-southeast-1"; //e.g. "us-east-1"
// // Create an Amazon S3 service client object.
const s3Client = new S3Client({ region: REGION });

const creds = require("./gvh-payment-6dc575018f50.json");
const doc = new GoogleSpreadsheet(
  "1BJsi1xvLsGy1udzRxKJMCFSryNcKn2k8CFwCfKPOY7A"
);

const pipeline = promisify(stream.pipeline);
async function downloadImage(url, name) {
  console.log(url);
  await pipeline(got.stream(url), fs.createWriteStream(name));
}

async function uploadPhotos() {
  await doc.useServiceAccountAuth(creds);
  await doc.loadInfo();
  const sheet = doc.sheetsByTitle["Booklist"];
  const formSheet = doc.sheetsByTitle["Books Borrow responses"];
  const rows = await sheet.getRows();
  const filteredRows = mapRows(rows);

  filteredRows.forEach(async ({ imageurl, number }) => {
    await downloadImage(imageurl, number);

    var fileStream = fs.createReadStream(number);
    var uploadParams = { Bucket: "gvh-library", Key: "", Body: "" };
    uploadParams.Body = fileStream;
    uploadParams.Key = number + ".png";

    // call S3 to retrieve upload file to specified bucket
    try {
      const results = await s3Client.send(new PutObjectCommand(uploadParams));
      console.log(
        "Successfully created " +
          uploadParams.Key +
          " and uploaded it to " +
          uploadParams.Bucket +
          "/" +
          uploadParams.Key
      );
      fs.unlink(number, (err) => {
        if (err) throw err;
        console.log(number + " was deleted");
      });
    } catch (err) {
      console.log("ERROR", err);
    }
  });
}

async function testWix() {
  await doc.useServiceAccountAuth(creds);
  await doc.loadInfo();
  const sheet = doc.sheetsByTitle["Booklist"];
  const formSheet = doc.sheetsByTitle["Books Borrow responses"];
  const rows = await sheet.getRows();

  const filteredRows = mapRows(rows);
  console.log("number of filtered Rows: " + rows);

  filteredRows.forEach(async ({ imageurl, number }) => {
    await downloadImage(imageurl, number);
    fs.unlink(number, (err) => {
      if (err) throw err;
      console.log(number + "was deleted");
    });
  });
}

async function getPhotos() {
  const bucketParams = {
    Bucket:
      "arn:aws:s3-object-lambda:ap-southeast-1:725446301671:accesspoint/image-metadata-adder",
    Key: "1.png",
  };
  try {
    const streamToString = (stream) =>
      new Promise((resolve, reject) => {
        const chunks = [];
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      });

    const data = await s3Client.send(new GetObjectCommand(bucketParams));
    const bodyContents = await streamToString(data.Body);
    console.log(JSON.parse(bodyContents));
    return data; // For unit tests.
  } catch (err) {
    console.log("Error", err);
  }
}

(async () => {
  await uploadPhotos();
})();

function mapRows(rows) {
  return rows
    .filter((x) => x && x.Image)
    .map((x) => {
      return {
        title: x["Book Title"],
        number: x.Number,
        imageurl: getImageUrl(x.Image),
      };
    });
  //falsy values are forwarded to client
}

function getImageUrl(url) {
  url = url.replace("wix:image://v1/", "");
  return (
    "https://static.wixstatic.com/media/" + url.substr(0, url.lastIndexOf("/"))
  );
}
