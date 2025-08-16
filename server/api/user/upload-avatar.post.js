import { v2 as cloudinary } from 'cloudinary';
import formidable from 'formidable';
import { useMongooseModel } from '~/server/utils/useMongooseModel';
import fs from 'fs/promises';

const runtimeConfig = useRuntimeConfig();
cloudinary.config({
  cloud_name: runtimeConfig.cloudinaryCloudName,
  api_key: runtimeConfig.cloudinaryApiKey,
  api_secret: runtimeConfig.cloudinaryApiSecret,
});

export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  const form = formidable({
    multiples: false,
    maxFileSize: 5 * 1024 * 1024, // 5 MB
    filter: ({ mimetype }) => {
      return mimetype && mimetype.includes('image');
    }
  });

  try {
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(event.node.req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const file = files.avatar?.[0];
    if (!file) {
      throw createError({ statusCode: 400, statusMessage: 'No file uploaded' });
    }

    // Upload image to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(file.filepath, {
      folder: `user_avatars/${user._id}`,
      public_id: 'avatar',
    });
    
    // Clean up the temporary file
    await fs.unlink(file.filepath);

    // Find the user and update their avatar
    const User = useMongooseModel('User');
    const updatedUser = await User.findByIdAndUpdate(
      user.userId, // Use the user ID from the token, not the client
      { avatar: uploadResult.secure_url },
      { new: true, select: '-password' }
    );
    
    if (!updatedUser) {
      throw createError({ statusCode: 404, statusMessage: 'User not found' });
    }
    
    return { avatarUrl: updatedUser.avatar };

  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw createError({ statusCode: 500, statusMessage: 'Failed to upload image' });
  }
});