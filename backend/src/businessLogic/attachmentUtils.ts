import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')
import { createLogger } from '../utils/logger';

const XAWS = AWSXRay.captureAWS(AWS)


// TODO: Implement the fileStogare logic
const logger = createLogger('AttachmentUtils');

export class AttachmentUtils {
  static bucketName = process.env.ATTACHMENT_S3_BUCKET

  constructor(
    private readonly s3Client = createS3Client(),
    private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION
  ) {
  }

  async getUploadUrl(imageId: string) {
    logger.info("Getting a presigned url");
    return this.s3Client.getSignedUrl('putObject', {
      Bucket: AttachmentUtils.bucketName,
      Key: imageId,
      Expires: this.urlExpiration,
    })
  }

}

function createS3Client() {
  if (process.env.IS_OFFLINE) {
    logger.info('Creating a local S3 instance')
    return new XAWS.S3.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.S3({
    signatureVersion: 'v4'
  })
}