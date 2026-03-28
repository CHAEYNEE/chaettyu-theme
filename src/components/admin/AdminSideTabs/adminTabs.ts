export const adminTabs = [
  {
    href: "/admin",
    label: "대시보드",
    fullLabel: "관리자 대시보드",
    match: (pathname: string) => pathname === "/admin",
  },
  {
    href: "/admin/themes",
    label: "테마 관리",
    fullLabel: "관리자 테마 관리",
    match: (pathname: string) => pathname.startsWith("/admin/themes"),
  },
  {
    href: "/admin/purchases",
    label: "구매 내역",
    fullLabel: "관리자 구매 내역",
    match: (pathname: string) => pathname.startsWith("/admin/purchases"),
  },
  {
    href: "/admin/members",
    label: "회원 관리",
    fullLabel: "관리자 회원 관리",
    match: (pathname: string) => pathname.startsWith("/admin/members"),
  },
];
