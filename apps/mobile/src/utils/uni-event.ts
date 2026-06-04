/** uni-app switch 组件 change 事件 */
export function readSwitchChecked(e: unknown): boolean {
  const ev = e as { detail?: { value?: boolean } };
  return Boolean(ev.detail?.value);
}
