import type { ThemeItem } from "@/types/theme";

export const themes: ThemeItem[] = [
  {
    id: "strawberry-ribbon",
    title: "딸기 리본",
    type: "free",
    price: 0,
    thumbnail: "/images/themes/strawberry-ribbon/thumb.gif",
    previewImages: [
      "/images/themes/strawberry-ribbon/preview-1.png",
      "/images/themes/strawberry-ribbon/preview-2.png",
    ],
    description: "말랑한 딸기우유 톤과 리본 포인트가 들어간 무료 테마",
    tags: ["핑크", "리본", "러블리"],
    isPublished: true,
    downloadFileName: "strawberry-ribbon.zip",
    createdAt: "2026-03-19",
    badge: "인기",
    downloads: 128,
    likes: 42,
    platforms: ["ios", "android"],
    detailHtml: `
  <h3>테마 소개</h3>
  <p>
    밀크 하트 테마는 부드러운 우유빛 핑크와 작은 하트 포인트를 중심으로 제작된 테마입니다.
    채팅방, 친구목록, 더보기 화면까지 전체 톤이 자연스럽게 이어지도록 구성했습니다.
  </p>

  <img src="/images/themes/milk-heart/detail-1.png" alt="밀크 하트 상세 이미지 1" />

  <h3>구성 화면</h3>
  <p>
    기본 버전과 하트 강조 버전 중 원하는 스타일을 선택할 수 있으며,
    기종 및 OS 버전에 따라 일부 화면 차이가 있을 수 있습니다.
  </p>

  <img src="/images/themes/milk-heart/detail-2.png" alt="밀크 하트 상세 이미지 2" />
  <img src="/images/themes/milk-heart/detail-3.png" alt="밀크 하트 상세 이미지 3" />

  <blockquote>
    테마 적용 전 기존 설정 백업을 권장합니다.
  </blockquote>
`,
  },
  {
    id: "butter-bear",
    title: "버터 베어",
    type: "free",
    price: 0,
    thumbnail: "/images/themes/butter-bear/thumb.gif",
    previewImages: [
      "/images/themes/butter-bear/preview-1.png",
      "/images/themes/butter-bear/preview-2.png",
    ],
    description: "포근한 크림 톤과 곰돌이 포인트가 들어간 무료 테마",
    tags: ["곰돌이", "크림", "포근한"],
    isPublished: true,
    downloadFileName: "butter-bear.zip",
    createdAt: "2026-03-19",
    badge: "신상",
    downloads: 76,
    likes: 31,
    platforms: ["ios", "android"],
    detailHtml: `
  <h3>테마 소개</h3>
  <p>
    밀크 하트 테마는 부드러운 우유빛 핑크와 작은 하트 포인트를 중심으로 제작된 테마입니다.
    채팅방, 친구목록, 더보기 화면까지 전체 톤이 자연스럽게 이어지도록 구성했습니다.
  </p>

  <img src="/images/themes/milk-heart/detail-1.png" alt="밀크 하트 상세 이미지 1" />

  <h3>구성 화면</h3>
  <p>
    기본 버전과 하트 강조 버전 중 원하는 스타일을 선택할 수 있으며,
    기종 및 OS 버전에 따라 일부 화면 차이가 있을 수 있습니다.
  </p>

  <img src="/images/themes/milk-heart/detail-2.png" alt="밀크 하트 상세 이미지 2" />
  <img src="/images/themes/milk-heart/detail-3.png" alt="밀크 하트 상세 이미지 3" />

  <blockquote>
    테마 적용 전 기존 설정 백업을 권장합니다.
  </blockquote>
`,
  },
  {
    id: "milk-heart",
    title: "밀크 하트",
    type: "signature",
    price: 2500,
    setPrice: 7500,
    setBonusCount: 1,
    thumbnail: "/images/themes/milk-heart/thumb.gif",
    previewImages: [
      "/images/themes/milk-heart/preview-1.png",
      "/images/themes/milk-heart/preview-2.png",
    ],
    description: "말랑한 우유빛 핑크와 하트 포인트가 담긴 시그니처 테마",
    tags: ["핑크", "하트", "러블리"],
    isPublished: true,
    downloadFileName: "milk-heart.zip",
    createdAt: "2026-03-23",
    platforms: ["ios", "android"],
    versions: [
      { label: "기본 버전", value: "basic" },
      { label: "리본 버전", value: "ribbon" },
      { label: "하트 버전", value: "heart" },
    ],
    detailHtml: `
    <h3>테마 소개</h3>
    <p>밀크 하트 테마는 부드러운 우유빛 핑크와 하트 포인트를 중심으로 제작된 테마입니다.</p>
  `,
    badge: "BEST",
    likes: 12,
  },
  {
    id: "cherry-note",
    title: "체리 노트",
    type: "signature",
    price: 3200,
    thumbnail: "/images/themes/cherry-note/thumb.gif",
    previewImages: [
      "/images/themes/cherry-note/preview-1.png",
      "/images/themes/cherry-note/preview-2.png",
    ],
    description: "체리와 다이어리 무드를 담은 시그니처 테마",
    tags: ["체리", "다꾸", "다이어리"],
    isPublished: true,
    downloadFileName: "cherry-note.zip",
    createdAt: "2026-03-19",
    badge: "베스트",
    likes: 67,
    platforms: ["ios", "android"],
    detailHtml: `
  <h3>테마 소개</h3>
  <p>
    밀크 하트 테마는 부드러운 우유빛 핑크와 작은 하트 포인트를 중심으로 제작된 테마입니다.
    채팅방, 친구목록, 더보기 화면까지 전체 톤이 자연스럽게 이어지도록 구성했습니다.
  </p>

  <img src="/images/themes/milk-heart/detail-1.png" alt="밀크 하트 상세 이미지 1" />

  <h3>구성 화면</h3>
  <p>
    기본 버전과 하트 강조 버전 중 원하는 스타일을 선택할 수 있으며,
    기종 및 OS 버전에 따라 일부 화면 차이가 있을 수 있습니다.
  </p>

  <img src="/images/themes/milk-heart/detail-2.png" alt="밀크 하트 상세 이미지 2" />
  <img src="/images/themes/milk-heart/detail-3.png" alt="밀크 하트 상세 이미지 3" />

  <blockquote>
    테마 적용 전 기존 설정 백업을 권장합니다.
  </blockquote>
`,
  },
  {
    id: "cloud-bunny",
    title: "구름 토끼",
    type: "free",
    price: 0,
    thumbnail: "/images/themes/cloud-bunny/thumb.gif",
    previewImages: [
      "/images/themes/cloud-bunny/preview-1.png",
      "/images/themes/cloud-bunny/preview-2.png",
    ],
    description: "보송한 하늘빛 배경과 토끼 일러스트가 어우러진 무료 테마",
    tags: ["하늘", "토끼", "몽글"],
    isPublished: true,
    downloadFileName: "cloud-bunny.zip",
    createdAt: "2026-03-20",
    badge: "인기",
    downloads: 143,
    likes: 49,
    platforms: ["ios", "android"],
    detailHtml: `
  <h3>테마 소개</h3>
  <p>
    밀크 하트 테마는 부드러운 우유빛 핑크와 작은 하트 포인트를 중심으로 제작된 테마입니다.
    채팅방, 친구목록, 더보기 화면까지 전체 톤이 자연스럽게 이어지도록 구성했습니다.
  </p>

  <img src="/images/themes/milk-heart/detail-1.png" alt="밀크 하트 상세 이미지 1" />

  <h3>구성 화면</h3>
  <p>
    기본 버전과 하트 강조 버전 중 원하는 스타일을 선택할 수 있으며,
    기종 및 OS 버전에 따라 일부 화면 차이가 있을 수 있습니다.
  </p>

  <img src="/images/themes/milk-heart/detail-2.png" alt="밀크 하트 상세 이미지 2" />
  <img src="/images/themes/milk-heart/detail-3.png" alt="밀크 하트 상세 이미지 3" />

  <blockquote>
    테마 적용 전 기존 설정 백업을 권장합니다.
  </blockquote>
`,
  },
  {
    id: "peach-check",
    title: "피치 체크",
    type: "free",
    price: 0,
    thumbnail: "/images/themes/peach-check/thumb.gif",
    previewImages: [
      "/images/themes/peach-check/preview-1.png",
      "/images/themes/peach-check/preview-2.png",
    ],
    description: "복숭아빛 체크 패턴과 심플한 아이콘이 조화로운 무료 테마",
    tags: ["복숭아", "체크", "심플"],
    isPublished: true,
    downloadFileName: "peach-check.zip",
    createdAt: "2026-03-20",
    badge: "신상",
    downloads: 92,
    likes: 27,
    platforms: ["ios", "android"],
    detailHtml: `
  <h3>테마 소개</h3>
  <p>
    밀크 하트 테마는 부드러운 우유빛 핑크와 작은 하트 포인트를 중심으로 제작된 테마입니다.
    채팅방, 친구목록, 더보기 화면까지 전체 톤이 자연스럽게 이어지도록 구성했습니다.
  </p>

  <img src="/images/themes/milk-heart/detail-1.png" alt="밀크 하트 상세 이미지 1" />

  <h3>구성 화면</h3>
  <p>
    기본 버전과 하트 강조 버전 중 원하는 스타일을 선택할 수 있으며,
    기종 및 OS 버전에 따라 일부 화면 차이가 있을 수 있습니다.
  </p>

  <img src="/images/themes/milk-heart/detail-2.png" alt="밀크 하트 상세 이미지 2" />
  <img src="/images/themes/milk-heart/detail-3.png" alt="밀크 하트 상세 이미지 3" />

  <blockquote>
    테마 적용 전 기존 설정 백업을 권장합니다.
  </blockquote>
`,
  },
  {
    id: "mint-rabbit",
    title: "민트 래빗 다이어리",
    type: "free",
    price: 0,
    thumbnail: "/images/themes/mint-rabbit/thumb.gif",
    previewImages: [
      "/images/themes/mint-rabbit/preview-1.png",
      "/images/themes/mint-rabbit/preview-2.png",
    ],
    description: "민트 컬러와 다이어리 낙서 무드를 담은 산뜻한 무료 테마",
    tags: ["민트", "토끼", "다꾸"],
    isPublished: true,
    downloadFileName: "mint-rabbit.zip",
    createdAt: "2026-03-21",
    badge: "추천",
    downloads: 65,
    likes: 24,
    platforms: ["ios", "android"],
    detailHtml: `
  <h3>테마 소개</h3>
  <p>
    밀크 하트 테마는 부드러운 우유빛 핑크와 작은 하트 포인트를 중심으로 제작된 테마입니다.
    채팅방, 친구목록, 더보기 화면까지 전체 톤이 자연스럽게 이어지도록 구성했습니다.
  </p>

  <img src="/images/themes/milk-heart/detail-1.png" alt="밀크 하트 상세 이미지 1" />

  <h3>구성 화면</h3>
  <p>
    기본 버전과 하트 강조 버전 중 원하는 스타일을 선택할 수 있으며,
    기종 및 OS 버전에 따라 일부 화면 차이가 있을 수 있습니다.
  </p>

  <img src="/images/themes/milk-heart/detail-2.png" alt="밀크 하트 상세 이미지 2" />
  <img src="/images/themes/milk-heart/detail-3.png" alt="밀크 하트 상세 이미지 3" />

  <blockquote>
    테마 적용 전 기존 설정 백업을 권장합니다.
  </blockquote>
`,
  },
  {
    id: "soda-cat",
    title: "소다 캣",
    type: "signature",
    price: 2900,
    thumbnail: "/images/themes/soda-cat/thumb.gif",
    previewImages: [
      "/images/themes/soda-cat/preview-1.png",
      "/images/themes/soda-cat/preview-2.png",
    ],
    description:
      "톡 쏘는 블루 소다 컬러와 고양이 포인트가 귀여운 시그니처 테마",
    tags: ["고양이", "블루", "청량"],
    isPublished: true,
    downloadFileName: "soda-cat.zip",
    createdAt: "2026-03-20",
    badge: "추천",
    likes: 53,
    platforms: ["ios", "android"],
    detailHtml: `
  <h3>테마 소개</h3>
  <p>
    밀크 하트 테마는 부드러운 우유빛 핑크와 작은 하트 포인트를 중심으로 제작된 테마입니다.
    채팅방, 친구목록, 더보기 화면까지 전체 톤이 자연스럽게 이어지도록 구성했습니다.
  </p>

  <img src="/images/themes/milk-heart/detail-1.png" alt="밀크 하트 상세 이미지 1" />

  <h3>구성 화면</h3>
  <p>
    기본 버전과 하트 강조 버전 중 원하는 스타일을 선택할 수 있으며,
    기종 및 OS 버전에 따라 일부 화면 차이가 있을 수 있습니다.
  </p>

  <img src="/images/themes/milk-heart/detail-2.png" alt="밀크 하트 상세 이미지 2" />
  <img src="/images/themes/milk-heart/detail-3.png" alt="밀크 하트 상세 이미지 3" />

  <blockquote>
    테마 적용 전 기존 설정 백업을 권장합니다.
  </blockquote>
`,
  },
  {
    id: "rose-lace",
    title: "로즈 레이스",
    type: "signature",
    price: 3500,
    thumbnail: "/images/themes/rose-lace/thumb.gif",
    previewImages: [
      "/images/themes/rose-lace/preview-1.png",
      "/images/themes/rose-lace/preview-2.png",
    ],
    description: "레이스와 로즈 장식이 더해진 우아한 무드의 시그니처 테마",
    tags: ["장미", "레이스", "빈티지"],
    isPublished: true,
    downloadFileName: "rose-lace.zip",
    createdAt: "2026-03-21",
    badge: "베스트",
    likes: 74,
    platforms: ["ios", "android"],
    detailHtml: `
  <h3>테마 소개</h3>
  <p>
    밀크 하트 테마는 부드러운 우유빛 핑크와 작은 하트 포인트를 중심으로 제작된 테마입니다.
    채팅방, 친구목록, 더보기 화면까지 전체 톤이 자연스럽게 이어지도록 구성했습니다.
  </p>

  <img src="/images/themes/milk-heart/detail-1.png" alt="밀크 하트 상세 이미지 1" />

  <h3>구성 화면</h3>
  <p>
    기본 버전과 하트 강조 버전 중 원하는 스타일을 선택할 수 있으며,
    기종 및 OS 버전에 따라 일부 화면 차이가 있을 수 있습니다.
  </p>

  <img src="/images/themes/milk-heart/detail-2.png" alt="밀크 하트 상세 이미지 2" />
  <img src="/images/themes/milk-heart/detail-3.png" alt="밀크 하트 상세 이미지 3" />

  <blockquote>
    테마 적용 전 기존 설정 백업을 권장합니다.
  </blockquote>
`,
  },
  {
    id: "night-jelly",
    title: "나이트 젤리",
    type: "signature",
    price: 3300,
    thumbnail: "/images/themes/night-jelly/thumb.gif",
    previewImages: [
      "/images/themes/night-jelly/preview-1.png",
      "/images/themes/night-jelly/preview-2.png",
    ],
    description: "어두운 밤하늘과 말랑한 젤리 포인트가 매력적인 시그니처 테마",
    tags: ["밤", "젤리", "보라"],
    isPublished: true,
    downloadFileName: "night-jelly.zip",
    createdAt: "2026-03-21",
    badge: "신상",
    likes: 46,
    platforms: ["ios", "android"],
    detailHtml: `
  <h3>테마 소개</h3>
  <p>
    밀크 하트 테마는 부드러운 우유빛 핑크와 작은 하트 포인트를 중심으로 제작된 테마입니다.
    채팅방, 친구목록, 더보기 화면까지 전체 톤이 자연스럽게 이어지도록 구성했습니다.
  </p>

  <img src="/images/themes/milk-heart/detail-1.png" alt="밀크 하트 상세 이미지 1" />

  <h3>구성 화면</h3>
  <p>
    기본 버전과 하트 강조 버전 중 원하는 스타일을 선택할 수 있으며,
    기종 및 OS 버전에 따라 일부 화면 차이가 있을 수 있습니다.
  </p>

  <img src="/images/themes/milk-heart/detail-2.png" alt="밀크 하트 상세 이미지 2" />
  <img src="/images/themes/milk-heart/detail-3.png" alt="밀크 하트 상세 이미지 3" />

  <blockquote>
    테마 적용 전 기존 설정 백업을 권장합니다.
  </blockquote>
`,
  },
];
