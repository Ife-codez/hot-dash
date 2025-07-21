import { v2 as cloudinary } from 'cloudinary'
import formidable from 'formidable'

export const config = {
  api: {
    bodyParser: false
  }
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

export default defineEventHandler(async (event) => {
  const form = formidable({ multiples: false })

  const [fields, files] = await new Promise((resolve, reject) => {
    form.parse(event.node.req, (err, fields, files) => {
      if (err) reject(err)
      else resolve([fields, files])
    })
  })

  const image = files.image?.filepath || files.image?.[0]?.filepath
  const uploaded = await cloudinary.uploader.upload(image)

  return { secure_url: uploaded.secure_url }
})


