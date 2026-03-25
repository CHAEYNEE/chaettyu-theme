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
    tags: ["핑크", "리본", "러블리"],
    versions: [
      { label: "기본 버전", value: "basic" },
      { label: "리본 버전", value: "ribbon" },
      { label: "하트 버전", value: "heart" },
    ],
    isPublished: true,
    downloadFileName: "strawberry-ribbon.zip",
    createdAt: "2026-03-19",
    badge: "인기",
    downloadCount: 128,
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
    tags: ["곰돌이", "크림", "포근한"],
    isPublished: true,
    downloadFileName: "butter-bear.zip",
    createdAt: "2026-03-19",
    badge: "신상",
    downloadCount: 76,
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
      "/images/themes/milk-heart/preview-3.png",
    ],
    tags: ["핑크", "하트", "러블리"],
    isPublished: true,
    downloadFileName: "milk-heart.zip",
    createdAt: "2026-03-23",
    purchaseCount: 148,
    platforms: ["ios", "android"],
    versions: [
      { label: "기본 버전", value: "basic" },
      { label: "리본 버전", value: "ribbon" },
      { label: "하트 버전", value: "heart" },
    ],
    detailHtml: `
  <h3>AND</h3>
  <img src="/images/themes/milk-heart/detail-1.png" alt="밀크 하트 상세 이미지 1" />
  <br>
   <p>
┃적용화면┃
  </p>
  <br>
  <img src="/images/themes/milk-heart/detail-2.png" alt="밀크 하트 상세 이미지 2" />
   <br>
   <p>
┃채팅목록┃
  </p>
  <br>
  <img src="/images/themes/milk-heart/detail-3.png" alt="밀크 하트 상세 이미지 3" />
  <br>
   <p>
┃말풍선_초코비┃
  </p>
  <br>
  <img src="/images/themes/milk-heart/detail-4.png" alt="밀크 하트 상세 이미지 4" />
  <br>
   <p>
┃말풍선_푸딩┃
  </p>
  <br>
  <img src="/images/themes/milk-heart/detail-5.png" alt="밀크 하트 상세 이미지 5" />
  <br>
   <p>
┃말풍선_흰둥라이스┃
  </p>
  <br>
`,
    badge: "BEST",
    reviews: [
      {
        id: "review-1",
        author: "채뜌러버",
        rating: 5,
        content:
          "색감이 진짜 너무 부드럽고 귀여워요. 채팅방 볼 때마다 기분이 좋아져요!색감이 진짜 너무 부드럽고 귀여워요. 채팅방 볼 때마다 기분이 좋아져요!색감이 진짜 너무 부드럽고 귀여워요. 채팅방 볼 때마다 기분이 좋아져요!색감이 진짜 너무 부드럽고 귀여워요. 채팅방 볼 때마다 기분이 좋아져요!색감이 진짜 너무 부드럽고 귀여워요. 채팅방 볼 때마다 기분이 좋아져요!",
        createdAt: "2026.03.24",
        images: [
          "/images/themes/milk-heart/review-1.png",
          "/images/themes/milk-heart/review-2.png",
        ],
      },
      {
        id: "review-2",
        author: "우유핑크조아",
        rating: 4,
        content:
          "말풍선 버전 선택할 수 있어서 좋았어요. 디테일이 꽤 섬세한 느낌!",
        createdAt: "2026.03.23",
        images: [
          "/images/themes/milk-heart/review-1.png",
          "/images/themes/milk-heart/review-2.png",
        ],
      },
      {
        id: "review-3",
        author: "채뜌러버",
        rating: 5,
        content:
          "색감이 진짜 너무 부드럽고 귀여워요. 채팅방 볼 때마다 기분이 좋아져요!색감이 진짜 너무 부드럽고 귀여워요. 채팅방 볼 때마다 기분이 좋아져요!색감이 진짜 너무 부드럽고 귀여워요. 채팅방 볼 때마다 기분이 좋아져요!색감이 진짜 너무 부드럽고 귀여워요. 채팅방 볼 때마다 기분이 좋아져요!색감이 진짜 너무 부드럽고 귀여워요. 채팅방 볼 때마다 기분이 좋아져요!",
        createdAt: "2026.03.24",
        images: [
          "/images/themes/milk-heart/review-1.png",
          "/images/themes/milk-heart/review-2.png",
        ],
      },
      {
        id: "review-4",
        author: "채뜌러버",
        rating: 5,
        content:
          "색감이 진짜 너무 부드럽고 귀여워요. 채팅방 볼 때마다 기분이 좋아져요!색감이 진짜 너무 부드럽고 귀여워요. 채팅방 볼 때마다 기분이 좋아져요!색감이 진짜 너무 부드럽고 귀여워요. 채팅방 볼 때마다 기분이 좋아져요!색감이 진짜 너무 부드럽고 귀여워요. 채팅방 볼 때마다 기분이 좋아져요!색감이 진짜 너무 부드럽고 귀여워요. 채팅방 볼 때마다 기분이 좋아져요!",
        createdAt: "2026.03.24",
        images: [
          "/images/themes/milk-heart/review-1.png",
          "/images/themes/milk-heart/review-2.png",
        ],
      },
      {
        id: "review-5",
        author: "채뜌러버",
        rating: 5,
        content:
          "색감이 진짜 너무 부드럽고 귀여워요. 채팅방 볼 때마다 기분이 좋아져요!색감이 진짜 너무 부드럽고 귀여워요. 채팅방 볼 때마다 기분이 좋아져요!색감이 진짜 너무 부드럽고 귀여워요. 채팅방 볼 때마다 기분이 좋아져요!색감이 진짜 너무 부드럽고 귀여워요. 채팅방 볼 때마다 기분이 좋아져요!색감이 진짜 너무 부드럽고 귀여워요. 채팅방 볼 때마다 기분이 좋아져요!",
        createdAt: "2026.03.24",
        images: [
          "/images/themes/milk-heart/review-1.png",
          "/images/themes/milk-heart/review-2.png",
        ],
      },
      {
        id: "review-6",
        author: "째요니",
        rating: 5,
        content: "너무 이쁘고 이뻐용",
        createdAt: "2026.03.24",
        images: [
          "/images/themes/milk-heart/review-1.png",
          "/images/themes/milk-heart/review-2.png",
        ],
      },
      {
        id: "review-7",
        author: "째요니",
        rating: 5,
        content: "너무 이쁘고 이뻐용",
        createdAt: "2026.03.24",
        images: [
          "/images/themes/milk-heart/review-1.png",
          "/images/themes/milk-heart/review-2.png",
        ],
      },
      {
        id: "review-8",
        author: "째요니",
        rating: 5,
        content: "너무 이쁘고 이뻐용",
        createdAt: "2026.03.24",
        images: [
          "/images/themes/milk-heart/review-1.png",
          "/images/themes/milk-heart/review-2.png",
        ],
      },
      {
        id: "review-9",
        author: "째요니",
        rating: 5,
        content: "너무 이쁘고 이뻐용",
        createdAt: "2026.03.24",
        images: [
          "/images/themes/milk-heart/review-1.png",
          "/images/themes/milk-heart/review-2.png",
        ],
      },
      {
        id: "review-10",
        author: "째요니",
        rating: 5,
        content: "너무 이쁘고 이뻐용",
        createdAt: "2026.03.24",
        images: [
          "/images/themes/milk-heart/review-1.png",
          "/images/themes/milk-heart/review-2.png",
        ],
      },
      {
        id: "review-11",
        author: "예지니",
        rating: 5,
        content: "굿굿 아름다워요 존예",
        createdAt: "2026.03.24",
        images: [
          "/images/themes/milk-heart/review-1.png",
          "/images/themes/milk-heart/review-2.png",
        ],
      },
    ],
    qnas: [
      {
        id: "qna-1",
        author: "테마궁금해",
        question:
          "안드로이드에서도 동일하게 적용되나요?안드로이드에서도 동일하게 적용되나요?안드로이드에서도 동일하게 적용되나요?안드로이드에서도 동일하게 적용되나요?안드로이드에서도 동일하게 적용되나요?안드로이드에서도 동일하게 적용되나요?안드로이드에서도 동일하게 적용되나요?안드로이드에서도 동일하게 적용되나요?",
        answer:
          "기종별 지원 버전에 맞춰 적용 가능하지만, 일부 화면은 OS 버전에 따라 차이가 있을 수 있어요.",
        createdAt: "2026.03.24",
      },
      {
        id: "qna-2",
        author: "리본좋아",
        question: "세트 구매하면 증정 테마는 어떤 버전인가요?",
        answer: "세트 구매 시 별도로 안내된 증정용 테마가 함께 제공돼요.",
        createdAt: "2026.03.25",
      },
      {
        id: "qna-3",
        author: "리본좋아",
        question:
          "세트 구매하면 증정 테마는 어떤 버전인가요?세트 구매하면 증정 테마는 어떤 버전인가요?세트 구매하면 증정 테마는 어떤 버전인가요?세트 구매하면 증정 테마는 어떤 버전인가요?세트 구매하면 증정 테마는 어떤 버전인가요?",
        createdAt: "2026.03.25",
      },
      {
        id: "qna-4",
        author: "리본좋아",
        question: "세트 구매하면 증정 테마는 어떤 버전인가요?",
        answer: "세트 구매 시 별도로 안내된 증정용 테마가 함께 제공돼요.",
        createdAt: "2026.03.25",
      },
      {
        id: "qna-5",
        author: "리본좋아",
        question: "세트 구매하면 증정 테마는 어떤 버전인가요?",
        answer: "세트 구매 시 별도로 안내된 증정용 테마가 함께 제공돼요.",
        createdAt: "2026.03.25",
      },
      {
        id: "qna-6",
        author: "리본좋아",
        question: "세트 구매하면 증정 테마는 어떤 버전인가요?",
        answer: "세트 구매 시 별도로 안내된 증정용 테마가 함께 제공돼요.",
        createdAt: "2026.03.25",
      },
      {
        id: "qna-7",
        author: "리본좋아",
        question: "세트 구매하면 증정 테마는 어떤 버전인가요?",
        answer: "세트 구매 시 별도로 안내된 증정용 테마가 함께 제공돼요.",
        createdAt: "2026.03.25",
      },
      {
        id: "qna-8",
        author: "리본좋아",
        question: "세트 구매하면 증정 테마는 어떤 버전인가요?",
        answer: "세트 구매 시 별도로 안내된 증정용 테마가 함께 제공돼요.",
        createdAt: "2026.03.25",
      },
      {
        id: "qna-9",
        author: "리본좋아",
        question: "세트 구매하면 증정 테마는 어떤 버전인가요?",
        answer: "세트 구매 시 별도로 안내된 증정용 테마가 함께 제공돼요.",
        createdAt: "2026.03.25",
      },
      {
        id: "qna-10",
        author: "리본좋아",
        question: "세트 구매하면 증정 테마는 어떤 버전인가요?",
        answer: "세트 구매 시 별도로 안내된 증정용 테마가 함께 제공돼요.",
        createdAt: "2026.03.25",
      },
      {
        id: "qna-11",
        author: "궁금해요",
        question: "다운로드 문의",
        createdAt: "2026.03.25",
      },
    ],
  },
  {
    id: "cherry-note",
    title: "체리 노트",
    type: "signature",
    price: 3200,
    purchaseCount: 116,
    thumbnail: "/images/themes/cherry-note/thumb.gif",
    previewImages: [
      "/images/themes/cherry-note/preview-1.png",
      "/images/themes/cherry-note/preview-2.png",
    ],
    tags: ["체리", "다꾸", "다이어리"],
    isPublished: true,
    downloadFileName: "cherry-note.zip",
    createdAt: "2026-03-19",
    badge: "베스트",
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
    tags: ["하늘", "토끼", "몽글"],
    isPublished: true,
    downloadFileName: "cloud-bunny.zip",
    createdAt: "2026-03-20",
    badge: "인기",
    downloadCount: 143,
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
    tags: ["복숭아", "체크", "심플"],
    isPublished: true,
    downloadFileName: "peach-check.zip",
    createdAt: "2026-03-20",
    badge: "신상",
    downloadCount: 92,
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
    tags: ["민트", "토끼", "다꾸"],
    isPublished: true,
    downloadFileName: "mint-rabbit.zip",
    createdAt: "2026-03-21",
    badge: "추천",
    downloadCount: 65,
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
    purchaseCount: 57,
    thumbnail: "/images/themes/soda-cat/thumb.gif",
    previewImages: [
      "/images/themes/soda-cat/preview-1.png",
      "/images/themes/soda-cat/preview-2.png",
    ],
    tags: ["고양이", "블루", "청량"],
    isPublished: true,
    downloadFileName: "soda-cat.zip",
    createdAt: "2026-03-20",
    badge: "추천",
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
    purchaseCount: 89,
    thumbnail: "/images/themes/rose-lace/thumb.gif",
    previewImages: [
      "/images/themes/rose-lace/preview-1.png",
      "/images/themes/rose-lace/preview-2.png",
    ],
    tags: ["장미", "레이스", "빈티지"],
    isPublished: true,
    downloadFileName: "rose-lace.zip",
    createdAt: "2026-03-21",
    badge: "베스트",
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
    purchaseCount: 73,
    thumbnail: "/images/themes/night-jelly/thumb.gif",
    previewImages: [
      "/images/themes/night-jelly/preview-1.png",
      "/images/themes/night-jelly/preview-2.png",
    ],
    tags: ["밤", "젤리", "보라"],
    isPublished: true,
    downloadFileName: "night-jelly.zip",
    createdAt: "2026-03-21",
    badge: "신상",
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
