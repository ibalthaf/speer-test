import { Note } from 'src/notes/entities/note.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Share {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  fromUserId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  fromUser: User;

  @Column({ nullable: false })
  toUserId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  toUser: User;

  @Column({ nullable: false })
  noteId: number;

  @ManyToOne(() => Note, { onDelete: 'CASCADE' })
  note: Note;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
