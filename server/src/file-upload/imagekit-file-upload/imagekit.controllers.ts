import ImageKit from "imagekit";
import {
  errorResponse,
  successResponse,
  successResponseArr,
  logger,
} from "@exyconn/common/server";

import { promises as fsPromises } from "fs";

const imagekit = new ImageKit({
  publicKey: "public_kgj5PULxw6pfjeO2IGwEVundBIQ=",
  privateKey: "private_n4IdSlg7DbXXn88rRAVqZhCgGVw=",
  urlEndpoint: "https://ik.imagekit.io/esdata1",
});

const imageKitUpload: any = async (req: any, res: any) => {
  try {
    // Check if files exist in the request
    if (!req?.files || Object.keys(req.files).length === 0) {
      logger.error("❌ No files found in request");
      return errorResponse(
        res,
        {
          error:
            'No files uploaded. Please attach files to your request with field name "file" or "files"',
        },
        "File not uploaded successfully",
      );
    }

    // Try to find files in common field names: 'file', 'files', 'image', 'images'
    const fileData =
      req.files.file ||
      req.files.files ||
      req.files.image ||
      req.files.images ||
      Object.values(req.files)[0];

    if (!fileData) {
      logger.error("❌ No file data found:", req.files);
      return errorResponse(
        res,
        {
          error:
            'File parameter not found. Use field name "file", "files", "image", or "images"',
        },
        "File not uploaded successfully",
      );
    }

    // Handle single file upload
    if (!Array.isArray(fileData)) {
      const { name, data, size, mimetype, tempFilePath } = fileData;

      // express-fileupload with useTempFiles: true uses tempFilePath
      let fileToUpload: any;

      if (tempFilePath) {
        // Use temp file path (express-fileupload saves to disk)
        fileToUpload = tempFilePath;
      } else if (data) {
        // Use data if available (in-memory)
        if (Buffer.isBuffer(data)) {
          fileToUpload = data;
        } else if (typeof data === "string") {
          fileToUpload = data;
        } else {
          fileToUpload = Buffer.from(data);
        }
      } else {
        logger.error("❌ No file data or temp path found");
        return errorResponse(
          res,
          { error: "File data is empty or corrupt" },
          "File not uploaded successfully",
        );
      }

      const uploadResponse = await imagekit.upload({
        file: fileToUpload,
        fileName: name,
        folder: "/suryansh",
      });

      // Clean up temp file if it exists
      if (tempFilePath) {
        try {
          await fsPromises.unlink(tempFilePath);
        } catch (err) {
          logger.warn("⚠️ Could not delete temp file:", err);
        }
      }

      return successResponseArr(
        res,
        [
          {
            fileId: uploadResponse?.fileId,
            size: uploadResponse?.size,
            fileName: {
              actual: name,
              uploadedName: uploadResponse?.name,
            },
            filePath: {
              filePath: uploadResponse?.filePath,
              fileUrl: uploadResponse?.url,
              thumbnailUrl: uploadResponse?.thumbnailUrl,
            },
            fileType: uploadResponse?.fileType,
          },
        ],
        {},
        "File uploaded successfully",
      );
    }

    const uploadPromises = fileData?.map(async (file: any, index: number) => {
      const { name, data, tempFilePath } = file;

      // Use temp file path or data
      let fileToUpload: any;

      if (tempFilePath) {
        fileToUpload = tempFilePath;
      } else if (data) {
        fileToUpload = Buffer.isBuffer(data) ? data : Buffer.from(data);
      } else {
        throw new Error(`File ${name} has no data or temp path`);
      }

      const uploadResponse = await imagekit.upload({
        file: fileToUpload,
        fileName: name,
        folder: "/suryansh",
      });

      // Clean up temp file if it exists
      if (tempFilePath) {
        try {
          await fsPromises.unlink(tempFilePath);
        } catch (err) {
          logger.warn(`⚠️ Could not delete temp file ${index + 1}:`, err);
        }
      }

      return {
        fileId: uploadResponse?.fileId,
        size: uploadResponse?.size,
        fileName: {
          actual: name,
          uploadedName: uploadResponse?.name,
        },
        filePath: {
          filePath: uploadResponse?.filePath,
          fileUrl: uploadResponse?.url,
          thumbnailUrl: uploadResponse?.thumbnailUrl,
        },
        fileType: uploadResponse?.fileType,
      };
    });

    const allUploadedFiles = await Promise.all(uploadPromises);
    return successResponseArr(
      res,
      allUploadedFiles,
      {},
      "All files uploaded successfully",
    );
  } catch (error: any) {
    logger.error("❌ ImageKit upload error:", error);
    return errorResponse(
      res,
      { error: error },
      "File not uploaded successfully",
    );
  }
};
export { imageKitUpload };
