import { Controller, Get, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ImportService } from './import.service';

@Controller()
export class ImportController {
  constructor(private readonly importer: ImportService) {}

  @Get('import/demo/:skillId/inspect')
  inspectDemo(@Param('skillId') skillId: string) {
    return this.importer.inspectDemo(skillId);
  }

  @Get('import/demo/:skillId/install')
  installDemo(@Param('skillId') skillId: string) {
    return this.importer.installDemo(skillId);
  }

  @Post('import/inspect')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 50 * 1024 * 1024,
      },
    }),
  )
  async inspectZip(@UploadedFile() file?: Express.Multer.File) {
    if (!file?.buffer) return { ok: false };
    return this.importer.inspectZip(file.buffer);
  }

  @Post('import')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 50 * 1024 * 1024,
      },
    }),
  )
  async importZip(@UploadedFile() file?: Express.Multer.File) {
    if (!file?.buffer) return { ok: false };
    return this.importer.importZip(file.buffer);
  }
}
