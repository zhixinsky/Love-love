export function openNotificationTarget(item: {
  relatedType?: number;
  relatedId?: string | number;
}) {
  const id = item.relatedId;
  if (!id) return;
  if (item.relatedType === 1) {
    uni.navigateTo({ url: `/pages/post/detail?id=${id}` });
    return;
  }
  if (item.relatedType === 2) {
    uni.navigateTo({ url: `/pages/diary/detail?id=${id}` });
  }
}
