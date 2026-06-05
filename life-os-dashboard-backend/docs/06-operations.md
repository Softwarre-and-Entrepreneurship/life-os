# 운영 명령과 데이터 관리

## 목적

이 문서는 백엔드만 관리할 때 필요한 실행, 검증, 백업, 초기화 절차를 정리한다. 프론트 진행 여부와 상관없이 백엔드 API와 로컬 데이터 저장소를 확인할 수 있어야 한다.

## 환경 변수

`.env.example`:

```env
PORT=4000
HOST=127.0.0.1
CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
DB_PATH=data/life-os.sqlite
FRONTEND_DIR=../frontend
FRONTEND_HOST=127.0.0.1
FRONTEND_PORT=5173
```

현재 서버 코드는 별도 `.env` 로더를 포함하지 않는다. PowerShell에서 값을 바꿀 때는 실행 전 환경 변수를 지정한다.

```powershell
$env:DB_PATH = "data/local-test.sqlite"
npm run dev
```

## 실행

```bash
npm install
npm run dev
```

Node 기준:

- `.nvmrc`: `24`
- `package.json` engines: `>=24 <25`

기본 주소:

- API 서버: `http://127.0.0.1:4000`
- Health check: `GET /api/health`

백엔드와 sibling 프론트(`../frontend`)를 함께 실행하려면 다음 명령을 사용한다.

```bash
npm run dev:local
```

Windows에서 더블클릭 실행이 필요하면 `start-local.bat`를 사용할 수 있다.

이 명령은 현재 백엔드와 `../frontend`의 Vite dev server를 함께 실행한다. 종료는 터미널에서 `Ctrl+C`로 한다. 프론트 폴더가 없으면 백엔드만 실행한다.

프론트 폴더 위치나 포트를 바꿔야 하면 실행 전에 환경 변수를 지정한다.

```powershell
$env:FRONTEND_DIR = "C:\기업가\front"
$env:FRONTEND_PORT = "5174"
npm run dev:local
```

포트:

- 백엔드: `4000`
- 프론트: `5173`

포트가 이미 사용 중이면 기존 서버를 종료한 뒤 다시 실행한다.

## 검증

```bash
npm run health
npm run migrate
npm run smoke
npm run smoke:local
```

`health`는 실행 중인 서버의 `/api/health` 응답을 확인한다. 서버가 켜져 있어야 하며, 기본 확인 주소는 `http://127.0.0.1:4000`이다.

```powershell
npm run dev
# 다른 터미널에서
npm run health
```

다른 주소를 확인하려면 `API_BASE_URL`을 지정한다.

```powershell
$env:API_BASE_URL = "http://127.0.0.1:4000"
npm run health
```

`migrate`는 현재 `DB_PATH`에 schema baseline을 만들고, `src/db/migrations/*.sql` 중 아직 적용되지 않은 migration을 적용한다. 현재 DB 버전과 적용 이력을 출력한다.

```powershell
npm run migrate
```

`smoke`는 임시 DB인 `data/smoke.sqlite`를 사용하고 종료 시 삭제한다. 현재 확인 범위는 다음과 같다.

- health 응답
- dashboard seed 데이터
- CORS origin 응답
- bug 생성, 조회, 수정, 해결
- bug 해결 후 XP 증가와 XP event 기록
- goal 생성과 진행률 수정
- AI advice `static` mode
- Vault unlock `demo` mode
- Vault item 진행률 수정
- Co-op sync `local-demo` mode
- dashboard 재조회 시 쓰기 결과 반영

`smoke:local`은 `dev:local` 실행 래퍼를 smoke mode로 실행한다. 이 검증은 백엔드 프로세스를 띄우고 `/api/health` 응답을 받은 뒤 자식 프로세스를 종료한다. `../frontend`가 있으면 프론트 dev server 응답도 함께 확인한다.

## 백업

```bash
npm run backup
```

기본 DB 경로는 `data/life-os.sqlite`이고, 백업 파일은 `backups/`에 생성된다. `backups/`는 `.gitignore`에 포함되어 GitHub에 올라가지 않는다.

다른 DB 파일을 백업하려면 `DB_PATH`를 먼저 지정한다.

```powershell
$env:DB_PATH = "data/local-test.sqlite"
npm run backup
```

백업 스크립트는 `better-sqlite3`의 `db.backup()`을 사용해 현재 SQLite DB를 백업 파일로 저장한다. 별도 WAL checkpoint 명령을 직접 실행하지는 않는다.

## 초기화

```bash
npm run reset -- --force
```

초기화 스크립트는 `DB_PATH`의 SQLite 파일과 `-wal`, `-shm` 파일을 삭제한다. 다음 서버 실행 시 schema와 seed 데이터가 다시 만들어진다.

주의:

- 사용자 데이터가 들어간 DB라면 먼저 `npm run backup`을 실행한다.
- `--force`가 없으면 초기화는 실행되지 않는다.

## 복원

```bash
npm run restore -- <backup-file> --force
```

복원 스크립트는 백업 파일을 `DB_PATH` 위치로 복사한다. 기존 DB가 있으면 `backups/pre-restore/` 아래에 현재 DB를 `better-sqlite3`의 `db.backup()`으로 한 번 백업한 뒤 복원을 진행한다.

주의:

- 서버가 실행 중이면 먼저 종료한다.
- 복원 전에 직접 `npm run backup`을 한 번 더 실행하는 편이 안전하다.
- `--force`가 없으면 복원은 실행되지 않는다.

## 스키마 마이그레이션

초기 schema는 `src/db/schema.sql`에 있고 version `1`로 기록된다. 이후 schema를 바꿀 때는 `src/db/migrations/` 아래에 새 SQL 파일을 추가한다.

파일명 규칙:

```text
0002_add_goal_deadline.sql
0003_add_user_settings.sql
```

서버 시작 또는 `npm run migrate` 실행 시 아직 적용되지 않은 migration만 version 순서대로 실행되고 `schema_migrations`에 기록된다.

주의:

- migration 파일은 한 번 적용되면 같은 version으로 다시 실행되지 않는다.
- 사용자 데이터가 있는 DB에 migration을 적용하기 전에는 `npm run backup`을 먼저 실행한다.
- 컬럼 삭제나 테이블 재작성처럼 위험한 변경은 별도 백업과 smoke 검증 후 진행한다.

## CI

GitHub Actions workflow는 `.github/workflows/ci.yml`에 있다. 현재 matrix는 다음 OS를 사용한다.

- `ubuntu-latest`
- `windows-latest`
- `macos-latest`

각 OS에서 실행하는 검증:

```bash
npm ci
npm run migrate
npm run smoke
npm run smoke:local
npm audit --audit-level=moderate
```

이 CI는 `better-sqlite3` 설치와 smoke 흐름이 Windows, Linux, macOS에서 동작하는지 확인하기 위한 최소 크로스 플랫폼 검증이다.

## 남은 백엔드 판단

현재 구현은 `better-sqlite3`를 사용한다. 이 선택은 Node 내장 `node:sqlite`의 release-candidate 경고를 피하고, 성숙한 SQLite driver 위에서 로컬 저장소를 운영하기 위한 것이다.

크로스 플랫폼 주의사항:

- Windows, macOS, Linux에서 사용할 수 있지만 native addon이므로 설치 시 플랫폼/아키텍처에 맞는 binary가 필요하다.
- prebuilt binary가 맞지 않는 환경에서는 C/C++ 빌드 도구가 필요할 수 있다.
- 현재 Windows 환경에서는 `npm install better-sqlite3`, `npm run smoke`, `npm run backup`이 통과했다.
- macOS/Linux 실행은 GitHub Actions CI와 실제 장비에서 `npm ci`와 `npm run smoke`를 돌려 확인한다.

스키마는 현재 `schema_migrations` 테이블에 적용 이력을 기록한다. 이후 컬럼 추가나 데이터 변환이 필요하면 `src/db/migrations/*.sql`에 새 migration 파일을 추가한다.
