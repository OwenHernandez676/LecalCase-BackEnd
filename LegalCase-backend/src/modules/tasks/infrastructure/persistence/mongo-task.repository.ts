import { NewTask, TaskRepository } from '../../domain/ports/task.repository';
import { LegalTask } from '../../domain/entities/task.entity';
import { TaskDoc, TaskModel } from './task.schema';
export class MongoTaskRepository implements TaskRepository {
  private toDomain(d: TaskDoc): LegalTask {
    return new LegalTask(d.id, d.titulo, d.expedienteId, d.asignadoA, d.prioridad, d.fechaLimite, d.completada, d.createdAt);
  }
  async findAll(asignadoA?: string): Promise<LegalTask[]> {
    const docs = await TaskModel.find(asignadoA ? { asignadoA } : {}).sort({ fechaLimite: 1 }).exec();
    return docs.map((d) => this.toDomain(d));
  }
  async create(t: NewTask): Promise<LegalTask> {
    return this.toDomain(await TaskModel.create(t));
  }
  async toggle(id: string): Promise<LegalTask | null> {
    const doc = await TaskModel.findById(id).exec();
    if (!doc) return null;
    doc.completada = !doc.completada;
    await doc.save();
    return this.toDomain(doc);
  }
}
