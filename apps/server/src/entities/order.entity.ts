import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('order')
export class OrderEntity extends BaseEntity {
  @Column({ name: 'order_no', length: 50, unique: true })
  orderNo: string;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Column({ name: 'product_type', type: 'tinyint', default: 1 })
  productType: number;

  @Column({ name: 'product_id', type: 'bigint', nullable: true })
  productId: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: string;

  @Column({ name: 'pay_status', type: 'tinyint', default: 0 })
  payStatus: number;

  @Column({ name: 'pay_channel', type: 'tinyint', nullable: true })
  payChannel: number | null;

  @Column({ name: 'pay_time', type: 'datetime', nullable: true })
  payTime: Date | null;
}
