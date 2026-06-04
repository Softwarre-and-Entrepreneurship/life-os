# ⚡ Life OS

> 인생을 게임처럼 운영하는 대시보드 — 목표 관리, 버그 트래킹, AI 컨설팅, 디지털 유언장

![Life OS](https://img.shields.io/badge/Life%20OS-v2.0%20BETA-a855f7?style=flat-square)
![Node](https://img.shields.io/badge/Node-24-339933?style=flat-square&logo=node.js)
![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)

---

## 📁 프로젝트 구조

```
life-os/
├── front/   # React + Vite 프론트엔드
└── back/    # Express + SQLite 백엔드
```

---

## 🚀 실행 방법

### 1. 백엔드 + 프론트엔드 동시 실행 (권장)

```bash
cd back
npm install
npm run dev:local
```

| 서버 | 주소 |
|------|------|
| 프론트엔드 | http://127.0.0.1:5173 |
| 백엔드 API | http://127.0.0.1:4000 |

### 2. 각각 따로 실행

```bash
# 터미널 1 — 백엔드
cd back
npm install
npm run dev

# 터미널 2 — 프론트엔드
cd front
npm install
npm run dev
```

---

## 🔐 기본 계정

| 아이디 | 비밀번호 |
|--------|----------|
| `whale` | `1234` |

로그인 후 **회원가입**으로 새 계정도 만들 수 있습니다.

---

## ✨ 주요 기능

| 기능 | 설명 |
|------|------|
| ⚡ **Command Center** | 인생 티어 · XP · 데드라인 로드맵 편집 · 목표 달성률 관리 |
| 🐛 **Bug Tracker** | 나쁜 습관·미달성 항목을 버그로 등록하고 해결 시 XP 획득 |
| 🔒 **Encrypted Vault** | 가치관 선언문·메모리 아카이브·미래 편지함(날짜+비밀번호)·디지털 자산 |
| 💑 **Co-op Sync** | 파트너와 목표 달성률 공유 및 동기화 |
| 🤖 **AI 컨설팅** | MVP 전략·피칭·게이미피케이션 AI 조언 |

---

## 🛠 기술 스택

**프론트엔드**
- React 18 + Vite 5
- Vanilla CSS (CSS Variables)

**백엔드**
- Node.js 24 + Express 5
- SQLite (better-sqlite3)
- 세션 기반 인증 (scrypt 비밀번호 해싱)

---

## ⚙️ 환경 변수

`.env` 파일 없이도 기본값으로 바로 실행됩니다.

변경이 필요한 경우 `back/` 폴더에 `.env` 파일 생성:

```env
PORT=4000
HOST=127.0.0.1
CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
DB_PATH=data/life-os.sqlite
```

---

## 🗄 데이터 관리

```bash
cd back

npm run backup          # DB 백업
npm run reset -- --force  # DB 초기화 (시드 데이터 포함 재생성)
npm run health          # 서버 상태 확인
npm run smoke           # API 전체 흐름 테스트
```

---

## 📋 요구 사항

- Node.js 24 이상
