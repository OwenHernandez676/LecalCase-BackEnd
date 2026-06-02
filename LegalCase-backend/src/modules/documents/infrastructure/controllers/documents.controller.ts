import {
  Body, Controller, Delete, Get, Inject, Param, Patch, Post,
  Query, UploadedFile, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../shared/guards/roles.guard';
import { Roles } from '../../../../shared/decorators/roles.decorator';
import { ObjectIdPipe } from '../../../../shared/pipes/object-id.pipe';
import { CurrentUser, CurrentUserPayload } from '../../../../shared/decorators/current-user.decorator';
import { DocumentRepository } from '../../domain/ports/document.repository';
import { UploadDocumentDto } from '../../application/dto/upload-document.dto';
import { ListDocumentsUseCase } from '../../application/use-cases/list-documents.use-case';
import { UploadDocumentUseCase } from '../../application/use-cases/upload-document.use-case';
import { SignDocumentUseCase } from '../../application/use-cases/sign-document.use-case';

const uploadsDir = process.env['UPLOADS_DIR'] ?? 'uploads';

@Controller('documents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentsController {
  constructor(
    private readonly listDocs: ListDocumentsUseCase,
    private readonly uploadDoc: UploadDocumentUseCase,
    private readonly signDoc: SignDocumentUseCase,
    @Inject(DocumentRepository) private readonly repo: DocumentRepository,
  ) {}

  @Get() @Roles('administrador', 'abogado', 'cliente')
  list(@Query('expedienteId') eId?: string) { return this.listDocs.execute(eId); }

  /** Subida real de archivo (multipart/form-data, campo "file"). */
  @Post() @Roles('administrador', 'abogado', 'cliente')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: uploadsDir,
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${unique}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 25 * 1024 * 1024 },
    }),
  )
  create(@Body() dto: UploadDocumentDto, @UploadedFile() file: Express.Multer.File) {
    return this.uploadDoc.execute(dto, file);
  }

  @Patch(':id/sign') @Roles('administrador', 'abogado', 'cliente')
  sign(@Param('id', ObjectIdPipe) id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.signDoc.execute(id, user.correo);
  }

  @Delete(':id') @Roles('administrador', 'abogado')
  remove(@Param('id', ObjectIdPipe) id: string) { return this.repo.remove(id); }
}
