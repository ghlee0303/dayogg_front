# DAYO.GG

이터널리턴(Eternal Return) 전적검색 웹 프론트엔드입니다. 플레이어 닉네임으로 시즌별 티어·랭크·전투 통계와 캐릭터별 성적을 조회할 수 있습니다.

---

## 📖 프로젝트 설명

DAYO.GG는 이터널리턴 유저의 전적을 검색하고 시각화하는 SPA(Single Page Application)입니다.

- 닉네임 검색으로 플레이어의 시즌별 랭크/티어(브론즈 ~ 이터니티)와 MMR·RP 정보를 조회
- 캐릭터별 승률·평균 순위 등 상세 전투 통계 제공
- MMR 구간·시즌·특성·장비 등 메타 데이터 기반의 검색 범위 필터링
- SSE(Server-Sent Events)를 통한 전적 갱신 상태의 실시간 반영
- 다국어(로케일) 대응 및 모바일/PC 반응형 UI

> 백엔드 API 서버는 별도 저장소에서 관리되며, 이 저장소는 프론트엔드만 포함합니다.

---

## 🏗️ 설계

### 아키텍처 원칙
- **컴포넌트 기반 + Context API 상태 관리**: 전역/도메인 상태는 Context Provider로 주입하고, 로컬 상태는 `useState`/`useReducer`로 관리
- **아토믹 디자인 + 페이지 기반 구조 혼합**
  - 여러 페이지에서 재사용되는 공통 컴포넌트 → `components/`의 `atoms` / `molecules` / `organisms`
  - 특정 페이지에서만 쓰이는 컴포넌트 → 해당 `pages/<page>/components/` 하위에 배치
- **TypeScript strict 모드**: 모든 도메인 데이터는 `types/`에 명시적으로 타입 정의
- **관심사 분리**: API 호출(`utils/api.ts`) / 요청 훅(`hooks/useApi.ts`, `useSSE.ts`) / 상태(`contexts/`) / 표현(`components/`, `pages/`) 계층 분리

### 상태 관리 구조
전역 메타 데이터(로케일·시즌·티어 구간·특성·장비)는 앱 최상단에서 Provider로 감싸고, 플레이어 페이지 진입 시 플레이어/통계/전투결과 등 도메인 Provider가 추가로 중첩됩니다.

```
LocaleProvider
└─ SeasonProvider → TierRangeProvider → TraitProvider → EquipProvider   (전역 메타)
   └─ (Player 페이지) PlayerProvider → RouteAuthProvider
      → StatisticsProvider → BattleResultProvider                        (도메인)
```

### 데이터 통신
- REST 요청은 `utils/api.ts`의 `api.get/post/...` 래퍼로 통일하고, `ApiError`로 에러를 정규화
- 컴포넌트에서는 `useApi` 훅으로 로딩/에러/데이터 상태를 관리
- 실시간 갱신이 필요한 경우 `useSSE` 훅으로 EventSource 연결

---

## 🛠️ 기술 스택

| 구분 | 기술 |
|------|------|
| 언어 | TypeScript (strict) |
| 프레임워크 | React 18 |
| 스타일링 | Tailwind CSS v4 (`@tailwindcss/vite`) |
| 상태 관리 | React Context API + Hooks |
| 통신 | Fetch API (REST), EventSource (SSE) |

---

## 🔍 플레이어 전적검색 화면

`/player/:name` 경로로 진입하는 핵심 화면입니다. 홈에서 닉네임을 검색하면 해당 플레이어의 시즌별 전적 상세를 조회합니다.

### 조회 흐름
1. 닉네임으로 플레이어 정보와 최신 시즌을 조회하고, 시즌별 통계·전투 결과를 로드
2. 데이터를 불러오는 동안 **로딩 화면**(`PlayerLoading`), 실패 시 **에러 화면**(`PlayerError`) 표시
3. 유저가 바뀌면 이전 유저의 통계·전투결과 등 파생 데이터를 초기화

### 화면 구성
- **플레이어 헤더 (`PlayerHeader`)**: 프로필 정보와 시즌 선택, `프로필` / `실험체` 탭 전환
- **랭크·티어 (`PlayerRankTier`, `PlayerRankTierVertical`)**: 시즌별 티어 카드(브론즈 ~ 이터니티)와 티어 구간 정보, 요약·전투결과 탭
- **검색 범위 필터 (`SearchRangeModal`)**: MMR 구간·티어·기간 등을 지정해 통계 조회 범위를 조정 (프리셋 및 직접 입력 지원)
- **실험체 통계 (`PlayerCharacterTable`)**: 캐릭터(실험체)별 승률·평균 순위 등 상세 성적 테이블

### 상태 관리
플레이어 페이지 진입 시 다음 도메인 Provider가 중첩되어 각 데이터를 담당합니다.

- `PlayerProvider` — 플레이어 기본 정보
- `RouteAuthProvider` — 경로 접근 제어
- `StatisticsProvider` — 시즌 통계
- `BattleResultProvider` — 전투 결과

---

## 📁 프로젝트 구조

```
claude-front/
├─ public/                     # 정적 에셋 (이미지 등)
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
│  │  ├─ PlayerContext.tsx
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
│  │  ├─ battle/  statistics/  # 요청/응답 타입
│  │  ├─ PlayerType.ts  TierType.ts  SeasonType.ts ...
│  │
│  ├─ utils/                   # API·이미지·시간·값 유틸
│  │  ├─ api.ts  apiUtils.ts   # fetch 래퍼 / URL 빌더
│  │  └─ imgSrc.ts  timeUtils.ts  valueUtils.ts
│  │
│  ├─ data/                    # 정적 데이터 (캐릭터/티어)
│  └─ test/                    # 테스트 셋업
│
├─ index.html
├─ vite.config.ts              # Vite 설정 (@ → src 별칭)
├─ vitest.config.ts
├─ eslint.config.js
└─ tsconfig*.json
```

---

## 🚀 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (http://localhost:5173)
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview

# 린트
npm run lint

# 테스트
npm run test        # watch 모드
npm run test:run    # 1회 실행
```

> API 서버 주소는 `src/utils/apiUtils.ts`의 `API_URL`에 정의되어 있습니다 (기본값: `http://localhost:8080`).
