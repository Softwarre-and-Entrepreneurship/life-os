# Life OS Dashboard Backend

이 디렉터리는 `Life OS Dashboard`의 백엔드 작업 공간이다. 현재는 문서와 1차 로컬 API 구현이 함께 존재한다. 로컬 참고 프론트엔드는 기본적으로 `../frontend`에 두고 실행한다. 팀 프론트 저장소 반영 여부는 프론트 담당자와 별도로 확인해야 한다.

## 문서

- [제품 범위와 요구사항](docs/01-product-scope.md)
- [백엔드 구조 설계와 기술 스택/흐름도](docs/02-backend-architecture.md)
- [API 계약 초안](docs/03-api-contract.md)
- [구현 계획](docs/04-implementation-plan.md)
- [실사용 최종 로드맵](docs/05-final-roadmap.md)
- [운영 명령과 데이터 관리](docs/06-operations.md)
- [프론트 연동 안내](docs/07-frontend-integration.md)
- [백엔드 구현 요약](docs/08-backend-implementation-summary.md)

## 현재 기준

- 앱 이름: `life-os-dashboard`
- 프론트 제목: `Life OS Dashboard`
- 실행 형태: 브라우저에서 동작하는 React/Vite 웹앱
- 백엔드 현재 상태: Express API와 `better-sqlite3` 기반 SQLite 저장소가 있으며 `npm run smoke`로 기본 API 흐름을 확인한다.
- 프론트 연동 기준: `GET /api/dashboard`, 버그 추가/해결, AI 조언, Vault demo unlock/진행률 수정, Co-op sync API를 호출하면 된다.
- 다음 목표: 팀 프론트에서 API 계약을 실제로 붙여 보고, 실제 AI/Vault 보안 범위를 결정한다.

## 실행

```bash
npm install
npm run dev
```

기본 서버 주소는 `http://127.0.0.1:4000`이다. Node 기준은 `.nvmrc`와 `package.json`의 `engines`에 맞춘 Node 24다. 환경 변수 예시는 `.env.example`에 있다.

백엔드와 sibling 프론트(`../frontend`)를 함께 켜려면 다음 명령을 사용한다.

```bash
npm run dev:local
```

프론트 폴더 위치나 포트를 바꿔야 하면 실행 전에 `FRONTEND_DIR`, `FRONTEND_HOST`, `FRONTEND_PORT`를 지정한다.

서버가 이미 실행 중이면 다음 명령으로 연결 상태를 확인할 수 있다.

```bash
npm run health
```

## 데이터 관리

```bash
npm run backup
npm run health
npm run migrate
npm run restore -- <backup-file> --force
npm run reset -- --force
npm run smoke
npm run smoke:local
```

- `npm run backup`은 현재 SQLite DB를 `backups/` 아래에 복사한다.
- `npm run health`는 실행 중인 백엔드의 `/api/health` 응답을 확인한다.
- `npm run migrate`는 schema migration을 적용하고 현재 버전을 출력한다.
- `npm run restore -- <backup-file> --force`는 백업 파일을 `DB_PATH` 위치로 복원한다.
- `npm run reset -- --force`는 `DB_PATH`의 SQLite 파일과 WAL/SHM 파일을 삭제한다.
- `npm run smoke`는 API 주요 흐름과 CORS 응답을 임시 DB로 검증한다.
- `npm run smoke:local`은 `dev:local` 실행 래퍼가 백엔드를 띄우고 health 응답을 받을 수 있는지 확인한다.

## CI

GitHub Actions는 `ubuntu-latest`, `windows-latest`, `macos-latest`에서 다음을 실행한다.

```bash
npm ci
npm run migrate
npm run smoke
npm run smoke:local
npm audit --audit-level=moderate
```

## 구현 전 원칙

1. 프론트의 현재 mock 기능을 실제 데이터 계약으로 치환한다.
2. 로컬 우선 구조로 시작한다.
3. 인증, 실제 AI 연동, 실제 암호화는 1차 구현의 필수 범위로 두지 않는다.
4. 보안처럼 보이는 UI 문구와 실제 보안 구현 수준이 어긋나지 않게 문서와 응답을 맞춘다.
5. 구현 후에는 프론트에서 API를 호출하도록 단계적으로 연결한다.
