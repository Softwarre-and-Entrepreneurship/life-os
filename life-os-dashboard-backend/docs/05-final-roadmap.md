# 실사용 최종 로드맵

## 문서 목적

이 문서는 `Life OS Dashboard`를 실제로 쓰는 로컬 앱으로 만들기 위해 남은 작업을 정리한다. 기준은 현재 프론트와 백엔드의 실제 파일 상태, 실행 검증 결과, 그리고 외부 공식 문서에서 확인한 기술 경계다.

## 근거 원장

### 로컬 근거

- `frontend/src/App.jsx`는 `frontend/src/api/client.js`를 통해 백엔드 API를 호출한다.
- `frontend/src/constants/mockData.js`는 삭제되었고, `rg` 기준 `mockData`, `INITIAL_BUGS`, `AI_RESPONSES`, `PARTNER` import는 남아 있지 않다.
- `frontend/.env.example`은 `VITE_API_BASE_URL=http://localhost:4000` 예시를 제공한다.
- `backend/src/app.js`는 `/api` 아래에 라우터를 mount한다.
- `backend/src/routes/index.js`는 health, dashboard, profile, xp, bugs, goals, ai, vault, coop 라우터를 모은다.
- `backend/src/db/connection.js`는 `better-sqlite3`를 사용한다.
- `npm run smoke`는 health, dashboard, bug 생성/해결, XP 증가, AI 조언, Vault demo unlock 흐름을 통과했다.
- `better-sqlite3` 전환 후 현재 Windows 환경에서 `npm install`, `npm run smoke`, `npm run backup`이 통과했다.
- `npm run build`는 프론트 번들을 생성하는 데 성공했다.
- `http://127.0.0.1:5173/` preview 서버는 HTTP 200으로 응답했다.
- `npm run backup`과 `npm run reset -- --force`는 임시 DB 경로로 동작을 확인했다.
- `npm run restore -- <backup-file> --force`가 추가되었고, 임시 DB 경로로 복원 흐름을 확인한다.
- `npm run health`로 실행 중인 백엔드의 `/api/health` 응답을 확인할 수 있다.
- `npm run migrate`와 `src/db/migrations.js`가 schema migration 적용과 이력 출력을 담당한다.
- `npm run dev:local`은 백엔드와 sibling 프론트 dev server를 함께 실행한다.
- `npm run smoke:local`은 `dev:local` 실행 래퍼가 백엔드를 띄우고 health 응답을 받을 수 있는지 확인한다.
- `schema_migrations` 테이블은 초기 schema version `1`과 이후 migration 적용 이력을 기록한다.
- `.github/workflows/ci.yml`은 Ubuntu, Windows, macOS에서 `npm ci`, `npm run migrate`, `npm run smoke`, `npm run smoke:local`, `npm audit --audit-level=moderate`를 실행한다.
- `docs/07-frontend-integration.md`에 프론트 담당자가 볼 API 연동 순서와 화면별 호출 흐름을 정리했다.
- `docs/08-backend-implementation-summary.md`에 백엔드 담당 구현 내용, 스택, 검증, 한계를 보고서용으로 정리했다.

### 외부 공식 근거

- [Node.js `node:sqlite` 문서](https://nodejs.org/download/release/latest-v24.x/docs/api/sqlite.html)는 `node:sqlite`의 안정성 상태를 release candidate로 표시한다.
- [better-sqlite3 문서](https://github.com/WiseLibs/better-sqlite3)는 synchronous API, transaction, WAL, backup, supported Node version과 LTS prebuilt binary 조건을 설명한다.
- [SQLite serverless 문서](https://www.sqlite.org/serverless.html)는 SQLite가 별도 서버 프로세스 없이 애플리케이션 프로세스가 디스크의 데이터베이스 파일을 직접 읽고 쓴다고 설명한다.
- [SQLite transactional 문서](https://www.sqlite.org/transactional.html)는 SQLite 트랜잭션의 ACID 성격과 단일 트랜잭션의 all-or-nothing 동작을 설명한다.
- [Express routing 문서](https://expressjs.com/en/guide/routing/)는 `express.Router`를 modular, mountable route handler로 설명한다.
- [Vite env 문서](https://vite.dev/guide/env-and-mode)는 `.env`, mode별 env 파일, `VITE_` prefix, env 변경 후 dev server 재시작 조건을 설명한다.

## 요구사항 캡처

```text
Goal:
  Life OS Dashboard를 PC에서 실제로 계속 사용할 수 있는 로컬 웹앱으로 만든다.

Non-goals:
  1차 최종 목표에는 원격 배포, 다중 사용자 로그인, 실제 생체 인증, 실시간 파트너 동기화를 포함하지 않는다.

Current baseline:
  프론트는 React/Vite 웹앱이며 백엔드 API 클라이언트와 앱 상태를 통해 주요 데이터를 읽고 쓴다.
  백엔드는 Express API와 SQLite 저장소를 갖고 있으며 smoke 검증이 통과했다.
  브라우저 자동화 기반 통합 검증은 임시 DB 기준으로 완료했다.
  팀 프론트 repo 반영은 아직 별도 조율이 필요하다.

Known user failure triggers:
  메타데이터나 이름만 보고 추측하면 안 된다.
  좁은 패치만 쌓아서 최종 목표를 흐리면 안 된다.
  "완성"이라고 말하려면 어떤 범위가 검증됐는지 밝혀야 한다.

Required evidence:
  프론트가 실제 API를 호출하는 코드, 백엔드 API 응답, 저장소 유지 여부, 실행 명령, 오류/로딩 화면 동작.

Concept translation:
  "Life OS Dashboard"는 프로젝트명이다.
  외부 개념으로는 local-first application, local persistence, REST API, SQLite-backed local storage, Vite environment variables, Express routing에 해당한다.

Design boundary:
  로컬 단일 사용자 앱으로 시작한다.
  실제 암호화, 실제 AI API, 원격 동기화는 별도 설계가 필요한 확장 항목으로 둔다.

Risky actions:
  사용자 데이터가 들어간 SQLite 파일 삭제, 인증 없는 Vault를 실제 보안 기능처럼 표시, 프론트와 백엔드 데이터 계약 불일치.

Verification method:
  smoke 스크립트, API 직접 호출, 프론트 브라우저 동작 확인, 서버 재시작 후 데이터 유지 확인.
```

## 확인된 사실

- 백엔드는 `Express` 라우터 구조로 `/api/*` 엔드포인트를 제공한다.
- 백엔드는 `SQLite` 파일을 사용해 데이터를 저장한다.
- `npm run smoke`는 health, dashboard, bug 생성/해결, XP 증가, AI 조언, Vault demo unlock 흐름을 확인한다.
- 현재 프론트는 `src/api/client.js`를 통해 백엔드를 호출한다.
- 현재 프론트의 Vault와 AI는 demo/static mode를 표시하지만, 실제 보안 또는 실제 AI 생성 기능은 아니다.

## 외부 근거에서 조정한 판단

### SQLite 선택

SQLite 공식 문서는 SQLite를 별도 서버 프로세스가 없는 단일 파일 기반 내장 데이터베이스로 설명한다. 이 성격은 로컬 단일 사용자 앱의 저장소 요구와 맞는다. 또한 SQLite 문서는 트랜잭션이 원자성, 일관성, 격리성, 지속성을 제공한다고 설명한다.

현재 백엔드가 SQLite를 쓰는 방향은 로컬 앱 목적에는 맞다. Node.js의 `node:sqlite` 문서는 이 모듈이 현재 release candidate 상태라고 설명했고, 로컬 smoke 실행에서도 experimental warning이 출력되었다. 이 경고와 장기 유지 불확실성을 줄이기 위해 DB driver를 `better-sqlite3`로 전환했다.

전환 후에도 크로스 플랫폼 주의사항은 남는다. `better-sqlite3`는 native addon이므로 Windows, macOS, Linux에서 사용할 수 있지만, 플랫폼/아키텍처에 맞는 binary 또는 빌드 도구가 필요하다. 현재 검증은 Windows 로컬 환경에서 수행했다.

### Express API 구조

Express 공식 문서는 HTTP 메서드와 경로에 따라 요청을 처리하는 라우팅 구조와 `Router`를 통한 모듈화 방식을 설명한다. 현재 백엔드의 `src/routes` 분리는 이 구조와 맞는다.

### 프론트 환경 변수

Vite 공식 문서는 `.env` 파일과 mode별 env 파일을 지원하고, env 파일 변경 후 dev server 재시작이 필요하다고 설명한다. 프론트가 백엔드 URL을 직접 하드코딩하지 않으려면 `VITE_API_BASE_URL` 같은 환경 변수를 둔다.

## 최종 목표까지 남은 단계

### 1단계: 프론트 API 연결

현재 상태:

- `src/api/client.js`가 추가되었다.
- `VITE_API_BASE_URL` 예시가 `.env.example`에 추가되었다.
- 초기 대시보드, 버그 추가/해결, AI 조언, Vault demo unlock/진행률 수정, Co-op sync는 API 호출 구조로 전환되었다.
- 프론트 빌드와 백엔드 smoke는 통과했다.
- 브라우저 자동화 기반으로 대시보드 로딩, 버그 저장/새로고침/수정, AI 조언, Vault 수정, Co-op sync를 임시 DB에서 확인했다.
- 팀 프론트 repo 반영과 팀원 검토는 아직 남아 있다.

목표:

- `mockData.js`를 초기 화면의 유일한 데이터 소스로 쓰지 않는다.
- 프론트가 `GET /api/dashboard`로 초기 데이터를 읽는다.
- 버그 추가, 버그 해결, Vault 진행률 수정, Co-op sync가 API를 호출한다.
- 목표 직접 수정 UI는 별도 화면 또는 컨트롤이 생길 때 연결한다.

완료 증거:

- 프론트 코드에 `src/api` 계층이 생긴다.
- `VITE_API_BASE_URL` 또는 같은 역할의 설정이 생긴다.
- 브라우저에서 버그를 추가하고 새로고침해도 데이터가 남는다.

### 2단계: 실사용 상태 처리

목표:

- 서버가 꺼진 상태, 요청 실패, 저장 중 상태, 빈 목록 상태를 화면에서 구분한다.
- 사용자가 저장 성공/실패를 알 수 있다.

완료 증거:

- 브라우저에서 백엔드 서버를 끈 상태로 프론트를 열었을 때 오류 상태가 보인다.
- 저장 중 버튼 중복 클릭이 막힌다.
- API 실패 시 사용자가 다시 시도할 수 있다.

### 3단계: 데이터 유지와 복구

현재 상태:

- `npm run backup`으로 현재 SQLite DB를 `backups/` 아래에 복사할 수 있다.
- `npm run reset -- --force`로 DB 파일과 WAL/SHM 파일을 삭제할 수 있다.
- `npm run restore -- <backup-file> --force`로 백업 파일을 DB 위치로 복원할 수 있다.
- `npm run health`로 서버 실행 상태를 확인할 수 있다.
- `npm run migrate`로 schema migration을 적용하고 현재 version을 확인할 수 있다.
- `npm run smoke:local`로 로컬 실행 래퍼가 백엔드를 띄우는지 확인할 수 있다.
- `.env.example`에 `DB_PATH`, `PORT`, `HOST`, `CORS_ORIGIN` 예시가 있다.
- `docs/06-operations.md`에 백업, 초기화, health, smoke 검증 범위가 정리되어 있다.
- `docs/07-frontend-integration.md`에 프론트 연동에 필요한 호출 흐름이 정리되어 있다.

목표:

- SQLite 파일이 어디에 저장되는지 사용자가 알 수 있다.
- 백업과 초기화 절차가 문서화된다.
- 스키마 변경이 생길 때 기존 데이터를 잃지 않는 경로를 둔다.

완료 증거:

- `data/life-os.sqlite`의 역할이 문서화된다.
- `backup`, `restore`, `reset` 명령이 생긴다.
- schema migration runner와 migration 파일 작성 규칙이 생긴다.

### 4단계: 실행 방식 정리

목표:

- 사용자가 프론트와 백엔드를 따로 기억해서 켜지 않아도 된다.
- 루트에서 한 명령으로 로컬 앱을 실행할 수 있다.

완료 증거:

- 백엔드에서 `npm run dev:local`로 sibling 프론트와 백엔드를 함께 실행할 수 있다.
- 프론트 폴더와 포트는 `FRONTEND_DIR`, `FRONTEND_HOST`, `FRONTEND_PORT`로 바꿀 수 있다.
- 실행 후 프론트 URL과 백엔드 URL이 명확히 표시된다.
- 포트 충돌 시 어떻게 처리할지 문서화된다.

### 5단계: 보안/AI 기능 경계 정리

목표:

- 실제 암호화가 없는 Vault는 demo 상태임을 코드와 UI에서 드러낸다.
- AI 조언이 정적 템플릿인지 실제 생성인지 응답에 표시한다.

완료 증거:

- Vault API 응답의 `mode: "demo"`가 프론트 UI에 반영된다.
- AI 응답의 `mode: "static"`이 내부 상태나 표시 문구에 반영된다.
- 실제 암호화 또는 실제 AI 연동을 하려면 별도 설계 문서가 필요하다는 경계가 남아 있다.

### 6단계: 프론트/백엔드 통합 검증

목표:

- "백엔드가 따로 됨"이 아니라 "프론트에서 실제로 됨"을 확인한다.

완료 증거:

- `npm run smoke`가 백엔드 API를 통과한다.
- 프론트 빌드가 성공한다.
- 브라우저에서 최소 흐름을 확인한다.
  - 대시보드 로딩
  - 버그 추가
  - 버그 해결
  - XP 증가
  - 새로고침 후 유지
  - AI 조언 열기
  - Vault demo unlock
  - Co-op sync

## 이전 판단에서 수정할 점

이전에는 "다음 단계는 프론트-백 연결"이라고 요약했다. 수정된 기준으로 다시 보면 그 말은 방향만 맞고 수용 기준은 부족하다. 최종 목표 기준의 다음 작업은 `프론트-백 연결 + 실사용 상태 처리 + 데이터 유지 검증`까지 묶어야 한다.

즉, 다음 구현 단위는 단순 fetch 연결이 아니라 다음 계약을 만족해야 한다.

```text
프론트가 백엔드 데이터를 읽고 쓴다.
사용자는 저장 성공/실패를 알 수 있다.
서버 재시작과 브라우저 새로고침 후에도 데이터가 유지된다.
demo 기능과 실제 기능의 경계가 드러난다.
```

## 남은 불확실성

- macOS/Linux 환경에서 `better-sqlite3` 설치와 smoke 실행을 직접 확인해야 한다.
- 최종 실행 방식을 웹앱 개발 서버 2개로 둘지, 데스크톱 앱처럼 포장할지 결정이 필요하다.
- Vault를 실제 보안 기능으로 만들지, 개인 기록용 demo 잠금으로 둘지 결정이 필요하다.
