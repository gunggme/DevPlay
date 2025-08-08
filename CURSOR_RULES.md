## DevPlay Cursor Rules (React + TS + Vite + Tailwind v4 + Redux, MVC)

- **언어**: 모든 대화/문서/코멘트는 한국어로 작성합니다.
- **레퍼런스 우선순위**: 작업 시작 전 항상 Context7로 관련 라이브러리 문서를 먼저 조회합니다.
- **사고 방식**: 순차적 사고(sequential thinking)를 적용하고, 각 단계 전후로 짧은 상태 업데이트와 결론 요약을 남깁니다.
- **형식**: 과도한 서식을 피하고, 파일/디렉터리/함수/클래스명은 백틱(`)으로 표기합니다.

---

### 1) 아키텍처 및 디렉터리

- **패턴**: MVC를 React에 맞게 매핑합니다.
  - **Model**: 타입 정의, API 클라이언트, Redux Toolkit slice/RTK Query, Supabase schema 타입
  - **View**: 재사용 가능한 UI 컴포넌트, 페이지 프레젠테이션
  - **Controller**: 페이지/피처 컨테이너, 라우팅 로직, 비즈니스 흐름 orchestration

- **권장 구조**
```
src/
  app/
    providers/           # Redux Provider, Supabase Client Provider, Theme
    router/              # React Router (필요 시)
  features/
    auth/
      model/             # slices, api, types
      view/              # UI components
      controller/        # containers, hooks
    software/
    threads/
    notifications/
    admin/
  shared/
    ui/                  # 버튼, 입력, 모달 등 공통 컴포넌트
    lib/                 # 유틸/클라이언트 (supabase, analytics 등)
    hooks/               # 공용 훅
    types/               # 전역 타입
    utils/               # 순수 유틸 함수
  store/
    index.ts             # configureStore, root reducer, typed hooks
  styles/
    globals.css          # Tailwind v4 엔트리
```

---

### 2) 스택 가이드

- **React + TypeScript**: TS `strict: true`. 컴포넌트는 함수형, 훅 기반. 불필요한 타입 단언 금지.
- **Vite**: React 플러그인 사용(react-swc 권장). 환경 변수는 `VITE_` prefix.
- **Tailwind v4**: 디자인 토큰 중심. 유틸 클래스 우선, 불가피할 때만 커스텀 CSS. 접근성(focus ring) 기본 포함.
- **Redux (RTK)**:
  - `@reduxjs/toolkit`을 기본 채택. `createSlice`, `createAsyncThunk` 또는 RTK Query 사용.
  - 컴포넌트 내부 상태(UI 일시 상태)는 로컬 state, 서버 동기화 상태/캐시는 RTK Query.
  - `useAppDispatch`, `useAppSelector`만 사용. 셀렉터는 `reselect`로 메모이즈.

---

### 3) Supabase + MCP 사용 원칙

- **클라이언트 구성**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` 환경 변수 사용. 서비스 롤 키는 프론트에 절대 노출 금지.
- **보안(RLS)**: 모든 테이블 RLS 활성화 후 정책으로 접근 제어. 클라이언트 쿼리는 항상 명시 필터를 추가합니다(성능 최적화).
- **Windows용 MCP 설정(JSON 예시)**
```json
{
  "mcpServers": {
    "supabase": {
      "command": "cmd",
      "args": [
        "/c",
        "npx",
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--read-only",
        "--project-ref=<project-ref>"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "<personal-access-token>"
      }
    }
  }
}
```
- **브랜치 도입(유료/실험 기능)**: 개발 브랜치 생성→마이그레이션 적용→머지. 파괴적 마이그레이션은 반드시 리뷰.

---

### 4) 데이터 모델링 원칙 (요약)

- `users`, `softwares`, `software_versions`, `threads`, `comments`, `reactions`는 초안 스키마 준수.
- 외래키는 `ON DELETE RESTRICT|CASCADE`를 목적에 맞게 명시. 인덱스는 RLS/조인 키에 필수.
- **RLS 정책 예**: 작성자만 수정/삭제 가능, 인증 유저만 삽입 가능, 공개 읽기는 정책으로만 허용.

---

### 5) 코드 스타일 & 품질

- **명명**: 축약어 지양, 의미 있는 전체 단어 사용. 함수=동사, 변수=명사.
- **제어 흐름**: 가드클로즈 우선, 예외/에러 경로를 먼저 처리.
- **주석**: 왜(why)에 집중. 자명한 코드 주석 금지.
- **포맷/린트**: Prettier + ESLint(typescript, react, hooks, tailwind 플러그인). 경고는 빌드 실패로 취급.
- **테스트**: Vitest + React Testing Library. 슬라이스/훅/뷰 단위 테스트 우선.

---

### 6) UI/UX 원칙

- 모바일 퍼스트, 반응형. 키보드 내비게이션 및 스크린리더 고려.
- 로딩/빈 상태/에러 상태를 표준 컴포넌트로 통일(skeleton, empty, error).
- 폼은 Zod/Yup 등으로 스키마 검증. 토스트/다이얼로그는 접근성 우선.

---

### 7) Git/PR/커밋 규칙

- **브랜치**: `feat/*`, `fix/*`, `chore/*`, `docs/*`, `refactor/*`, `test/*`
- **커밋 메시지(Conventional Commits)**: `feat: ...`, `fix: ...`, `refactor: ...` 등
- **PR**: 문제/해결 요약, 스크린샷(UI), 테스트 증빙, 영향 범위 표기. 작은 PR을 선호.

---

### 8) 작업 수행 체크리스트 (에이전트)

1. Context7로 관련 라이브러리/주제 레퍼런스 확인(필수).
2. 요구사항를 기능 단위로 분해하고 순차적으로 설계/구현.
3. 파일 생성/수정은 실제 에디트로 반영 후(가급적 병렬), 린트/타입 검사.
4. 중요한 변경 후 빌드/테스트. 실패 시 즉시 수정.
5. 상태 업데이트(간단), 결과 요약(간단)을 남기고 종료.

---

### 9) 성능/보안 주의

- Supabase 쿼리는 명시 필터와 페이지네이션 사용. N+1 방지.
- 서비스 롤 키/비밀 값은 절대 클라이언트에 노출 금지.
- RLS 우선 설계. 관리자 기능은 서버(엣지 함수) 경유.

---

### 10) 진행 중 합의 사항

- 스택: React, TypeScript, Vite, Tailwind v4, Redux(RTK)
- 패턴: MVC 매핑(Model/View/Controller)
- 보안: 전 테이블 RLS 활성화 + 정책 기반 접근 제어

필요 시 본 문서를 업데이트하여 팀/에이전트의 공통 규칙을 최신화합니다.


