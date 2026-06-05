# API 계약 초안

## 기본 규칙

- 기본 URL: `http://localhost:4000`
- 응답 형식: JSON
- 시간 형식: ISO 8601 문자열
- 1차 구현 인증: 없음
- 1차 사용자 범위: 단일 로컬 사용자
- 프론트 초기 로드는 `GET /api/dashboard`를 우선 사용한다.
- 프론트 연동 순서는 [프론트 연동 안내](07-frontend-integration.md)를 기준으로 한다.

## 공통 응답

### 성공

```json
{
  "data": {}
}
```

### 실패

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "bug not found",
    "details": {}
  }
}
```

## Health

### `GET /api/health`

서버 상태를 확인한다.

응답:

```json
{
  "data": {
    "status": "ok",
    "service": "life-os-backend"
  }
}
```

## Dashboard

### `GET /api/dashboard`

프론트 초기 화면에 필요한 데이터를 한 번에 반환한다.

응답:

```json
{
  "data": {
    "profile": {
      "id": "local-user",
      "displayName": "김기은",
      "avatar": "KE",
      "tier": "DIAMOND IV",
      "level": 12,
      "xp": 3600,
      "xpTarget": 5000
    },
    "bugs": [],
    "goals": {
      "self": [],
      "partner": []
    },
    "partner": {
      "displayName": "기은",
      "avatar": "SH",
      "tier": "PLATINUM III",
      "anniversary": "2026-02-14"
    },
    "vaultItems": []
  }
}
```

## Profile and XP

### `GET /api/profile`

현재 로컬 사용자 프로필을 반환한다.

### `PATCH /api/profile`

프로필 표시 정보를 수정한다.

요청:

```json
{
  "displayName": "김기은",
  "avatar": "KE"
}
```

### `GET /api/xp`

현재 XP와 XP 변경 기록을 반환한다.

### `POST /api/xp/events`

수동 XP 이벤트를 기록한다. 1차 구현에서는 관리자 UI가 없으므로 선택 기능이다.

요청:

```json
{
  "delta": 120,
  "reason": "manual adjustment",
  "sourceId": null
}
```

`sourceType`은 서버가 항상 `manual`로 기록한다.

## Bugs

### `GET /api/bugs`

생활 버그 목록을 반환한다.

쿼리:

- `status`: `open`, `resolved`, `all`
- `severity`: `critical`, `high`, `med`, `low`

### `POST /api/bugs`

생활 버그를 추가한다.

요청:

```json
{
  "text": "운동 스킵",
  "severity": "critical"
}
```

응답:

```json
{
  "data": {
    "id": "bug_001",
    "text": "운동 스킵",
    "severity": "critical",
    "status": "open",
    "createdAt": "2026-06-02T08:00:00.000Z",
    "resolvedAt": null
  }
}
```

### `PATCH /api/bugs/:id`

생활 버그의 내용이나 심각도를 수정한다.

요청:

```json
{
  "text": "운동 스킵 수정",
  "severity": "high"
}
```

### `POST /api/bugs/:id/resolve`

생활 버그를 해결 처리하고 XP를 증가시킨다.

요청:

```json
{
  "xpDelta": 120
}
```

응답:

```json
{
  "data": {
    "bug": {
      "id": "bug_001",
      "status": "resolved"
    },
    "profile": {
      "xp": 3720,
      "xpTarget": 5000
    },
    "xpEvent": {
      "delta": 120,
      "reason": "bug resolved"
    }
  }
}
```

### `DELETE /api/bugs/:id`

생활 버그를 삭제한다. 해결 기록을 보존하려면 삭제보다 `resolve`를 우선한다.

## Goals

### `GET /api/goals`

사용자와 파트너 목표를 반환한다.

### `POST /api/goals`

목표를 추가한다.

요청:

```json
{
  "ownerType": "self",
  "label": "토익 950",
  "progress": 68
}
```

### `PATCH /api/goals/:id`

목표 이름이나 진행률을 수정한다.

요청:

```json
{
  "label": "토익 950",
  "progress": 72
}
```

## AI Advice

### `GET /api/ai/topics`

사용 가능한 AI 조언 주제 목록을 반환한다.

응답:

```json
{
  "data": [
    { "topic": "✨ MVP 전략" },
    { "topic": "🏆 피칭 전략" },
    { "topic": "🎮 게이미피케이션" }
  ]
}
```

### `POST /api/ai/advice`

선택한 주제의 조언을 반환한다. 1차 구현에서는 정적 템플릿을 반환한다.

요청:

```json
{
  "topic": "✨ MVP 전략"
}
```

응답:

```json
{
  "data": {
    "topic": "✨ MVP 전략",
    "body": "MVP의 본질은 ...",
    "mode": "static"
  }
}
```

## Vault

### `POST /api/vault/unlock`

Vault 접근 상태를 반환한다. 1차 구현에서 실제 인증을 하지 않는다면 응답에 `mode: "demo"`를 포함한다.

요청:

```json
{
  "passphrase": null
}
```

응답:

```json
{
  "data": {
    "unlocked": true,
    "mode": "demo",
    "expiresInSeconds": 1800
  }
}
```

### `GET /api/vault/items`

Vault 항목 목록을 반환한다.

### `PATCH /api/vault/items/:id`

Vault 항목의 진행률을 수정한다.

요청:

```json
{
  "progress": 90
}
```

## Co-op

### `GET /api/coop/status`

파트너 정보와 양쪽 목표 진행률을 반환한다.

### `POST /api/coop/sync`

로컬 데모 동기화를 실행한다. 1차 구현에서는 실제 네트워크 동기화가 아니라 저장된 진행률을 갱신한다.

응답:

```json
{
  "data": {
    "synced": true,
    "mode": "local-demo",
    "syncedAt": "2026-06-02T08:00:00.000Z",
    "goals": {
      "self": [],
      "partner": []
    }
  }
}
```

## 검증 시나리오

1. `GET /api/dashboard`로 프론트 초기 화면을 구성할 수 있다.
2. `POST /api/bugs` 후 `GET /api/bugs`에서 새 항목이 반환된다.
3. `POST /api/bugs/:id/resolve` 후 `GET /api/profile`의 XP가 증가한다.
4. `POST /api/ai/advice`는 프론트의 기존 AI 패널과 같은 주제별 응답을 반환한다.
5. `POST /api/vault/unlock`은 실제 보안 여부를 `mode`로 구분한다.

## 입력 검증 요약

- `severity`: `critical`, `high`, `med`, `low`
- `status`: `open`, `resolved`, `all`
- `ownerType`: `self`, `partner`
- `progress`: 0 이상 100 이하의 정수
- `xpDelta`: 0 이상 5000 이하의 정수
- 필수 문자열 필드는 공백만 있으면 `400 VALIDATION_ERROR`를 반환한다.
