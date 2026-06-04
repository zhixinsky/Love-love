import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('post_media')
export class PostMediaEntity extends BaseEntity {
  @Column({ name: 'post_id', type: 'bigint' })
  postId: string;

  @Column({ name: 'media_type', type: 'tinyint', default: 1 })
  mediaType: number;

  @Column({ length: 500 })
  url: string;

  @Column({ type: 'int', default: 0 })
  sort: number;
}
