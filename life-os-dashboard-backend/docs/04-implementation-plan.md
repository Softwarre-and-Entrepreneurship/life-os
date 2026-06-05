# 구현 계획

## 기준

현재 백엔드 디렉터리는 문서만 있는 상태다. 구현은 이 문서의 API 계약과 구조 설계를 기준으로 진행한다.

## 0단계: 문서 고정

목표:

- 제품 범위와 비목표를 정리한다.
- 백엔드 구조와 API 계약을 초안으로 만든다.
- 구현 전에 미검증 항목을 남긴다.

완료 기준:

- `README.md`와 `docs` 문서가 존재한다.
- 프론트 mock 기능과 백엔드 책임이 연결되어 있다.
- 실제 구현 전 결정이 필요한 항목이 문서에 남아 있다.

## 1단계: 서버 골격

목표:

- Node.js 백엔드 프로젝트를 초기화한다.
- Express 서버를 만든다.
- 공통 오류 응답과 `GET /api/health`를 구현한다.

예상 파일:

```text
package.json
src/app.js
src/server.js
src/middleware/errorHandler.js
src/middleware/notFound.js
src/routes/health.js
```

검증:

- `npm run dev`로 서버가 뜬다.
- `GET /api/health`가 `status: ok`를 반환한다.

## 2단계: SQLite 저장소

목표:

- SQLite 연결을 만든다.
- 스키마와 seed 데이터를 추가한다.
- 프론트의 `mockData.js` 값을 초기 데이터로 넣는다.

예상 파일:

```text
data/life-os.sqlite
src/db/connection.js
src/db/schema.sql
src/db/seed.js
```

검증:

- 서버 재시작 후에도 seed 데이터와 수정 데이터가 유지된다.
- `GET /api/dashboard`가 기본 데이터를 반환한다.

## 3단계: 핵심 도메인 API

목표:

- `bugs`, `profile`, `xp`, `goals` API를 구현한다.
- 버그 해결 시 XP 이벤트를 함께 기록한다.

우선순위:

1. `GET /api/dashboard`
2. `GET /api/bugs`
3. `POST /api/bugs`
4. `POST /api/bugs/:id/resolve`
5. `GET /api/profile`
6. `GET /api/goals`

검증:

- 버그 생성, 조회, 해결 흐름이 로컬 DB에 반영된다.
- XP 증가가 `profiles`와 `xp_events`에 함께 반영된다.

## 4단계: 데모 기능 API

목표:

- AI 조언 API를 정적 템플릿으로 구현한다.
- Vault API를 demo 모드로 구현한다.
- Co-op API를 로컬 데모 동기화로 구현한다.

검증:

- AI 주제를 보내면 기존 프론트 문구와 같은 계열의 응답이 반환된다.
- Vault unlock 응답에 `mode: demo`가 포함된다.
- Co-op sync는 실제 네트워크 동기화가 아님을 응답에 표시한다.

## 5단계: 프론트 연결

목표:

- 프론트에 API 클라이언트 계층을 추가한다.
- `mockData.js` 직접 사용을 줄이고 API 응답을 상태 초기값으로 사용한다.
- 로딩, 실패, 빈 상태를 화면에 반영한다.

검증:

- 백엔드 서버가 꺼져 있을 때 프론트가 오류 상태를 보여 준다.
- 백엔드 서버가 켜져 있을 때 새로고침 후 데이터가 유지된다.
- 기존 화면의 주요 동작이 API 기반으로 재현된다.

## 결정 필요 항목

| 항목 | 기본 제안 | 결정 이유 |
| --- | --- | --- |
| 백엔드 런타임 | Node.js | 프론트 개발 환경과 맞아 초기 비용이 낮다. |
| 저장소 | SQLite | 로컬 실행과 단일 사용자 데이터 유지에 충분하다. |
| 인증 | 1차 없음 | 현재 프론트에 로그인 화면이 없다. |
| AI | 정적 템플릿 | 현재 프론트도 정적 응답이다. |
| Vault | demo unlock | 현재 프론트도 실제 인증/암호화가 아니다. |
| Co-op | local demo sync | 현재 프론트도 setTimeout 기반 상태 전환이다. |

## 남은 위험

- 나중에 실제 배포를 목표로 바꾸면 인증, 데이터 소유권, Vault 보안 설계가 다시 필요하다.
- 현재 프론트 UI 문구는 실제 보안과 AI를 암시한다. 구현 수준과 문구가 맞지 않으면 사용자가 기능을 과신할 수 있다.
- `node_modules`가 프론트 저장소에 추적되어 있어 프로젝트 정리 단계가 별도로 필요하다.
