export function formatPrice(price: number): string {
  if (price === 0) {
    return "무료";
  }

  return `${price.toLocaleString("ko-KR")}원`;
}
