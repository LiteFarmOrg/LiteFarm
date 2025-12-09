/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (userFarmController.js) is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

import express from "express";
import winston, { format } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { expressjwt } from "express-jwt";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import cors from "cors";

const { errors, json, combine, cli } = format;

// Add the error message as an enumerable property to return with res.json({ error })
const enumerateErrorMessage = format((info) => {
  if (info instanceof Error) {
    info.error = { message: info.message };
  }
  return info;
});

const logger = winston.createLogger({
  level: "info",
  format: combine(enumerateErrorMessage(), json()),
  defaultMeta: { service: "user-service" },
  transports: [
    new DailyRotateFile({ filename: "./logs/error.log", level: "error" }),
    new DailyRotateFile({ filename: "./logs/combined.log" }),
    new winston.transports.Console({
      level: "debug",
      format: combine(errors(), cli()),
    }),
  ],
});

const app = express();
const port = parseInt(process.env.PORT) || 5010;

function isTrue(value) {
  if (typeof value !== "string") return false;
  value = value.trim().toLowerCase();
  return value === "true" || value === "1" || value === "yes" || value === "on";
}

const s3ForcePathStyle = isTrue(process.env.S3_FORCE_PATH_STYLE);

const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
  forcePathStyle: s3ForcePathStyle,
});

//       const farm_token = createToken('farm', { user_id, farm_id, role_id: userFarm?.role_id });

app
  .use(cors())
  .use((req, res, next) => {
    const origin = process.env.HOME_PUBLIC_URL;
    res.header("Access-Control-Allow-Origin", origin);
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method === "OPTIONS") {
      res.header(
        "Access-Control-Allow-Methods",
        "PUT, POST, PATCH, DELETE, GET"
      );
      return res.status(200).json({});
    }
    next();
  })
  .use(
    expressjwt({
      secret: process.env.JWT_FARM_SECRET,
      algorithms: ["HS256"],
    })
  )
  .get("*", async (req, res) => {
    let key = req.url.substring(1);
    if (
      s3ForcePathStyle &&
      key.startsWith(process.env.S3_PRIVATE_BUCKET_NAME)
    ) {
      key = key.substring(process.env.S3_PRIVATE_BUCKET_NAME.length + 1); // remove bucket name with slash
    }
    if (!key.startsWith(req.auth.farm_id + "/")) {
      logger.warn("Unauthorized access to file: " + key);
      return res.status(403).send("Forbidden");
    }

    let s3Response;
    try {
      logger.verbose("Fetching object from S3: " + key);
      s3Response = await s3.send(
        new GetObjectCommand({
          Bucket: process.env.S3_PRIVATE_BUCKET_NAME,
          Key: key,
          ACL: "private",
        })
      );
    } catch (e) {
      logger.warn("Error fetching object from S3: " + e.message);
      return res.status(404).send("File not found");
    }
    if (!s3Response.Body) {
      logger.warn("S3 response body is empty");
      return res.status(404).send("File not found");
    }
    res.setHeader("Content-Type", s3Response.ContentType);
    res.setHeader("Content-Length", s3Response.ContentLength);
    res.setHeader(
      "Content-Disposition",
      `inline; filename=UTF8''${encodeURIComponent(key)}"`
    );
    s3Response.Body.pipe(res);
  });

app.listen(port, () => {
  logger.info("Server is running on port " + port);
});
