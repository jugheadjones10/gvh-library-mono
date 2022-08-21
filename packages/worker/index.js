import { Router } from "itty-router"
import getRowsFromSheet from "./googleSheetsApi"

// Create a new router
const router = Router();
const initialBooksCount = 30;

const allowedOrigins = ["https://gvh-library.netlify.app", "http://100.106.241.95:3000", "http://158.247.193.21:3000"]
router.get("*", function(req){
  const origin = req.headers.get("Origin")
  console.log("Origin: ", origin)
  if(allowedOrigins.includes(origin)){
    req.allowedOrigin = origin 
  }
})

router.get("/", () => {
  return new Response("Hello, world! This is the root page of your Worker template.")
})

router.get("/initial-books", async function(req, res) {
  let [rows, masterKey] = await Promise.all([
    getRowsFromSheet({ limit: initialBooksCount }),
    IMAGES_METADATA.get("master", { type: "json" })
  ]);

  rows = mergeData(rows, masterKey);

  const headers = {
    "Content-Type": "application/json",
"Access-Control-Allow-Origin": "*"
  }
  // if(req.allowedOrigin) headers["Access-Control-Allow-Origin"] = req.allowedOrigin
  return new Response(JSON.stringify(rows), { headers })
})

router.get("/books", async function(req, res) {
  let [rows, masterKey] = await Promise.all([
    getRowsFromSheet({ offset: initialBooksCount }),
    IMAGES_METADATA.get("master", { type: "json" })
  ])

  rows = mergeData(rows, masterKey);

  const headers = {
    "Content-Type": "application/json",
"Access-Control-Allow-Origin": "*"
  }

  // if(req.allowedOrigin) headers["Access-Control-Allow-Origin"] = req.allowedOrigin
  return new Response(JSON.stringify(rows), { headers })
})

// Merges book data from Google sheet with book image metadata stored in Cloudflare KV.
function mergeData(rows, masterKey) {
  console.log(rows)
  return rows
  // Filtering books that have a non-empty number and title, and have "1" set as its inventory value.
    .filter(x => x[0] && x[1] && x[5] === "1")
    .map(x => {
      const bookKey = x[0]
      const imageMeta = masterKey[bookKey]

      return {
        number: bookKey,
        title: x[1],
        category: x[2] || "No category",
        series: x[3] || "No series",
        language: x[4] || "Language undefined",
        inventory: x[5],
        comment: x[6],
        imageurl: imageMeta && `s3://gvh-library/${bookKey}.${imageMeta.type}`,
        width: imageMeta?.dimensions.width,
        height: imageMeta?.dimensions.height,
        blurhash: imageMeta?.blurhash
      }
    })
}

router.all("*", () => new Response("404, not found!", { status: 404 }));

addEventListener("fetch", e => {
  e.respondWith(
    router
    .handle(e.request)
    .catch(e => new Response(e.message || "Server Error", { status: 500 })) 
  )
})
