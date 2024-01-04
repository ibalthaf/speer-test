import { Note } from 'src/notes/entities/note.entity';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserGender } from '../enums/gender.enum';
import { Share } from 'src/shares/entities/share.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({ type: 'varchar', length: 200, nullable: false })
  uid: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 40, nullable: false })
  email: string;

  @Column({ type: 'varchar', length: 200, nullable: false })
  password: string;

  @Column({
    type: 'enum',
    enum: UserGender,
    nullable: false,
    default: UserGender.UNSPECIFIED,
  })
  gender: string;

  @CreateDateColumn()
  @ApiProperty()
  created_at: Date;

  @UpdateDateColumn()
  @ApiProperty()
  updated_at: Date;

  @DeleteDateColumn()
  @ApiProperty()
  deleted_at: Date;

  @OneToMany(() => Note, (note) => note.user, { cascade: true })
  @ApiProperty()
  notes: Note[];

  @OneToMany(() => Share, (share) => share.toUser, { cascade: true })
  @ApiProperty()
  recievedShares: Share[];

  @OneToMany(() => Share, (share) => share.fromUser, { cascade: true })
  @ApiProperty()
  shared: Share[];
}
