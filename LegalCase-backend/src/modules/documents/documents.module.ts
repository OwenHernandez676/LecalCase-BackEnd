import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DocumentModel, DocumentSchema } from './infrastructure/persistence/document.schema';
import { MongoDocumentRepository } from './infrastructure/persistence/document.repository.impl';
import { DocumentRepository } from './domain/ports/document.repository';
import { DocumentsController } from './infrastructure/controllers/documents.controller';
import { ListDocumentsUseCase } from './application/use-cases/list-documents.use-case';
import { UploadDocumentUseCase } from './application/use-cases/upload-document.use-case';
import { SignDocumentUseCase } from './application/use-cases/sign-document.use-case';
@Module({
  imports: [MongooseModule.forFeature([{ name: DocumentModel.name, schema: DocumentSchema }])],
  controllers: [DocumentsController],
  providers: [
    { provide: DocumentRepository, useClass: MongoDocumentRepository },
    ListDocumentsUseCase, UploadDocumentUseCase, SignDocumentUseCase,
  ],
})
export class DocumentsModule {}
