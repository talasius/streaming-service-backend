import {
  BadRequestException,
  Injectable,
  type ArgumentMetadata,
  type PipeTransform,
} from '@nestjs/common';
import type { ReadStream } from 'fs';
import { validateFileFormat, validateFileSize } from '../utils/file.util';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  public async transform(value: any, metadata: ArgumentMetadata) {
    if (!value.filename) {
      throw new BadRequestException('No file uploaded');
    }

    const { filename, createReadStream } = value;

    const fileStream = createReadStream() as ReadStream;

    const allowedFormats = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    const isFileFormatValid = validateFileFormat(filename, allowedFormats);

    if (!isFileFormatValid) {
      throw new BadRequestException('File format is not supported');
    }

    const isFileSizeValid = await validateFileSize(
      fileStream,
      10 * 1024 * 1024,
    );

    if (!isFileSizeValid) {
      throw new BadRequestException('File size cannot exceed 10MB');
    }

    return value;
  }
}
