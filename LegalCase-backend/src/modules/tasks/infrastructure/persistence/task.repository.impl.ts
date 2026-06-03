import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TaskRepository } from '../../domain/ports/task.repository';
import { LegalTask } from '../../domain/entities/task.entity';
import { TaskDoc, TaskModel } from './task.schema';
@Injectable()
export class MongoTaskRepository extends TaskRepository {
  constructor(@InjectModel(TaskModel.name) private readonly model: Model<TaskDoc>) { super(); }
  private toDomain(d: TaskDoc): LegalTask {
    return new LegalTask(d.id, d.titulo, d.expedienteId, d.asignadoA, d.prioridad, d.fechaLimite, d.completada, (d as any).createdAt);
  }
  async findAll(asignadoA?: string): Promise<LegalTask[]> {
    const docs = await this.model.find(asignadoA ? { asignadoA } : {}).sort({ fechaLimite: 1 }).exec();
    return docs.map((d) => this.toDomain(d));
  }
  async create(t: Omit<LegalTask, 'id' | 'createdAt'>): Promise<LegalTask> {
    return this.toDomain(await this.model.create(t));
  }
  async toggle(id: string): Promise<LegalTask | null> {
    const doc = await this.model.findById(id).exec();
    if (!doc) return null;
    doc.completada = !doc.completada;
    await doc.save();
    return this.toDomain(doc);
  }
}
