const sharp = require("sharp")
const { encode } = require("blurhash")
const fetch = require("node-fetch")
const util = require('util')

const AWS = require("aws-sdk")

const s3 = new AWS.S3()

exports.handler = async (event, context) => {

	const bucket = event.Records[0].s3.bucket.name
	const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '))
	const params = {
		Bucket: bucket,
		Key: key,
	}
	console.log("New image uploaded to S3. Attempting to process and push metadata to KV. Image key: ", key)

	try{

		const s3Image = await s3.getObject(params).promise()
		const image = sharp(s3Image.Body)
		const dimensions = await image.metadata().then(function (metadata) {
			return {
				width: metadata.width,
				height: metadata.height,
			}
		})

		const blurhash = await new Promise((resolve, reject) => {
			image
				.raw()
				.ensureAlpha()
				.resize(32, 32, { fit: "inside" })
				.toBuffer((err, buffer, { width, height }) => {
					if (err) reject(err);
					resolve(encode(new Uint8ClampedArray(buffer), width, height, 4, 4))
				})
		})

		const [name, type] = key.split(".")
		console.log("name: ", name)
		console.log("filetype: ", type)

		// { binding = "IMAGES_METADATA", id = "fd1b28da128a4b72a047529d4d74212d", preview_id = "2e8bb292bc394fa9b132ba62c1d60d3d" }
		// "https://api.cloudflare.com/client/v4/accounts/01a7362d577a6c3019a474fd6f485823/storage/kv/namespaces/0f2ac74b498b48028cb68387c421e279/values/My-Key"
		const masterRes = await fetch(`https://api.cloudflare.com/client/v4/accounts/4e177153b80f7ad8893de663f9fba0aa/storage/kv/namespaces/${process.env.KV_NAMESPACE_ID}/values/master`, {
			method: "GET",
			headers: {
				"Authorization": "Bearer " + process.env.CLOUDFLARE_API_TOKEN
			}
		})
		console.log("master response", masterRes)
		const master = await masterRes.json()
		console.log("master data .json", master)

		master[name] = {
			blurhash,
			dimensions,
			type
		}

		const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/4e177153b80f7ad8893de663f9fba0aa/storage/kv/namespaces/${process.env.KV_NAMESPACE_ID}/values/master`, {
			method: "PUT",
			headers: {
				"Authorization": "Bearer " + process.env.CLOUDFLARE_API_TOKEN,
				"Content-Type": "text/plain"
			},
			body: JSON.stringify(master)
		})
		const data = await response.json()
		if(!data.success){
			console.log(data)
			throw new Error(data)
		}

	} catch (err) {
		const message = `
		Lambda execution failed for image key: ${key}
		With the following error: ${util.inspect(err)}
		`
		throw new Error(message)
	}

	console.log(`Successfully uploaded ${key} metadata to KV`)
}
