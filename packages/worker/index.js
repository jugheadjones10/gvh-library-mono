import { Router } from 'itty-router'
import getRowsFromSheet from "./googleSheetsApi" 
import { AwsClient } from 'aws4fetch'

// Create a new router
const router = Router()
const initialBooksCount = 30

const aws = new AwsClient({ accessKeyId: AWS_ACCESS_KEY_ID , secretAccessKey: AWS_SECRET_ACCESS_KEY  })
const LAMBDA_FN_API = 'https://lambda.ap-southeast-1.amazonaws.com/2015-03-31/functions'
const requestUrl = `${LAMBDA_FN_API}/new-age-lambda/invocations`
const cache = caches.default;

const updateCache = async () => {
  let response
  try{
    response = await aws.fetch(requestUrl, {
      method: "POST"
    })
    // Must use Response constructor to inherit all of response's fields
    response = new Response(response.body, response);
    //Approximately one year
    response.headers.append("Cache-Control", "s-maxage=771379200");
    console.log(response.body)

    cache.put(requestUrl, response.clone());
  }catch(e){
    console.log("AWS API RES ERROR", e)
  }
  const json = await response.json()
  return JSON.parse(json.body)
}


const getCacheIfNotUpdate = async () => {

  let returnedCache
  let response = await cache.match(requestUrl);

  if (!response) {
    returnedCache = await updateCache()
  } else {
    const json = await response.json()
    returnedCache = JSON.parse(json.body)
  }

  return returnedCache
}

const accessCache =  async (request) => {
  const cache = await getCacheIfNotUpdate()
  request.cachedMeta = cache
}

router.get("/test", async function (req, res) {

  var rows = await getRowsFromSheet({limit: 30}) 

  if(rows.length !== 0){
    rows  = await mapRowsNew(rows)
  }

  return new Response(JSON.stringify(rows), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  })
})

router.get("/initial-books", async function (req, res) {

  let [rows, masterKey] = await Promise.all([
    getRowsFromSheet({limit: 30}),
    IMAGES_METADATA.get("master", { type: "json" })
  ])

  if(rows.length !== 0){
    // rows  = await mapRows(rows, req.cachedMeta)
    rows = mapRowsNew(rows, masterKey)
  }

  await IMAGES_METADATA.put("master", JSON.stringify(masterKey))

  return new Response(JSON.stringify(rows), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  })
})


router.get("/books", async function (req, res) {

  let [rows, masterKey] = await Promise.all([
    getRowsFromSheet({offset: 30}),
    IMAGES_METADATA.get("master", { type: "json" })
  ])

  if(rows.length !== 0){
    rows  = mapRowsNew(rows, masterKey)
  }
  // console.log("master key", masterKey)

  // await IMAGES_METADATA.put("master", JSON.stringify(masterKey))

  return new Response(JSON.stringify(rows), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  })
});


function mapRowsNew(rows, masterKey){
  return rows
   .filter((x) => x && x[5] === "1" && x[0])
   .map((x) => {

     const key = x[0] 
  //    //Promise - access KV with key. If not in KV, imgUrl is null.

     const res = masterKey[key]

     return {
       title: x[1],
       number: x[0],
       imageurl: res ? `s3://gvh-library/${key}.${res.type}` : null,
       category: x[2] || "No category",
       series: x[3] || "No series",
       language: x[4] || "Language undefined",
       inventory: x[5],
       comment: x[6],
       width: res?.dimensions.width,
       height: res?.dimensions.height,
       blurhash: res?.blurhash
     };
   })


      // return IMAGES_METADATA.get(key, { type: "json" })
      //   .then(res => {
      //     // console.log(res)
      //     // console.log("FUCK")
      //     if(res){
      //       // console.log("THIS")
      //       masterKey[key] = res
      //       // console.log("Inside master", masterKey)
      //     }

      //     return {
      //       title: x[1],
      //       number: x[0],
      //       imageurl: res ? `s3://gvh-library/${key}.${res.type}` : null,
      //       category: x[2] || "No category",
      //       series: x[3] || "No series",
      //       language: x[4] || "Language undefined",
      //       inventory: x[5],
      //       comment: x[6],
      //       width: res?.dimensions.width,
      //       height: res?.dimensions.height,
      //       blurhash: res?.blurhash
      //     };
      //   })
}


async function mapRows(rows, cache) {
  //[Number, Title, Genre, Series, Language, Inventory, Comment, Image]
  return await Promise.all(
    rows
    .filter((x) => x && x[5] === "1" && x[0])
    .map(async (x) => {
      let imageProps;

      if (x[7] !== "-1") {
        const imageMeta = await getImageMeta(x[0] + ".png", cache) 
        console.log("IMage meta","KEY" + x[0],  imageMeta)

        const {
          dimensions: { width, height },
          blurhash,
        } = imageMeta;

        imageProps = {
          imageurl: "s3://" + "gvh-library/" + x[0] + ".png",
          width,
          height,
          blurhash,
        };
      }

      return {
        title: x[1],
        number: x[0],
        imageurl: imageProps ? imageProps.imageurl : null ,
        category: x[2] || "No category",
        series: x[3] || "No series",
        language: x[4] || "Language undefined",
        inventory: x[5],
        comment: x[6],
        width: imageProps? imageProps.width : null ,
        height: imageProps? imageProps.height : null,
        blurhash: imageProps? imageProps.blurhash : null 
      };
    })
  );
  //falsy values are forwarded to client
}

async function getImageMeta(key, cache){


  console.log("THE CACHE", cache[0])

  let found = cache[key]
  console.log("FOUND", found)
  if(found === undefined){
    const updatedCache = await updateCache() 
    found = updatedCache[key]
  }

  const [name, filetype] = key.split(".")
  console.log("name: ", name)
  console.log("filetype: ", filetype)
  found.type = filetype

  await IMAGES_METADATA.put(name, JSON.stringify(found))

  return found
}
/*
This route demonstrates path parameters, allowing you to extract fragments from the request
URL.


  /*
This is the last route we define, it will match anything that hasn't hit a route we've defined
above, therefore it's useful as a 404 (and avoids us hitting worker exceptions, so make sure to include it!).

Visit any page that doesn't exist (e.g. /foobar) to see it in action.
*/
router.all("*", () => new Response("404, not found!", { status: 404 }))

/*
This snippet ties our worker to the router we deifned above, all incoming requests
are passed to the router where your routes are called and the response is sent.
*/
addEventListener('fetch', (e) => {
  e.respondWith(router.handle(e.request))
})
