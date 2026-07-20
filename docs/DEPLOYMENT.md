# Vercel 배포 가이드

DAYO.GG 프론트엔드를 Vercel에 배포할 때 필요한 설정을 정리한 문서입니다.

---

## 1. 환경변수 (서버 주소 숨기기)

API 서버 주소는 코드에 하드코딩하지 않고 `VITE_API_URL` 환경변수로 주입합니다.

### 동작 방식
- Vite는 **`VITE_` 접두사가 붙은 변수만** 클라이언트 코드(`import.meta.env`)에서 읽습니다.
- 코드: `src/utils/apiUtils.ts`
  ```ts
  export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";
  ```
  → 환경변수가 있으면 그 값, 없으면 로컬 기본값(`localhost:8080`).
- REST(`useApi`)와 SSE(`useSSE`) 모두 이 `API_URL`을 공유하므로 **변수 하나만** 관리하면 됩니다.

> ⚠️ `VITE_` 변수는 빌드 시 JS 번들에 그대로 박혀 브라우저에서 노출됩니다.
> 서버 **주소**를 감추는 용도이지, 진짜 비밀키(토큰·비밀번호)를 숨기는 용도가 **아닙니다**.

### 로컬 개발
프로젝트 루트의 `.env.local` 파일 사용 (git에 커밋되지 않음):
```
VITE_API_URL=http://localhost:8080
```
필요한 변수 목록은 `.env.example`에 문서화되어 있습니다.

### Vercel 설정
1. Vercel 프로젝트 → **Settings → Environment Variables**
2. 추가:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://실제-백엔드-주소`  ← 배포된 백엔드 주소 (HTTPS)
   - **Environment:** Production (필요 시 Preview/Development도 체크)
3. 저장 후 **Redeploy**. (환경변수는 빌드 시점에 주입되므로 기존 배포엔 반영되지 않음)

> ⚠️ Vercel은 HTTPS이므로 백엔드 주소도 **HTTPS**여야 합니다.
> HTTP 주소를 쓰면 브라우저의 Mixed Content 정책으로 요청이 차단됩니다.

---

## 2. 빌드 경고(미사용 코드) 처리

로컬 개발에서는 미사용 변수/import 경고를 **켜두고**, Vercel 빌드는 그 경고로 **실패하지 않도록** tsconfig를 분리했습니다.

| 파일 | 미사용 검사 | 용도 |
|------|-------------|------|
| `tsconfig.app.json` | **ON** (`noUnusedLocals`, `noUnusedParameters` = true) | 에디터·로컬 개발 (경고 표시) |
| `tsconfig.build.json` | **OFF** | 빌드 전용 (경고로 빌드 실패 방지) |

### 관련 스크립트 (`package.json`)
```jsonc
"build":     "tsc -p tsconfig.build.json --noEmit && vite build",  // Vercel이 실행 — 경고 OFF
"typecheck": "tsc -b"                                              // 로컬 수동 점검 — 경고 ON
```

- Vercel은 기본적으로 `npm run build`를 실행 → 미사용 경고가 있어도 통과.
- 로컬에서 미사용 코드를 점검하려면 `npm run typecheck` 실행 (에디터에도 인라인 표시됨).

---

## 3. Production 브랜치에서만 배포

배포되는 브랜치는 **Vercel 대시보드에서** 설정합니다 (저장소 파일로 강제 불가).

### 3-1. Production 브랜치 지정 (필수)
- **Settings → Git → Production Branch** → `main` 으로 설정.
- 이렇게 하면 `main`에 push할 때만 **프로덕션 배포**가 됩니다.

### 3-2. 다른 브랜치의 Preview 배포까지 막기 (선택)
기본적으로 Vercel은 `main` 외 브랜치·PR에도 **Preview 배포**를 자동 생성합니다.
이것도 막으려면 **Settings → Git → Ignored Build Step** 에 아래 명령 입력:

```bash
if [ "$VERCEL_GIT_COMMIT_REF" = "main" ]; then exit 1; else exit 0; fi
```

> Vercel 규칙: **exit 1 = 빌드 진행 / exit 0 = 빌드 취소**.
> 즉 브랜치가 `main`일 때만 빌드하고, 나머지 브랜치는 건너뜁니다.

| 원하는 동작 | 필요한 설정 |
|-------------|-------------|
| `main`만 프로덕션 배포 (다른 브랜치는 Preview 유지) | 3-1 만 |
| `main` 외 브랜치는 아예 배포 안 함 | 3-1 + 3-2 |

---

## 배포 체크리스트

- [ ] Vercel에 `VITE_API_URL` 환경변수 등록 (HTTPS 백엔드 주소)
- [ ] Production Branch = `main` 확인
- [ ] (선택) Ignored Build Step으로 비-main 브랜치 배포 차단
- [ ] `main`에 push → 자동 배포 확인
