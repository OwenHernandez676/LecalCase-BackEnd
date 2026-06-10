import { ActivityRepository, NewActivity } from '../../domain/ports/activity.repository';
import { Activity } from '../../domain/entities/activity.entity';
import { ActivityDoc, ActivityModel } from './activity.schema';
export class MongoActivityRepository implements ActivityRepository {
  private toDomain(d: ActivityDoc): Activity {
    return new Activity(d.id, d.expedienteId, d.tipo, d.descripcion, d.autor, d.createdAt);
  }
  async findRecent(limit = 10): Promise<Activity[]> {
    const docs = await ActivityModel.find().sort({ createdAt: -1 }).limit(limit).exec();
    return docs.map((d) => this.toDomain(d));
  }
  async findByCase(expedienteId: string): Promise<Activity[]> {
    const docs = await ActivityModel.find({ expedienteId }).sort({ createdAt: -1 }).exec();
    return docs.map((d) => this.toDomain(d));
  }
  async create(a: NewActivity): Promise<Activity> {
    return this.toDomain(await ActivityModel.create(a));
  }
}
