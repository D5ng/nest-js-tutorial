# 이 프로젝트의 Docker 파일 구성

---

## 프로덕션 / 개발 분리

이 프로젝트는 **프로덕션용**과 **개발용**을 **파일로 분리**해 두었어요. args 없이 "어떤 파일을 쓰느냐"만으로 구분합니다.

### 파일 정리

| 구분 | Dockerfile | docker-compose | 용도 |
|------|------------|----------------|------|
| **프로덕션** | `dockerfile` | `docker-compose.yaml` | 배포·운영. dependencies만 설치 → 이미지 작음. |
| **개발** | `dockerfile.dev` | `docker-compose.dev.yaml` | 로컬에서 Docker로 실행·테스트. devDependencies 포함 (class-validator 등). |

### 차이 요약

| 항목 | 프로덕션 (dockerfile) | 개발 (dockerfile.dev) |
|------|------------------------|------------------------|
| runner 단계 설치 | `pnpm install --frozen-lockfile --prod` | `pnpm install --frozen-lockfile` (전체) |
| NODE_ENV | production | development |
| 이미지 이름 | first-nestjs-app | first-nestjs-app-dev |
| 컨테이너 이름 | first-nestjs-app | first-nestjs-app-dev |

### 언제 무엇을 쓸지

- **배포·스테이징·CI** → `dockerfile` + `docker-compose.yaml`
- **로컬에서 Docker로 띄워서 API 확인** (devDependencies 필요) → `dockerfile.dev` + `docker-compose.dev.yaml`

### 개발 모드: develop.watch (실시간 반영)

`docker-compose.dev.yaml` 의 app 서비스에는 **develop.watch** 가 설정돼 있어요. Compose가 호스트 변경을 감지해서 컨테이너에 반영합니다.

| action | path | 동작 |
|--------|------|------|
| **sync** | `./src` | 호스트의 `src/` 를 컨테이너 `/usr/src/app/src` 로 동기화. 코드 수정 시 `nest start --watch` 가 변경을 감지해 자동 재시작. |
| **rebuild** | `package.json` | `package.json` 이 바뀌면 이미지를 다시 빌드. |
| **rebuild** | `pnpm-lock.yaml` | lock 파일이 바뀌면 이미지를 다시 빌드. |

- **sync**: 전체 프로젝트를 마운트하지 않고 `src` 만 동기화하므로, `node_modules` 는 이미지 것을 그대로 씀. 기동 시 `pnpm install` 이 필요 없음.
- **rebuild**: 의존성 추가/변경 후 저장하면 Compose가 이미지를 재빌드하고 앱 컨테이너를 다시 띄움.
- **요구 사항**: Docker Compose **v2.22+** (watch 기능 지원).

---

## PostgreSQL 서비스 (docker-compose)

두 compose 파일 모두 **PostgreSQL 16 (Alpine)** 서비스 `db`를 포함해요.

| 항목 | 설명 |
|------|------|
| **이미지** | `postgres:16-alpine` |
| **볼륨** | 프로덕션 `pgdata`, 개발 `pgdata_dev` — 컨테이너를 지워도 DB 데이터 유지 |
| **healthcheck** | `pg_isready`로 준비될 때까지 대기 → 앱은 `depends_on: db (condition: service_healthy)` 로 DB 준비 후 기동 |
| **앱에서 접속** | Docker 내부에서는 호스트명 `db` 사용. compose가 앱에 `DB_HOST=db`, `DB_PORT=5432` 등 전달 |

`.env` 또는 compose 기본값: `DB_USERNAME=postgres`, `DB_PASSWORD=postgres`, `DB_DATABASE=first_nestjs_db`.  
TypeORM/Prisma 연결 시 이 환경 변수를 사용하면 됨.
