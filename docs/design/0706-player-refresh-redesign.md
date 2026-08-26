# PlayerPage refresh 구조 개선 상세 설계 Report

**날짜:** 2026-07-06
**범위:** `contexts/PlayerContext.tsx`, `pages/player/`, `contexts/StatisticsContext.tsx`, `contexts/RouteAuthContext.tsx`
**선행 문서:** [0706-player-refresh-report.md](./0706-player-refresh-report.md)

---

## 배경

선행 점검에서 key-리마운트 기반 refresh 구조의 문제 7건을 확인했다.
본 문서는 그중 중기 개선안 — **key-리마운트 제거 + `PlayerProvider` 중심의 갱신 상태 머신** —
의 상세 설계를 다룬다. 이 설계 하나로 선행 문서의 1·2·3·4·5·6번 문제가 함께 해결된다.

---

## 1. 설계 원칙

1. **리마운트로 상태를 지우지 않는다.** 데이터 리셋은 각 컨텍스트가 자기 책임으로 수행한다.
2. **갱신 사이클(info → CONTINUE → refresh → info → OK)의 상태 머신을 한 곳(PlayerContext)에 둔다.**
   현재는 `PlayerPage`(refreshKey·isLoading·playerFound) + `PlayerPageContent`(effect·statusAction) +
   `PlayerContext`(SSE)에 흩어져 있다.
3. **파생 데이터(통계·루트 인증)는 콜백 체인이 아니라 상태 변화를 구독해서 조회한다.**
   `onOkAction` 같은 명령형 체인 대신 `status === 'ready'`를 지켜보는 effect로 대체한다.

---

## 2. 구조 비교

### AS-IS

```
PlayerPage ──────────────── refreshKey / isLoading / playerFound / refresh SSE 보유
  └─ <PlayerProvider key={refreshKey}>     ← 갱신 = 서브트리 전체 리마운트
       └─ RouteAuthProvider
            └─ StatisticsProvider
                 └─ PlayerPageContent ──── ssePlayerInfo 호출·OK/CONTINUE 분기·onOkAction
```

### TO-BE

```
PlayerPage ──────────────── Provider 조립만 담당 (key 없음, 상태 없음)
  └─ PlayerProvider ──────── 갱신 상태 머신 전체 보유:
       │                      status / error / retryCount / info SSE / refresh SSE / refresh()
       └─ RouteAuthProvider ─ reset() 추가
            └─ StatisticsProvider ─ reset() 추가
                 └─ PlayerPageContent ─ status 기반 렌더 분기 +
                                        'ready' 구독 effect (통계·루트 인증 조회)
```

---

## 3. 상태 모델

### 3.1 status 정의

```ts
type PlayerLoadStatus =
  | 'searching'   // 최초 info 조회 중. 유저 존재 확인 전
  | 'syncing'     // CONTINUE 사이클 진행 중. 유저는 확인됨, 전적 데이터 준비 중
  | 'refreshing'  // 버튼 갱신 진행 중. 기존 데이터를 유지한 채 백그라운드 갱신
  | 'ready'       // 조회 완료
  | 'error'       // 조회 실패 (유저 없음, refresh 실패, 재시도 초과)
```

기존 `isLoading` / `playerFound` / `isRefreshing` 세 boolean이 status 하나로 통합된다.
(선행 문서 5번 "로딩 신호 이원화" 해결)

### 3.2 상태 전이

```
[name 변경] ─────────────────────────────→ searching (전체 리셋, retry=0, SSE 정리)

searching ─ info OK ────────────────────→ ready
searching ─ info CONTINUE (retry<MAX) ──→ syncing   (refresh SSE 시작, retry++)
searching ─ info 에러 ───────────────────→ error     (유저 없음 등)

syncing ── refresh 완료 ─────────────────→ (info 재조회, syncing 유지)
syncing ── info OK ─────────────────────→ ready
syncing ── info CONTINUE (retry<MAX) ───→ syncing   (retry++)
syncing ── CONTINUE (retry≥MAX) ────────→ error     (재시도 초과)
syncing ── refresh/info 에러 ────────────→ error

ready ─── refresh() 호출 ────────────────→ refreshing (refresh SSE 시작, retry=0)
refreshing ─ refresh 완료 ───────────────→ (info 재조회, refreshing 유지)
refreshing ─ info OK ───────────────────→ ready
refreshing ─ info CONTINUE (retry<MAX) ─→ refreshing (retry++)
refreshing ─ 에러/재시도 초과 ────────────→ error
```

- `MAX_CONTINUE_RETRY = 3` (상수). 초과 시 재시도 초과용 `ApiError`를 만들어 error 처리.
  (선행 문서 2번 "CONTINUE 무한 루프" 해결)
- refresh SSE `onError`는 error 전이 + `error` 세팅. `console.log`로 삼키지 않는다.
  (선행 문서 1번 "무한 로딩" 해결)
- v1 단순화: `refreshing` 중 에러도 error 전이로 통일한다. "기존 데이터 유지 + 토스트"가
  UX상 더 나으나 토스트 인프라 도입과 함께 후속 개선으로 미룬다.

### 3.3 렌더 매핑 (`PlayerPageContent.renderContent`)

| status | 화면 |
|--------|------|
| `error` | `PlayerError` 전체 |
| `searching` | `PlayerLoading` 전체 |
| `syncing` | `PlayerHeader` + 탭 영역 `PlayerLoading` |
| `refreshing` | `PlayerHeader`(버튼 스피너) + **기존 탭 콘텐츠 유지** |
| `ready` | `PlayerHeader` + 탭 콘텐츠 |

`refreshing`에서 기존 데이터를 계속 보여주는 것이 현재(전체 로딩)와 다른 점이자 UX 개선점이다.
직전 데이터는 유효한 값이므로 가리지 않는다.

---

## 4. 컨텍스트별 변경 설계

### 4.1 PlayerContext (핵심 변경)

```ts
interface PlayerContextValue {
  player: Player
  playerSeasonList: PlayerSeason[]
  latestSeasonId: number | null   // 신규: ready 구독 effect가 사용
  status: PlayerLoadStatus        // 신규: isLoading 대체
  error: ApiError | null          // 신규: 페이지의 apiError 상태 흡수
  findPlayerSeason: (seasonId: number | null) => PlayerSeason | undefined
  refresh: () => void             // 신규: 전적 갱신 버튼용
  // 제거: ssePlayerInfo (외부 노출 불필요 — name effect가 내부에서 호출)
}
```

**내부 구성:**

- `useSSE('player/sse/info')`와 `useSSE('player/sse/refresh')`를 **둘 다 Provider가 보유**한다.
  refresh SSE가 `PlayerPage`에서 내려온다. (선행 문서 4·6번의 전제 해소)
- `useEffect([name])`: 전체 리셋(player=default, error=null, retry=0, status='searching') 후
  두 SSE `disconnect()` → `loadInfo()` 시작. name이 바뀌면 진행 중이던 refresh는 즉시 폐기된다.
  (선행 문서 4번 "in-flight refresh 미정리" 해결)
- `loadInfo()`: info SSE 연결. onMessage에서 player/seasonList/latestSeasonId 세팅 후
  3.2의 전이 규칙대로 status 결정. CONTINUE면 `startRefresh(player.id)`.
- `startRefresh(playerId)`: refresh SSE 연결. onMessage → `loadInfo()` 재호출(리마운트 없음).
  onError → error 전이.
- `refresh()`: `status === 'refreshing' || status === 'syncing'`이면 무시(중복 클릭 가드),
  아니면 retry=0으로 초기화 후 'refreshing' 전이 + `startRefresh(player.id)`.

**제거되는 것:** `PlayerPage`의 `refreshKey`·`isLoading`·`playerFound`·`sseRefresh`와
설명 주석 전부, `PlayerPageContent`의 `ssePlayerInfo` effect·`statusAction`·`apiError` 상태,
setter prop 드릴링(`onLoadingChange`·`onPlayerFoundChange`). (선행 문서 6번 해결)

### 4.2 PlayerPageContent

역할이 "렌더 분기 + ready 구독"으로 축소된다.

```tsx
const { player, latestSeasonId, status, error, refresh } = usePlayer()

// ready가 될 때마다(최초 로드·갱신 완료 공통) 파생 데이터 조회
useEffect(() => {
  if (status !== 'ready' || !latestSeasonId) return
  const targetSeasonId = initSeasonId(latestSeasonId)
  getSeasonStatistics(player.id, targetSeasonId)
  getRouteAuth(player.id)
}, [status, player.id])
```

- 기존 `onOkAction` 콜백 체인을 대체한다. 갱신 완료 시에도 같은 effect가 다시 실행되어
  통계·루트 인증이 자연히 재조회된다.
- `initSeasonId`는 사용자가 시즌을 선택해 둔 경우(`seasonId != 0`) 그 값을 그대로 반환하므로,
  갱신 후에도 선택 시즌이 유지된다. `activeTab`도 리마운트가 없어 그대로 보존된다.
  (선행 문서 3번 "UI 상태 손실" 해결)

### 4.3 PlayerHeader

`refreshLoading`·`onRefresh` prop을 제거하고 `usePlayer()`에서 직접 읽는다
(이미 `usePlayer`를 사용 중이므로 자연스러움).

```tsx
const { player, playerSeasonList, status, refresh } = usePlayer()
const refreshLoading = status === 'refreshing' || status === 'syncing'
```

버튼 비활성 조건이 갱신 사이클 전체를 커버하게 된다. (선행 문서 5번 해결)

### 4.4 StatisticsContext / RouteAuthContext

리마운트가 사라지므로 name 변경 시 이전 유저의 데이터가 남는다. 각각 `reset()`을 추가한다.

- `StatisticsContext`: `reset()` → `setLocalized([])` (+ `useApi`의 data 초기화 필요 여부 확인)
- `RouteAuthContext`: `reset()` → `setRouteAuth(defaultValue)`
- 호출 지점: `PlayerPageContent`의 `useEffect([name])`에서 두 `reset()` 호출.
  (name 변경 직후 `status='searching'` → 전체 로딩 화면이므로 잔존 데이터가 노출될 틈은
  없지만, 상태 자체를 남기지 않는 것이 안전하다.)

### 4.5 SeasonContext

변경 없음. 리마운트 제거로 `seasonId`가 갱신 사이클을 자연히 통과하며,
`initSeasonId`의 기존 로직(선택값 우선)이 그대로 유효하다.
단, **다른 유저로 이동 시** 이전 유저의 선택 시즌이 남는 문제는 기존에도 존재하던
동작(URL `seasonId` 파라미터 유지)이므로 본 설계 범위 밖으로 둔다.

---

## 5. 시나리오 검증

| 시나리오 | 동작 |
|----------|------|
| 신규 유저 검색 (OK) | searching → ready. 전체 로딩 → 헤더+콘텐츠 |
| 신규 유저 검색 (CONTINUE) | searching → syncing → (refresh→info) → ready. 유저 확인 후 헤더 유지 + 탭 로딩 |
| 유저 없음 | searching → error → `PlayerError` |
| 전적 갱신 버튼 | ready → refreshing → ready. 기존 콘텐츠 유지, 버튼만 스피너. 탭·시즌 보존 |
| 갱신 중 재클릭 | `refresh()` 가드로 무시 |
| refresh SSE 실패 | error 전이 → `PlayerError`. 무한 스피너 없음 |
| CONTINUE 3회 초과 | error 전이 (재시도 초과 에러) |
| 갱신 중 다른 유저로 이동 | name effect가 SSE 정리 + 전체 리셋 → 이전 refresh 완료 이벤트 무시됨 |

---

## 6. 마이그레이션 단계

작은 단위로 나눠 각 단계 후 동작 확인이 가능하도록 한다.

1. **PlayerContext 상태 머신 도입** — status/error/retry/refresh SSE 내장, `ssePlayerInfo` 노출 제거.
   `index.tsx`는 임시로 status를 기존 boolean에 매핑해 화면 변화 없이 통과.
2. **index.tsx 축소** — `refreshKey`·key-리마운트·`isLoading`·`playerFound` 제거,
   렌더 분기를 status 기반으로 교체, ready 구독 effect 도입.
3. **PlayerHeader 정리** — `refreshLoading`/`onRefresh` prop 제거, `usePlayer` 직접 사용.
4. **Statistics/RouteAuth에 reset() 추가** + name 변경 effect에서 호출.
5. **검증** — 5장의 시나리오 8건을 수동 확인 (SSE 목킹 또는 개발 서버).

예상 변경 파일: `contexts/PlayerContext.tsx`(대), `pages/player/index.tsx`(대),
`components/header/PlayerHeader.tsx`(소), `contexts/StatisticsContext.tsx`(소),
`contexts/RouteAuthContext.tsx`(소).

---

## 7. 리스크 및 유의점

- **useSSE 콜백의 stale closure**: `loadInfo`가 SSE 콜백(비동기) 안에서 재호출되므로,
  `name`·`retryCount`를 state 대신 `useRef`로 관리하거나 콜백 인자로 전달해
  오래된 클로저 값을 참조하지 않도록 한다. 특히 `retryCount`는 렌더와 무관하므로 ref가 적합.
- **status 전이의 원자성**: 전이 로직을 `setStatus` 직접 호출로 흩뿌리지 말고
  `transition(event)` 형태의 단일 함수(또는 `useReducer`)로 모아 전이 규칙 위반을 방지한다.
  구현 시 `useReducer` 권장.
- **refreshing 중 에러 UX**: v1은 error 전이로 통일 — 화면이 `PlayerError`로 바뀌는 것이
  다소 과격하나, 현재의 무한 스피너보다 낫다. 토스트 도입 시 "ready 복귀 + 알림"으로 개선.
- **동일 name 재검색**: name이 같으면 effect가 재실행되지 않는다. 기존 구조도 동일한
  동작이므로 회귀는 아니나, 검색바에서 같은 유저 재검색 시 갱신을 기대한다면
  `refresh()`를 호출하도록 검색 진입점에서 처리한다 (범위 밖, 인지만).

---

## 8. 기대 효과 요약

| 선행 문서 이슈 | 해결 방식 |
|----------------|-----------|
| 🔴 1. refresh 실패 무한 로딩 | refresh onError → error 전이 |
| 🔴 2. CONTINUE 무한 루프 | retryCount 가드 (MAX 3회) |
| 🟡 3. 리마운트 UI 상태 손실 | 리마운트 제거로 activeTab·seasonId 자연 보존 |
| 🟡 4. in-flight refresh 미정리 | name effect에서 SSE disconnect + 전체 리셋 |
| 🟡 5. 로딩 신호 이원화 | isLoading/isRefreshing/playerFound → status 단일화 |
| 🟡 6. 상태 끌어올리기 반복 | 상태 머신을 PlayerProvider로 집약, prop 드릴링 제거 |
| 🟢 7. 미사용 파라미터 | 구현 시 함께 정리 |
