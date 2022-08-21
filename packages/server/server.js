var express = require("express");
var cors = require("cors");
var compression = require("compression");

const { GoogleSpreadsheet } = require("google-spreadsheet");

const { Server } = require("socket.io");
const http = require('http');

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8888;
}

const allowedOrigins = ["https://gvh-library.netlify.app", "http://100.106.241.95:3000", "http://158.247.193.21:3000"]

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/io", async function(req, res){
  console.log("TE") 
  io.emit('update', "new data");
  res.send("done")
})

app.post("/submit-books", async function (req, res) {

  const doc = new GoogleSpreadsheet("1nNDQKZe-uoZFLNqhw2vhGosfCYmNWAdjYIbZEyEO770")
  //The line break replace logic was recommended by the google-spreadsheet library here: https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication?id=service-account
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  });

  await doc.loadInfo();

  const sheet = doc.sheetsByTitle["Booklist"];
  const formSheet = doc.sheetsByTitle["Books Borrow responses"];

  const { home, books } = req.body;
  console.log("Books", books)
  console.log("Home", home)

  var requestedBookNumbers = books.map((book) => parseInt(book.number, 10));
  requestedBookNumbers.sort((a,b) => a - b)

  const rows = await sheet.getRows();
  const processedRows = rows.map(row => {
    return {
      rowNumber: row._rowNumber,
      bookNumber: row.Number 
   }
  })

  await Promise.all(requestedBookNumbers.map(async (bookNum) => {

    const { rowNumber } = processedRows.find(x => bookNum === parseInt(x.bookNumber, 10))
    await sheet.loadCells(rowNumber + ":" + rowNumber);
    const inventoryCell = sheet.getCell(rowNumber - 1, 5) 
    inventoryCell.value = 0
    await sheet.saveUpdatedCells()
    return bookNum

  }))

  io.emit('update', "new data");

  formSheet
    .addRow([
      new Date().toLocaleString("en-SG", { timeZone: "Asia/Singapore" }),
      home,
      ...requestedBookNumbers,
    ])

  res.send(true);
})

server.listen(port, () => console.log(`Example app listening on port ${port}!`));
