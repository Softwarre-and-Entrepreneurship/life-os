# 백엔드 구현 요약

## 담당 범위

백엔드는 `Life OS Dashboard`의 mock 데이터를 실제 로컬 저장 데이터로 바꾸는 역할을 맡는다. 프론트는 React/Vite 웹앱이고, 백엔드는 브라우저 프론트가 호출할 JSON REST API와 SQLite 저장소를 제공한다.

## 기술 스택

| 구분 | 사용 기술 | 선택 이유 |
| --- | --- | --- |
| 런타임 | Node.js 24 | 프론트 개발 환경과 같은 Node 기반이라 로컬 개발 비용이 낮다. |
| HTTP 서버 | Express | 화면별 API를 `/api/*` 라우터로 나누기 쉽다. |
| DB | SQLite | 로컬 단일 사용자 앱에 적합한 파일 기반 저장소다. |
| DB 드라이버 | `better-sqlite3` | Node.js에서 성숙한 SQLite API를 제공하고, `node:sqlite` release-candidate 경고를 피한다. |
| 검증 | smoke script, health check, GitHub Actions | 로컬과 CI에서 주요 API 흐름을 반복 확인한다. |

## 구현한 기능

- `GET /api/dashboard`: 초기 화면 데이터 통합 조회
- `GET/POST/PATCH/DELETE /api/bugs`: 생활 버그 조회, 생성, 수정, 삭제
- `POST /api/bugs/:id/resolve`: 버그 해결과 XP 증가를 하나의 transaction으로 처리
- `GET/PATCH /api/profile`: 로컬 사용자 프로필 조회와 수정
- `GET /api/xp`, `POST /api/xp/events`: XP 상태와 이벤트 기록
- `GET/POST/PATCH /api/goals`: 목표 조회, 생성, 진행률 수정
- `GET /api/ai/topics`, `POST /api/ai/advice`: 정적 AI 조언 응답
- `POST /api/vault/unlock`, `GET/PATCH /api/vault/items`: Vault demo unlock과 항목 진행률 저장
- `GET /api/coop/status`, `POST /api/coop/sync`: Co-op 파트너 목표 조회와 로컬 데모 동기화

## 데이터 저장과 복구

- 기본 DB 파일: `data/life-os.sqlite`
- 초기 schema: `src/db/schema.sql`
- seed 데이터: `src/db/seed.js`
- migration runner: `src/db/migrations.js`
- migration 파일 위치: `src/db/migrations/*.sql`
- 백업: `npm run backup`
- 복원: `npm run restore -- <backup-file> --force`
- 초기화: `npm run reset -- --force`

## 실행과 검증

개별 실행:

```bash
npm run dev
```

백엔드와 sibling 프론트를 함께 실행:

```bash
npm run dev:local
```

Windows에서는 `start-local.bat`를 더블클릭하거나 터미널에서 실행할 수 있다.
프론트 폴더 위치나 포트가 다르면 `FRONTEND_DIR`, `FRONTEND_HOST`, `FRONTEND_PORT`를 지정한다.

검증:

```bash
npm run health
npm run migrate
npm run smoke
npm run smoke:local
npm audit --audit-level=moderate
```

GitHub Actions는 Windows, Ubuntu, macOS에서 `npm ci`, `npm run migrate`, `npm run smoke`, `npm run smoke:local`, `npm audit --audit-level=moderate`를 실행한다.

## 현재 한계

- 현재 사용자는 `local-user` 단일 사용자다.
- AI는 실제 생성형 API가 아니라 `mode: "static"` 응답이다.
- Vault는 실제 암호화가 아니라 `mode: "demo"` 응답이다.
- 프론트 최종 UI/HCI 개선과 팀 저장소 반영은 프론트 담당 범위다.
- 데스크톱 패키징은 아직 하지 않았다.

## 현재 진행도 판단

백엔드 단독 기준으로는 로컬 MVP에 필요한 API, 저장소, 운영 스크립트, 검증, 문서가 갖춰져 있다. 남은 일은 프론트 담당자 피드백에 따른 API 미세 조정과, 실제 AI/Vault 보안/패키징을 선택할 경우의 확장 설계다.
