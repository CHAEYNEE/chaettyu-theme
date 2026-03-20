"use client";

import type { PointerEvent as ReactPointerEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * 커스텀 바깥 스크롤바 훅에서 받을 옵션 타입
 * - knobSize: 동그란 손잡이(knob)의 크기
 *
 * 이 값은 CSS 디자인용이 아니라,
 * "계산할 때도" 쓰는 값이라 꼭 필요함
 */
type UseOuterScrollbarOptions = {
  knobSize: number;
};

/**
 * 보드 바깥에 따로 만든 커스텀 스크롤바를
 * 실제 스크롤 영역과 동기화해주는 훅
 */
export default function useOuterScrollbar({
  knobSize,
}: UseOuterScrollbarOptions) {
  /**
   * 실제로 스크롤이 일어나는 div를 가리키는 ref
   * -> scrollTop, scrollHeight, clientHeight 등을 읽기 위해 필요
   */
  const scrollRef = useRef<HTMLDivElement | null>(null);

  /**
   * 바깥에 있는 스크롤 레일(track)을 가리키는 ref
   * -> 레일 높이를 계산하기 위해 필요
   */
  const railRef = useRef<HTMLDivElement | null>(null);

  /**
   * 실제 children 콘텐츠를 감싸는 div ref
   * -> 내부 콘텐츠 높이가 바뀌면 knob 위치도 다시 계산해야 해서 사용
   */
  const contentRef = useRef<HTMLDivElement | null>(null);

  /**
   * 현재 knob가 레일 위에서 얼마나 아래로 내려와 있는지(px)
   * 예: 0이면 맨 위, 50이면 50px 아래
   */
  const [knobTop, setKnobTop] = useState(0);

  /**
   * 지금 사용자가 knob를 드래그 중인지 여부
   * true일 때만 pointermove / pointerup 이벤트를 붙임
   */
  const [isDragging, setIsDragging] = useState(false);

  /**
   * 드래그 시작 시점의 정보를 저장해두는 ref
   * - startY: 드래그 시작 당시 마우스 Y 좌표
   * - startKnobTop: 드래그 시작 당시 knob 위치
   *
   * useState가 아니라 useRef를 쓴 이유:
   * 이 값은 화면에 바로 보여줄 상태가 아니라
   * 드래그 계산용 임시 저장값이기 때문
   */
  const dragStateRef = useRef({
    startY: 0,
    startKnobTop: 0,
  });

  /**
   * 실제 스크롤 위치(scrollTop)를 읽어서
   * 바깥 knob 위치(knobTop)로 변환해주는 함수
   *
   * 즉,
   * "내용이 얼마나 스크롤됐는지" -> "구슬이 레일에서 어디 있어야 하는지"
   * 로 바꿔주는 역할
   */
  const updateKnob = useCallback(() => {
    const scrollEl = scrollRef.current;
    const railEl = railRef.current;

    // 둘 중 하나라도 아직 DOM에 연결되지 않았으면 종료
    if (!scrollEl || !railEl) return;

    // 실제 스크롤 영역 정보
    const { scrollTop, scrollHeight, clientHeight } = scrollEl;

    // 바깥 레일 높이
    const railHeight = railEl.clientHeight;

    /**
     * knob가 움직일 수 있는 최대 거리
     * 예: 레일이 200px, knob가 20px이면
     * 실제로 움직일 수 있는 범위는 180px
     */
    const maxKnobTop = Math.max(0, railHeight - knobSize);

    /**
     * 실제 콘텐츠가 스크롤 가능한 최대 거리
     * 예: 콘텐츠 전체 높이 1000, 보이는 영역 400이면
     * 최대 스크롤 가능 거리는 600
     */
    const maxScrollTop = Math.max(0, scrollHeight - clientHeight);

    /**
     * 현재 실제 스크롤 비율을
     * knob 이동 비율로 그대로 환산
     *
     * 예:
     * scrollTop이 전체의 절반이면
     * knob도 레일의 절반쯤 내려오게 함
     */
    const nextKnobTop =
      maxScrollTop > 0 ? (scrollTop / maxScrollTop) * maxKnobTop : 0;

    /**
     * 너무 자잘한 소수점 변화까지 setState하지 않도록 방지
     * -> 불필요한 렌더링을 줄이기 위한 작은 최적화
     */
    setKnobTop((prev) =>
      Math.abs(prev - nextKnobTop) < 0.5 ? prev : nextKnobTop,
    );
  }, [knobSize]);

  /**
   * 반대로,
   * knob 위치를 기준으로 실제 스크롤 위치(scrollTop)를 계산하는 함수
   *
   * 즉,
   * "구슬을 여기로 옮겼다" -> "내용도 그 비율만큼 스크롤해라"
   */
  const scrollToKnobPosition = useCallback(
    (nextKnobTop: number) => {
      const scrollEl = scrollRef.current;
      const railEl = railRef.current;

      if (!scrollEl || !railEl) return;

      const railHeight = railEl.clientHeight;
      const maxKnobTop = Math.max(0, railHeight - knobSize);

      /**
       * knob가 레일 바깥으로 못 나가게 제한
       * 0 ~ maxKnobTop 사이로 강제 보정
       */
      const clampedKnobTop = Math.max(0, Math.min(nextKnobTop, maxKnobTop));

      /**
       * 실제 스크롤 가능한 최대 거리
       */
      const maxScrollTop = Math.max(
        0,
        scrollEl.scrollHeight - scrollEl.clientHeight,
      );

      /**
       * knob 위치 비율을 실제 scrollTop 비율로 변환
       */
      const nextScrollTop =
        maxKnobTop > 0 ? (clampedKnobTop / maxKnobTop) * maxScrollTop : 0;

      // 실제 스크롤 이동
      scrollEl.scrollTop = nextScrollTop;
    },
    [knobSize],
  );

  /**
   * "스크롤 영역 / 레일 / 콘텐츠 크기 변화"를 감지해서
   * knob 위치를 다시 계산하는 effect
   *
   * 이 effect가 하는 일:
   * 1. 처음 렌더 후 knob 위치 한 번 맞춤
   * 2. 스크롤되면 updateKnob 실행
   * 3. 창 크기 바뀌면 updateKnob 실행
   * 4. 내부 콘텐츠 높이 바뀌면 updateKnob 실행
   */
  useEffect(() => {
    const scrollEl = scrollRef.current;
    const railEl = railRef.current;
    const contentEl = contentRef.current;

    if (!scrollEl || !railEl) return;

    /**
     * 렌더 직후 바로 setState하면 lint 경고가 날 수 있어서
     * 다음 프레임에서 한 번 계산
     */
    const frameId = window.requestAnimationFrame(() => {
      updateKnob();
    });

    /**
     * 요소 크기가 바뀌는 걸 감지하는 브라우저 API
     * -> 보드 높이나 콘텐츠 높이가 바뀌면 knob도 다시 계산
     */
    const resizeObserver = new ResizeObserver(() => {
      updateKnob();
    });

    // 스크롤 영역, 레일, 콘텐츠 영역 크기 변화를 감시
    resizeObserver.observe(scrollEl);
    resizeObserver.observe(railEl);

    if (contentEl) {
      resizeObserver.observe(contentEl);
    }

    // 실제 스크롤이 일어나면 knob 위치 갱신
    scrollEl.addEventListener("scroll", updateKnob, { passive: true });

    // 창 크기가 바뀌어도 다시 계산
    window.addEventListener("resize", updateKnob);

    // cleanup: 컴포넌트 사라질 때 이벤트와 observer 해제
    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      scrollEl.removeEventListener("scroll", updateKnob);
      window.removeEventListener("resize", updateKnob);
    };
  }, [updateKnob]);

  /**
   * 드래그 중일 때만 전역 pointer 이벤트를 붙이는 effect
   *
   * 이유:
   * knob 위에서만 움직임을 감지하면
   * 마우스를 살짝 벗어나는 순간 드래그가 끊길 수 있음
   *
   * 그래서 window에 붙여서
   * 사용자가 끌고 가는 동안 안정적으로 추적
   */
  useEffect(() => {
    if (!isDragging) return;

    /**
     * 마우스가 얼마나 이동했는지(deltaY)를 계산해서
     * 시작 위치 + 이동 거리 = 새로운 knob 위치
     */
    const handlePointerMove = (event: PointerEvent) => {
      const deltaY = event.clientY - dragStateRef.current.startY;
      const nextKnobTop = dragStateRef.current.startKnobTop + deltaY;

      scrollToKnobPosition(nextKnobTop);
    };

    /**
     * 드래그 종료 처리
     * - dragging 상태 false
     * - 드래그 중 막아뒀던 텍스트 선택 / 커서 스타일 원복
     */
    const handlePointerUp = () => {
      setIsDragging(false);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isDragging, scrollToKnobPosition]);

  /**
   * 레일(track)을 클릭했을 때 실행되는 함수
   *
   * 사용자가 클릭한 Y 위치를 구해서,
   * knob의 "중앙"이 그 위치에 오도록 이동시킴
   */
  const handleRailPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const railEl = railRef.current;
      if (!railEl) return;

      // 레일의 화면상 위치 정보
      const rect = railEl.getBoundingClientRect();

      // 레일 맨 위를 기준으로, 클릭한 지점의 Y값
      const clickY = event.clientY - rect.top;

      // knob 중앙이 clickY에 오도록 반 칸 보정
      scrollToKnobPosition(clickY - knobSize / 2);
    },
    [knobSize, scrollToKnobPosition],
  );

  /**
   * knob를 직접 눌렀을 때 실행되는 함수
   *
   * 여기서는 실제로 움직이진 않고,
   * "드래그 시작 기준점"만 저장해둠
   */
  const handleKnobPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      // knob 클릭이 레일 클릭으로 전파되지 않도록 막음
      event.stopPropagation();

      /**
       * 드래그 시작 시점 저장
       * - 마우스 시작 위치
       * - knob 시작 위치
       */
      dragStateRef.current = {
        startY: event.clientY,
        startKnobTop: knobTop,
      };

      // 이제 드래그 시작
      setIsDragging(true);

      // 드래그 중 텍스트 선택되는 거 방지
      document.body.style.userSelect = "none";

      // 커서도 grabbing으로 바꿔서 UX 보강
      document.body.style.cursor = "grabbing";
    },
    [knobTop],
  );

  /**
   * BoardLayout에서 사용할 값들 반환
   * - ref들
   * - 현재 knob 위치
   * - 드래그 상태
   * - 클릭/드래그 핸들러
   */
  return {
    scrollRef,
    railRef,
    contentRef,
    knobTop,
    isDragging,
    handleRailPointerDown,
    handleKnobPointerDown,
  };
}
