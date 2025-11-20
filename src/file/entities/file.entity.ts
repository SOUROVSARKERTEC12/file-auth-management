import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/user/entity/user.entity';

@Entity('files')
export class FileEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  filename: string;

  @Column()
  publicId: string; // cloudinary public_id

  @Column()
  url: string;

  @Column({ nullable: true })
  format: string; // jpg, png, pdf, mp4...

  @Column({ nullable: true })
  resourceType: string; // image, video, raw

  @Column({ type: 'int', nullable: true })
  size: number; // in bytes

  @Column({ nullable: true })
  folder: string;

  @Column({ nullable: true })
  userId: string;
  
  @ManyToOne(() => User, (user) => user.files, { nullable: true })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
