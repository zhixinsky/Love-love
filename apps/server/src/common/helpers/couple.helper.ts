import { Repository } from 'typeorm';
import { CoupleEntity } from '../../entities/couple.entity';

export async function findActiveCouple(
  coupleRepo: Repository<CoupleEntity>,
  userId: string,
): Promise<CoupleEntity | null> {
  return coupleRepo.findOne({
    where: [
      { userId, status: 1 },
      { partnerId: userId, status: 1 },
    ],
  });
}

export function getPartnerId(couple: CoupleEntity, userId: string): string | null {
  if (couple.userId === userId) return couple.partnerId;
  return couple.userId;
}
