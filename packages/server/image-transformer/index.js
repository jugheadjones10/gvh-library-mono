console.log("Loading function");
const { S3 } = require("aws-sdk");
const axios = require("axios").default;
const sharp = require("sharp");
const { encode } = require("blurhash");


exports.handler = async (event, context) => {
  const s3 = new S3()

   const { getObjectContext } = event;
    const { outputRoute, outputToken, inputS3Url } = getObjectContext;

  // const bucketParams = {
  //   Bucket: "gvh-library",
  //   Key: event.pathParameters.key
  // };

  // const data = await s3.getObject(bucketParams).promise()
  // const image = sharp(data.Body);
  
  const { data } = await axios.get(inputS3Url, { responseType: 'arraybuffer' });
  const image = sharp(data)

  const dimensions = await image.metadata().then(function (metadata) {
    return {
      width: metadata.width,
      height: metadata.height,
    };
  });

  const blurhash = await new Promise((resolve, reject) => {
    image
      .raw()
      .ensureAlpha()
      .resize(32, 32, { fit: "inside" })
      .toBuffer((err, buffer, { width, height }) => {
        if (err) reject(err);
        resolve(encode(new Uint8ClampedArray(buffer), width, height, 4, 4));
      });
  });

  console.log("Dimensions : " + dimensions);
  console.log("Blurhash : " + blurhash);

  // return JSON.stringify({dimensions, blurhash})

   await s3.writeGetObjectResponse({
        RequestRoute: outputRoute,
        RequestToken: outputToken,
        Body: JSON.stringify({dimensions, blurhash}),
    }).promise();

    // Gracefully exit the Lambda function
    return { statusCode: 200 };
};
