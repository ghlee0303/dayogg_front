# PlayerPage refresh 구조 Report

**날짜:** 2026-07-06
**범위:** `pages/player/`, `contexts/PlayerContext.tsx`, `hooks/useSSE.ts`

---

## 배경

PlayerPage 로딩 흐름 변경(유저 존재 확인 후 `PlayerHeader` 유지 + 탭 영역만 로딩) 작업 중,
`playerFound` 상태를 리마운트 바깥으로 끌어올려야 하는 패턴이 반복되어 refresh 구조 전반을 점검했다.
현재 구조는 refresh SSE 완료 시 `refreshKey` 증가로 `<PlayerProvider key={refreshKey}>` 서브트리를
통째로 리마운트시켜 재조회를 유도하는 방식이다.

---

## 문제 요약

| 분류 | 건수 |
|------|------|
| 🔴 설계 결함 | 2 |
| 🟡 구조 개선 | 4 |
| 🟢 일관성·명명 | 1 |

**핵심 문제:** refresh 실패 시 복구 경로가 없어 탭 영역이 무한 로딩에 빠진다.

---

## 문제 목록

### 🔴 1. refresh 실패 시 무한 로딩

**위치:** `src/pages/player/index.tsx:sseRefresh`

**문제**
refresh SSE의 `onError`가 `console.log`뿐이다.

```tsx
onError: (error) => {
  console.log(error);
}
```

`CONTINUE` 상태에서 refresh SSE가 에러로 끝나면 `setRefreshKey`가 호출되지 않아
리마운트도 재조회도 일어나지 않는다. `isLoading`은 `onOkAction`(최종 OK)에서만 내려간다.

**영향**
탭 영역 스피너가 영원히 돈다. 사용자에게 에러 표시도, 복구 경로도 없다.

**개선 방향**
`onError`에서 `isLoading` 해제 + `apiError` 세팅(또는 토스트)으로 실패를 사용자에게 노출한다.

---

### 🔴 2. CONTINUE 무한 루프 가드 없음

**위치:** `src/pages/player/index.tsx:PlayerPageContent` (ssePlayerInfo onSuccess)

**문제**
서버가 `CONTINUE`를 반복해서 주면 아래 사이클이 무한 반복된다.

```
info → CONTINUE → refresh → 리마운트 → info → CONTINUE → …
```

최대 재시도 횟수나 타임아웃이 클라이언트에 없어 백엔드가 정상 동작한다는 가정에 전적으로 의존한다.

**영향**
백엔드 이상 시 무한 재조회 루프 발생. 사용자는 무한 로딩을 보고, 서버에는 불필요한 요청이 반복된다.

**개선 방향**
재시도 카운트(예: 3회)를 리마운트되지 않는 `PlayerPage`에 두고 초과 시 에러 처리한다.

---

### 🟡 3. 리마운트로 인한 UI 상태 손실

**위치:** `src/pages/player/index.tsx:PlayerPageContent`

**문제**
`activeTab`이 리마운트되는 `PlayerPageContent` 안에 있고, 시즌 선택도 리마운트 시
`initSeasonId`로 최신 시즌으로 리셋된다. 데이터만 갱신하고 싶은데 화면 상태까지
초기화되는 것은 key-리마운트 방식의 태생적 부작용이다.

**영향**
'실험체' 탭에서 전적 갱신을 누르면 갱신 후 '프로필' 탭으로 튕긴다.
시즌 셀렉터는 현재 주석 처리돼 있어 드러나지 않을 뿐, 복원 시 같은 문제가 발생한다.

**개선 방향**
단기적으로는 `activeTab`을 `PlayerPage`로 끌어올린다. 근본적으로는 6번(리마운트 제거)과 함께 해결된다.

---

### 🟡 4. 다른 유저로 이동 시 in-flight refresh 미정리

**위치:** `src/pages/player/index.tsx:PlayerPage`

**문제**
refresh SSE는 리마운트 바깥(`PlayerPage`)에 살아 있어, 진행 중에 다른 유저 페이지로
이동해도 정리되지 않는다. 이전 유저의 refresh 완료 메시지가 새 유저 화면에서
`refreshKey`를 올린다.

**영향**
새 유저에 대해 불필요한 리마운트·재조회가 한 번 더 발생한다.

**개선 방향**
`name` 변경 시 refresh SSE를 `disconnect`하거나, onMessage에서 요청 당시의 `name`과
현재 `name`을 비교해 불일치 시 무시한다.

---

### 🟡 5. 로딩 신호 이원화 (isRefreshing vs isLoading)

**위치:** `src/pages/player/index.tsx`, `src/pages/player/components/header/PlayerHeader.tsx`

**문제**
헤더 버튼은 `isRefreshing`(refresh SSE 연결 중)을 보는데, refresh 완료 후 info 재조회
구간에서는 `isRefreshing=false`가 된다. 탭 영역은 `isLoading=true`로 아직 로딩 중이다.

**영향**
갱신 사이클이 끝나기 전에 버튼이 "전적 갱신"으로 복귀해 재클릭이 가능하다.
중복 갱신 요청이 발생할 수 있다.

**개선 방향**
버튼 비활성 조건을 `isRefreshing || isLoading`으로 통합하거나, 갱신 사이클 전체를
아우르는 단일 로딩 상태로 합친다.

---

### 🟡 6. 리마운트 우회를 위한 상태 끌어올리기의 반복

**위치:** `src/pages/player/index.tsx:PlayerPage`

**문제**
`isLoading`, `playerFound`, `refreshKey`가 모두 "리마운트에서 살아남아야 해서"
`PlayerPage`에 올라가 있고, 각각 왜 거기 있는지 주석 설명이 필요한 상태다.
리마운트 방식이 React 상태 모델과 계속 충돌하고 있다는 신호이며, 상태가 하나
추가될 때마다 같은 패턴(끌어올리기 + setter prop 드릴링)이 반복된다.

**영향**
없음 (코드 품질). 다만 유지보수 비용이 상태 추가마다 누적된다.

**개선 방향**
key-리마운트를 버리고 `PlayerProvider`에 `refetch()`를 둔다. refresh 완료 시
`refetch()`로 `ssePlayerInfo`를 재실행하면 `isLoading`·`playerFound`를 Provider 안으로
되돌릴 수 있고, 탭/시즌 등 UI 상태도 자연 보존된다 (3번 함께 해결).

---

### 🟢 7. 미사용 파라미터

**위치:** `src/pages/player/index.tsx:sseRefresh`

**문제**
`onMessage: (event) => …`의 `event`가 사용되지 않아 TS 6133 경고가 발생한다.

**영향**
없음 (코드 품질).

**개선 방향**
`() => …`로 제거하거나 `_event`로 명명한다.

---

## 조치 우선순위

| 순위 | 항목 | 이유 |
|------|------|------|
| 1 | 🔴 1번 refresh 실패 시 무한 로딩 | 런타임 영향 있음 (복구 불가 상태) |
| 2 | 🔴 2번 CONTINUE 무한 루프 가드 없음 | 백엔드 이상 시 무한 재조회 |
| 3 | 🟡 3번 리마운트로 인한 UI 상태 손실 | 사용자 체감 UX 버그 (탭 튕김) |
| 4 | 🟡 6번 상태 끌어올리기의 반복 | 근본 구조 개선, 3번 동시 해결 |
| 5 | 🟡 4번 in-flight refresh 미정리 | 불필요 재조회 1회 수준 |
| 6 | 🟡 5번 로딩 신호 이원화 | 중복 요청 가능성 낮음 |
| 7 | 🟢 7번 미사용 파라미터 | 코드 일관성 |
