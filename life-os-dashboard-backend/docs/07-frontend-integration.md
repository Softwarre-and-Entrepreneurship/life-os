# 프론트 연동 안내

## 목적

이 문서는 프론트 담당자가 백엔드 API를 붙일 때 바로 확인할 수 있는 실행 순서와 호출 흐름을 정리한다. 프론트 저장소의 코드는 팀원이 관리하므로, 이 백엔드 저장소는 API 계약과 검증 방법을 명확히 제공하는 역할을 한다.

## 빠른 실행

백엔드:

```bash
cd backend
npm install
npm run dev
```

프론트:

```bash
cd frontend
npm install
npm run dev
```

백엔드 폴더에서 두 서버를 함께 켜려면 다음 명령도 사용할 수 있다.

```bash
npm run dev:local
```

프론트 폴더가 sibling `../frontend`가 아니면 백엔드 실행 전에 `FRONTEND_DIR`를 지정한다.

기본 주소:

- Backend API: `http://127.0.0.1:4000`
- Frontend dev server: `http://localhost:5173` 또는 `http://127.0.0.1:5173`

프론트에서 API 주소를 환경 변수로 지정하려면 다음 값을 사용한다.

```env
VITE_API_BASE_URL=http://127.0.0.1:4000
```

백엔드가 켜져 있는지 확인:

```bash
npm run health
```

## 공통 응답 규칙

성공 응답은 항상 `data`에 들어온다.

```json
{
  "data": {}
}
```

실패 응답은 `error`에 들어온다.

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "progress must be an integer from 0 to 100",
    "details": {}
  }
}
```

프론트에서는 `response.ok`가 false일 때 `error.message`를 사용자 메시지로 보여주면 된다.

## 초기 로드

프론트 첫 진입 시에는 `GET /api/dashboard` 하나로 화면 기본 데이터를 구성한다.

```http
GET /api/dashboard
```

반환되는 주요 필드:

- `profile`: 좌측 사용자 영역, XP bar, Command Center 티어 카드
- `bugs`: Bug Tracker open 목록과 사이드바 badge
- `goals.self`: Co-op 화면의 내 목표
- `goals.partner`: Co-op 화면의 파트너 목표
- `partner`: Co-op 상대 정보와 기념일
- `vaultItems`: Vault 항목 목록

## 화면별 호출 흐름

### Bug Tracker

버그 추가:

```http
POST /api/bugs
```

```json
{
  "text": "운동 스킵",
  "severity": "critical"
}
```

프론트 반영:

- 성공 시 반환된 bug를 현재 `bugs` 배열 앞에 추가한다.
- `severity`는 `critical`, `high`, `med`, `low` 중 하나다.

버그 해결:

```http
POST /api/bugs/:id/resolve
```

```json
{
  "xpDelta": 120
}
```

프론트 반영:

- 반환된 `profile`로 XP bar를 갱신한다.
- 해결된 bug는 open 목록에서 제거한다.
- 반환된 `xpEvent.delta`를 알림 문구에 사용할 수 있다.

### AI Advice

주제 목록:

```http
GET /api/ai/topics
```

조언 요청:

```http
POST /api/ai/advice
```

```json
{
  "topic": "✨ MVP 전략"
}
```

프론트 반영:

- `body`를 AI 패널에 출력한다.
- `mode`가 `static`이면 현재는 정적 템플릿 응답이다.
- 존재하지 않는 topic이면 `404 NOT_FOUND`가 반환된다.

### Vault

잠금 해제:

```http
POST /api/vault/unlock
```

```json
{
  "passphrase": null
}
```

프론트 반영:

- `unlocked: true`이면 Vault 항목을 보여준다.
- `mode: "demo"`는 실제 암호화/생체 인증이 아직 구현되지 않았다는 뜻이다.
- 보안 문구는 "데모 잠금" 수준으로 표현하는 것이 안전하다.

진행률 수정:

```http
PATCH /api/vault/items/:id
```

```json
{
  "progress": 90
}
```

프론트 반영:

- `progress`는 0 이상 100 이하의 정수만 허용한다.
- 성공 시 반환된 item으로 해당 항목만 교체한다.

### Co-op Sync

현재 상태:

```http
GET /api/coop/status
```

동기화:

```http
POST /api/coop/sync
```

프론트 반영:

- 반환된 `goals`로 Co-op 목표 목록을 교체한다.
- `mode: "local-demo"`는 실제 외부 동기화가 아니라 로컬 데모 갱신이라는 뜻이다.
- `partner.anniversary`는 ISO date 문자열이므로 프론트에서 `new Date(value)`로 변환해서 계산한다.

## 프론트에서 주의할 값

- `profile.xpTarget`이 0일 가능성은 현재 seed 기준 없지만, 프론트는 0 나누기를 방어하면 좋다.
- `bugs`는 기본적으로 open 목록이다. resolved 목록이 필요하면 `GET /api/bugs?status=resolved`를 호출한다.
- `progress`는 정수만 받는다. 슬라이더 UI라면 전송 전에 `Math.round`를 적용한다.
- `xpDelta`는 0부터 5000까지의 정수다.
- 현재 인증은 없다. 배포 전에는 최소한 로컬 전용 실행 또는 인증 정책을 다시 결정해야 한다.

## 프론트 연동 확인 순서

1. `GET /api/health`가 `status: "ok"`를 반환하는지 확인한다.
2. `GET /api/dashboard`로 초기 화면을 구성한다.
3. `POST /api/bugs`로 새 bug를 추가하고 새로고침 후에도 남는지 확인한다.
4. `POST /api/bugs/:id/resolve` 후 XP가 증가하는지 확인한다.
5. `POST /api/ai/advice`가 `mode: "static"`과 `body`를 반환하는지 확인한다.
6. `POST /api/vault/unlock` 후 `PATCH /api/vault/items/:id`가 저장되는지 확인한다.
7. `POST /api/coop/sync` 후 목표 progress가 갱신되는지 확인한다.

## 현재 남은 API 결정

- 실제 AI API를 붙일지, 정적 템플릿을 유지할지 결정해야 한다.
- Vault를 실제 암호화 저장소로 만들지, 데모 아카이브로 둘지 결정해야 한다.
- 프론트에서 goal 생성/수정 UI가 생기면 `POST /api/goals`, `PATCH /api/goals/:id`를 연결하면 된다.
- 로그인/멀티 유저가 필요해지면 현재 `local-user` 단일 사용자 구조를 바꿔야 한다.
