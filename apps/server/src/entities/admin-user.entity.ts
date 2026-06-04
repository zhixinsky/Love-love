import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('admin_user')
export class AdminUserEntity extends BaseEntity {
  @Column({ length: 50, unique: true })
  username: string;

  @Column({ length: 255 })
  password: string;

  @Column({ length: 50, nullable: true })
  role: string;

  @Column({ type: 'tinyint', default: 1 })
  status: number;
}
