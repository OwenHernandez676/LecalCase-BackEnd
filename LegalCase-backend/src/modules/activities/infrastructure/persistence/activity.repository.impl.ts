import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ActivityRepository } from '../../domain/ports/activity.repository';
import { Activity } from '../../domain/entities/activity.entity';
import { ActivityDoc, ActivityModel } from './activity.schema';
@Injectable()
export class MongoActivityRepository extends ActivityRepository {
  constructor(@InjectModel(ActivityModel.name) private readonly model: Model<ActivityDoc>) { super(); }
  private toDomain(d: ActivityDoc): Activity {
    return new Activity(d.id, d.expedienteId, d.tipo, d.descripcion, d.autor, (d as any).createdAt);
  }
  async findRecent(limit = 10): Promise<Activity[]> {
    const docs = await this.model.find().sort({ createdAt: -1 }).limit(limit).exec();
    return docs.map((d) => this.toDomain(d));
  }
  async findByCase(expedienteId: string): Promise<Activity[]> {
    const docs = await this.model.find({ expedienteId }).sort({ createdAt: -1 }).exec();
    return docs.map((d) => this.toDomain(d));
  }
  async create(a: Omit<Activity, 'id' | 'createdAt'>): Promise<Activity> {
    return this.toDomain(await this.model.create(a));
  }
}
