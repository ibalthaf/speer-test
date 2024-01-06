import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';
import { uuid } from '../../core/core.utils';
import { Note } from './note.entity';

@EventSubscriber()
export class NoteSubscriber implements EntitySubscriberInterface<Note> {
  constructor(dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return Note;
  }

  async beforeInsert(event: InsertEvent<Note>) {
    const { entity: instance } = event;
    instance.uid = uuid();
  }
}
