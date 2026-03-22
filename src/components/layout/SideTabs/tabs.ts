export type TabItem = {
  label: string;
  fullLabel: string;
  href: string;
  match: (pathname: string) => boolean;
};

export const tabs: TabItem[] = [
  {
    label: "홈",
    fullLabel: "홈",
    href: "/",
    match: (pathname) => pathname === "/",
  },
  {
    label: "무료 테마",
    fullLabel: "무료 테마",
    href: "/themes/free",
    match: (pathname) => pathname.startsWith("/themes/free"),
  },
  {
    label: "유료 테마",
    fullLabel: "유료 테마",
    href: "/themes/signature",
    match: (pathname) => pathname.startsWith("/themes/signature"),
  },
  {
    label: "마이페이지",
    fullLabel: "마이페이지",
    href: "/mypage",
    match: (pathname) => pathname.startsWith("/mypage"),
  },
];
