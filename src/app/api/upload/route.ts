import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: 'dtgg0qwou',
  api_key: '864138346948771',
  api_secret: '6yZE0YC8k17V2zJWROE9wwgJB-Y'
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create a promise to handle the upload
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'skillshare-platform',
          transformation: [
            { width: 500, height: 500, crop: 'fill' },
            { quality: 'auto' },
            { fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error || !result) {
            console.error('Cloudinary error:', error)
            resolve(NextResponse.json(
              { error: 'Error uploading to Cloudinary' },
              { status: 500 }
            ))
          } else {
            resolve(NextResponse.json({ url: result.secure_url }))
          }
        }
      ).end(buffer)
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Error processing upload' },
      { status: 500 }
    )
  }
}
