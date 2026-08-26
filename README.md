# DAYO.GG

> 이터널리턴(Eternal Return) 전적검색 웹 프론트엔드. 플레이어 닉네임으로 시즌별 티어·랭크·전투 통계와 실험체(캐릭터)별 성적을 조회합니다.

![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)

**🔗 배포: [dayogg.vercel.app](https://dayogg.vercel.app/)**

---

## 프로젝트 개요

이터널리턴 유저의 전적을 검색하고 시각화하는 SPA입니다. 닉네임으로 플레이어의 시즌별 랭크·티어와 MMR·RP, 실험체별 승률·평균 순위 등 상세 전투 통계를 확인할 수 있습니다.

| | |
|---|---|
| **개발 형태** | 1인 개발 (프론트엔드 전담) |
| **개발 기간** | 2026.07 ~ 2026.08 |
| **프론트엔드** | 이 저장소 |
| **백엔드** | [ghlee0303/dayogg](https://github.com/ghlee0303/dayogg) (별도 저장소, 동일 개발자) |
| **배포** | Vercel (`main` 브랜치 자동 배포) |

> 이 사이트는 이터널리턴의 공식 서비스가 아니며, 이터널리턴 공식 API를 활용해 제작되었습니다.

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| **플레이어 검색** | 닉네임으로 `/player/:name` 전적 페이지 진입 |
| **랭크·티어 조회** | 시즌별 티어(브론즈~이터니티), MMR·RP, 티어 구간 정보 |
| **실험체 통계** | 캐릭터별 게임 수·승률·평균 순위·딜량·시야 등 정렬 가능한 상세 테이블 |
| **검색 범위 필터** | MMR·티어 구간과 기간을 조합한 프리셋/커스텀 옵션으로 통계 조회 범위 조정 |
| **실시간 전적 갱신** | SSE로 갱신 상태를 실시간 반영, `전적 갱신` 버튼에 10분 쿨다운 |
| **통계 초기화** | 닉네임 변경 유저의 데이터 정합성을 위한 루트 기반 본인 확인 절차 |
| **다국어(KO/EN)** | 서버 로케일 메타 기반으로 실험체·스킨·무기 등 명칭 현지화 |
| **반응형 UI** | 모바일 / PC 레이아웃 대응 |

---

## 기술 스택

| 분류 | 사용 기술 |
|------|-----------|
| 언어 | TypeScript 5.6 (strict) |
| UI | React 18.3 |
| 라우팅 | React Router 6 |
| 빌드 | Vite 5 |
| 스타일링 | Tailwind CSS 4 (`@tailwindcss/vite`) |
| 상태 관리 | React Context API + Hooks |
| 배포 | Vercel |

---

## 아키텍처

### 설계 원칙

- **컴포넌트 기반 + Context API 상태 관리** — 전역/도메인 상태는 Context Provider로 주입, 로컬 상태는 `useState`/`useReducer`
- **아토믹 디자인 + 페이지 기반 구조 혼합**
  - 여러 페이지에서 재사용되는 공통 컴포넌트 → `components/`의 `atoms` / `molecules` / `organisms`
  - 특정 페이지에서만 쓰이는 컴포넌트 → 해당 `pages/<page>/components/` 하위
- **TypeScript strict** — 모든 도메인 데이터는 `types/`에 명시적으로 타입 정의
- **관심사 분리** — API 호출(`utils/api.ts`) / 요청 훅(`hooks/`) / 상태(`contexts/`) / 표현(`components/`, `pages/`) 계층 분리

### 상태 관리 구조

전역 메타 데이터(로케일·시즌·티어 구간·특성·장비)를 앱 최상단에서 Provider로 감싸고, 플레이어 페이지 진입 시 도메인 Provider가 추가로 중첩됩니다.

```
LocaleProvider
└─ SeasonProvider → TierRangeProvider → TraitProvider → EquipProvider   (전역 메타)
   └─ (Player 페이지) PlayerProvider → RouteAuthProvider
      → StatisticsProvider → BattleResultProvider                        (도메인)
```

### 데이터 통신

- REST 요청은 `utils/api.ts`의 `api.get/post/...` 래퍼로 통일하고 `ApiError`로 에러를 정규화
- 컴포넌트에서는 `useApi` 훅으로 로딩/에러/데이터 상태를 관리
- 실시간 갱신이 필요한 경우 `useSSE` 훅으로 `EventSource` 연결
- API 서버 주소는 `VITE_API_URL` 환경변수로 주입 (기본값 `http://localhost:8080`)

---

## 기술적 도전

### 1. SSE 갱신 구조를 상태 머신으로 재설계

초기 구현은 전적 갱신이 끝나면 `<PlayerProvider key={refreshKey}>`의 `key`를 바꿔 서브트리를 통째로 리마운트해 재조회를 유도했습니다. 이 방식은 두 가지 문제가 있었습니다.

- refresh SSE가 에러로 끝나면 복구 경로가 없어 **탭 영역이 무한 로딩**에 빠짐
- 서버가 `CONTINUE`를 반복하면 `info → refresh → 리마운트 → info` **무한 루프** 발생

`searching / syncing / refreshing / ready / error` 5개 상태와 재시도 카운터(최대 3회)를 갖는 상태 머신을 `PlayerContext` 한 곳에 모아, 리마운트 없이 데이터만 갱신하도록 재설계했습니다. 결과적으로 탭·시즌 등 UI 상태가 갱신 사이클에서 자연히 보존되고, 실패 시 에러 화면으로 명확히 전이합니다.

→ 상세: [설계 문서](docs/design/0706-player-refresh-redesign.md) · [사전 점검](docs/design/0706-player-refresh-report.md)

### 2. Nullable prop을 경계에서 해소

자식 컴포넌트 props에 `?.`, `?? ''`, `disabled={x === null}`이 반복 드릴링되는 것을 "nullable이 잘못된 레이어까지 흘렀다"는 신호로 보고, **부모에서 가드 후 자식을 렌더**(자식 props는 non-nullable로 좁힘), **Context는 Provider 훅에서 미초기화 시 throw** 규칙으로 정리했습니다.

### 3. Tailwind v4 마이그레이션 중 한글 인코딩 손상 복구

클래스 일괄 치환을 PowerShell로 실행하며 인코딩을 지정하지 않아, UTF-8 한글이 CP949로 오해석되어 10개 파일 75행이 손상됐습니다. 역변환(`iconv`) + VS Code 로컬 히스토리 + 직전 빌드 산출물을 라인 단위로 대조해 전량 복구하고, 재발 방지 절차를 문서화했습니다.

→ 상세: [복구 기록](docs/design/encoding-incident.md)

---

## 로컬 실행

```bash
# 의존성 설치
npm install

# 개발 서버 (http://localhost:5173)
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview

# 린트 / 타입 체크
npm run lint
npm run typecheck
```

### 환경변수

API 서버 주소는 `VITE_API_URL` 환경변수로 주입합니다. 로컬 개발은 프로젝트 루트에 `.env.local`을 두고 사용하며, 필요한 변수는 [`.env.example`](.env.example)에 문서화되어 있습니다.

```
VITE_API_URL=http://localhost:8080
```

배포 설정은 [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) 참고.

---

## 프로젝트 구조

<details>
<summary>디렉토리 트리</summary>

```
dayogg_front/
├─ public/                     # 정적 에셋 (이미지 등)
├─ docs/
│  ├─ DEPLOYMENT.md            # Vercel 배포 가이드
│  └─ design/                  # 설계·트러블슈팅 기록
├─ src/
│  ├─ App.tsx                  # 라우팅 + 전역 Provider 구성
│  ├─ main.tsx                 # 앱 진입점
│  ├─ index.css                # 전역 스타일 (Tailwind)
│  │
│  ├─ assets/                  # 번들 이미지 (티어 아이콘 등)
│  │
│  ├─ components/              # 공통 컴포넌트 (아토믹 디자인)
│  │  ├─ atoms/                # Button, Input, Modal, RangeSlider ...
│  │  ├─ molecules/            # SearchBar, Pagination, TableView, Selector ...
│  │  └─ organisms/            # Header, Footer
│  │
│  ├─ pages/                   # 페이지 단위 컴포넌트
│  │  ├─ home/                 # 홈(검색) 페이지
│  │  └─ player/               # 플레이어 전적 페이지
│  │     └─ components/        # 플레이어 전용 컴포넌트
│  │        ├─ header/
│  │        ├─ rank-tier/      # 티어 카드/정보 (+ vertical)
│  │        ├─ character-table/
│  │        └─ search-range/   # 검색 범위 필터
│  │
│  ├─ contexts/                # 전역/도메인 상태 (Context Provider)
│  │  ├─ meta/                 # Locale, Season, TierRange, Trait, Equip
│  │  ├─ PlayerContext.tsx     # 갱신 상태 머신
│  │  ├─ StatisticsContext.tsx
│  │  ├─ BattleResultContext.tsx
│  │  ├─ SearchContext.tsx
│  │  └─ RouteAuthContext.tsx
│  │
│  ├─ hooks/                   # 커스텀 훅
│  │  ├─ useApi.ts             # REST 요청 상태 관리
│  │  ├─ useSSE.ts             # SSE 실시간 연결
│  │  ├─ usePlayerSearch.ts
│  │  └─ useLocalizedName.ts
│  │
│  ├─ types/                   # 도메인 타입 정의
│  ├─ utils/                   # api / imgSrc / time / value 유틸
│  └─ data/                    # 정적 데이터 (캐릭터/티어)
│
├─ index.html
├─ vite.config.ts
├─ eslint.config.js
└─ tsconfig*.json
```

</details>

---

## 라이선스 / 저작권

- 소스 코드는 개인 포트폴리오 용도로 공개됩니다.
- `public/img/` 등에 포함된 이터널리턴 게임 이미지(캐릭터·스킨·아이템·무기 등)의 저작권은 **Nimble Neuron**에 있으며, 팬 콘텐츠 목적으로만 사용됩니다.
- 이터널리턴 [API 이용약관](https://support.playeternalreturn.com/hc/ko/articles/49090866623257-API-%EC%9D%B4%EC%9A%A9-%EC%95%BD%EA%B4%80-2025-07-22)을 준수합니다.
