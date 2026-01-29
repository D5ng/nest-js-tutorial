# Docker & Dockerfile 디테일 가이드

도커를 잘 모르는 분을 위해, **왜 이렇게 쓰는지** 위주로 정리한 문서예요.

---

## 빠른 참조 (Quick Reference)

| 목적                                         | 명령                                                   |
| -------------------------------------------- | ------------------------------------------------------ |
| **프로덕션** (배포·운영용, 이미지 작음)      | `docker compose up --build`                            |
| **개발** (devDependencies 포함, 로컬 테스트) | `docker compose -f docker-compose.dev.yaml up --build` |
| 중지 (프로덕션)                              | `docker compose down`                                  |
| 중지 (개발)                                  | `docker compose -f docker-compose.dev.yaml down`       |

접속: http://localhost:8080

---

## 1. Docker가 뭔가요?

### 한 줄로

**“내 앱이 돌아가는 환경(OS + 런타임 + 의존성)을 통째로 하나의 패키지처럼 만들어서, 어디서든 똑같이 돌리게 하는 도구”**라고 보면 됩니다.

### 이미지 vs 컨테이너

| 용어                    | 비유                                      | 설명                                                                                            |
| ----------------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------- |
| **이미지(Image)**       | 설계도 + 재료가 담긴 상자                 | 실행 가능한 파일 시스템 + 설정. **읽기 전용**. `docker build`로 만듦.                           |
| **컨테이너(Container)** | 그 상자를 열어서 실제로 돌아가는 프로세스 | 이미지를 **실행한 상태**. 프로세스가 돌아가고, 파일을 쓰고 지울 수 있음. `docker run`으로 만듦. |

- 이미지 하나로 컨테이너를 **여러 개** 띄울 수 있어요 (같은 앱을 여러 인스턴스로).
- 컨테이너를 지우면 그 안에서 쓴 데이터는 사라지고, 이미지는 그대로 남아요.

---

## 2. Dockerfile이 뭔가요?

**“이미지를 어떻게 만들지”를 적어 둔 설계도**예요.

- **어떤 기본 이미지**에서 시작할지 (예: `node:20-alpine`)
- **어떤 파일을 복사**하고, **어떤 명령을 실행**할지
- **실행할 때 기본으로 뭘 돌릴지** (예: `node dist/main.js`)

를 한 줄 한 줄 적어 두면, Docker가 그걸 읽고 **레이어를 쌓아서** 최종 이미지를 만들어 줍니다.

---

## 3. 레이어(Layer)란?

Dockerfile의 **한 줄 한 줄(실제로는 RUN, COPY 등)**이 각각 **하나의 레이어**가 됩니다.

- 각 레이어는 **캐시**될 수 있어요.
- **어느 한 줄이 바뀌면**, 그 줄부터 아래 레이어는 **다시** 만들고, 위쪽은 캐시를 그대로 씁니다.
- 그래서 **자주 안 바뀌는 것**(예: `package.json` 복사 + `npm ci`)을 **위에** 두고, **자주 바뀌는 것**(소스 복사 + 빌드)을 **아래**에 두면 빌드가 빨라져요.

---

## 4. 빌드 컨텍스트(Build Context)

`docker build`를 실행하면, **지정한 폴더 전체**가 Docker 데몬으로 전달됩니다. 이걸 **빌드 컨텍스트**라고 해요.

- `COPY . .` 는 “컨텍스트 안의 파일”을 이미지로 복사하는데,
- **`.dockerignore`에 적힌 경로/파일은 컨텍스트에서 제외**되므로 복사되지 않아요.
- 그래서 `node_modules`, `.git`, `.env` 같은 걸 넣지 않으면 **빌드가 빨라지고**, **보안도** 좋아져요.

---

## 5. 멀티 스테이지 빌드란?

**Dockerfile 안에 `FROM`이 여러 번** 나오면, **여러 “스테이지”**가 생깁니다.

- **1단계(builder)**: TypeScript 빌드용. `npm ci`(전체 의존성) + `npm run build` → `dist/` 생성.
- **2단계(runner)**: 실제 서비스용. `npm ci --only=production` + builder에서 만든 `dist/`만 가져옴.

**왜 나누나요?**

- 최종 이미지에는 **실행에 필요한 것만** 넣고 싶어요.
- 빌드 도구(tsc, nest-cli, devDependencies)는 **실행 시엔 필요 없어서** 두 번째 스테이지에 안 넣음.
- 그 결과 **이미지 크기가 작아지고**, 불필요한 도구가 노출되지 않아 **보안**에도 좋아요.

---

## 5-2. 이 프로젝트의 Docker 파일 구성 (프로덕션 / 개발 분리)

이 프로젝트는 **프로덕션용**과 **개발용**을 **파일로 분리**해 두었어요. args 없이 “어떤 파일을 쓰느냐”만으로 구분합니다.

### 파일 정리

| 구분         | Dockerfile       | docker-compose            | 용도                                                                      |
| ------------ | ---------------- | ------------------------- | ------------------------------------------------------------------------- |
| **프로덕션** | `dockerfile`     | `docker-compose.yaml`     | 배포·운영. dependencies만 설치 → 이미지 작음.                             |
| **개발**     | `dockerfile.dev` | `docker-compose.dev.yaml` | 로컬에서 Docker로 실행·테스트. devDependencies 포함 (class-validator 등). |

### 차이 요약

| 항목             | 프로덕션 (dockerfile)                   | 개발 (dockerfile.dev)                   |
| ---------------- | --------------------------------------- | --------------------------------------- |
| runner 단계 설치 | `pnpm install --frozen-lockfile --prod` | `pnpm install --frozen-lockfile` (전체) |
| NODE_ENV         | production                              | development                             |
| 이미지 이름      | first-nestjs-app                        | first-nestjs-app-dev                    |
| 컨테이너 이름    | first-nestjs-app                        | first-nestjs-app-dev                    |

### 언제 무엇을 쓸지

- **배포·스테이징·CI** → `dockerfile` + `docker-compose.yaml`
- **로컬에서 Docker로 띄워서 API 확인** (devDependencies 필요) → `dockerfile.dev` + `docker-compose.dev.yaml`

### 5-3. PostgreSQL 서비스 (docker-compose)

두 compose 파일 모두 **PostgreSQL 16 (Alpine)** 서비스 `db`를 포함해요.

| 항목 | 설명 |
|------|------|
| **이미지** | `postgres:16-alpine` |
| **볼륨** | 프로덕션 `pgdata`, 개발 `pgdata_dev` — 컨테이너를 지워도 DB 데이터 유지 |
| **healthcheck** | `pg_isready`로 준비될 때까지 대기 → 앱은 `depends_on: db (condition: service_healthy)` 로 DB 준비 후 기동 |
| **앱에서 접속** | Docker 내부에서는 호스트명 `db` 사용. compose가 앱에 `DB_HOST=db`, `DB_PORT=5432` 등 전달 |

`.env` 또는 compose 기본값: `DB_USERNAME=postgres`, `DB_PASSWORD=postgres`, `DB_DATABASE=first_nestjs_db`.  
TypeORM/Prisma 연결 시 이 환경 변수를 사용하면 됨.

---

## 6. 이 Dockerfile 한 줄 한 줄 요약 (프로덕션용 dockerfile 기준)

| 지시어                                                           | 역할                                                                               |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `FROM node:20-alpine AS builder`                                 | Node 20 + Alpine 기반의 “builder” 스테이지 시작.                                   |
| `WORKDIR /usr/src/app`                                           | 이후 명령이 실행될 디렉터리를 `/usr/src/app`으로 설정.                             |
| `RUN corepack enable && corepack prepare pnpm@latest --activate` | Node 20 내장 corepack으로 pnpm 활성화.                                             |
| `COPY package.json pnpm-lock.yaml ./`                            | package 파일 + lock 파일 먼저 복사 → 레이어 캐시 활용.                             |
| `RUN pnpm install --frozen-lockfile`                             | pnpm-lock.yaml 기준으로 의존성 설치 (환경 일관성).                                 |
| `COPY . .`                                                       | 소스 전체 복사 (.dockerignore 제외).                                               |
| `RUN pnpm run build`                                             | NestJS 빌드 → `dist/` 생성.                                                        |
| `FROM node:20-alpine AS runner`                                  | 새로운 “runner” 스테이지 시작 (깨끗한 환경).                                       |
| `RUN corepack enable && corepack prepare pnpm@latest --activate` | runner에서도 pnpm 활성화.                                                          |
| `COPY package.json pnpm-lock.yaml ./`                            | package 파일만 복사.                                                               |
| `RUN pnpm install --frozen-lockfile --prod`                      | 실행에 필요한 dependencies만 설치 (devDependencies 제외).                          |
| `COPY --from=builder /usr/src/app/dist ./dist`                   | builder 스테이지에서 만든 `dist/`만 가져옴.                                        |
| `USER node`                                                      | root 대신 `node` 사용자로 실행 (권한 최소화).                                      |
| `ENV NODE_ENV=production`                                        | 프로덕션 모드로 동작하도록 설정.                                                   |
| `ENV PORT=8080`                                                  | 앱이 리스닝할 포트를 8080으로.                                                     |
| `EXPOSE 8080`                                                    | “이 이미지는 8080 포트를 쓴다”고 문서화. (실제 포트 열기는 `docker run -p`에서 함) |
| `CMD ["node", "dist/main.js"]`                                   | 컨테이너 실행 시 기본 명령: Node로 `dist/main.js` 실행.                            |

---

## 7. 빌드 & 실행 방법

### 7-1. docker-compose 로 실행 (권장)

| 목적         | 명령                                                   | 접속                  |
| ------------ | ------------------------------------------------------ | --------------------- |
| **프로덕션** | `docker compose up --build`                            | http://localhost:8080 |
| **개발**     | `docker compose -f docker-compose.dev.yaml up --build` | http://localhost:8080 |

- 백그라운드 실행: 위 명령에 `-d` 추가 (예: `docker compose up -d --build`).
- 중지·삭제: `docker compose down` (개발은 `docker compose -f docker-compose.dev.yaml down`).

### 7-2. docker 명령만으로 빌드·실행

**프로덕션 이미지**

```bash
# 이미지 빌드
docker build -f dockerfile -t first-nestjs-app .

# 컨테이너 실행 (호스트 8080 ↔ 컨테이너 8080)
docker run -p 8080:8080 --name my-app first-nestjs-app
```

**개발 이미지**

```bash
# 이미지 빌드
docker build -f dockerfile.dev -t first-nestjs-app-dev .

# 컨테이너 실행
docker run -p 8080:8080 --name my-app-dev first-nestjs-app-dev
```

- `-f`: 사용할 Dockerfile 파일.
- `-t`: 이미지 이름(태그).
- 브라우저에서 `http://localhost:8080` 으로 접속.

### 7-3. 자주 쓰는 명령

```bash
# 실행 중인 컨테이너 목록
docker ps

# 모든 컨테이너(중지된 것 포함) 목록
docker ps -a

# 컨테이너 중지
docker stop my-app

# 컨테이너 삭제
docker rm my-app

# 이미지 삭제
docker rmi first-nestjs-app
```

---

## 7-4. docker-compose 옵션 설명

| 항목                                 | 의미                                                                                    |
| ------------------------------------ | --------------------------------------------------------------------------------------- |
| `build.context` / `build.dockerfile` | 어떤 Dockerfile 로 이미지를 빌드할지 지정. (프로덕션: dockerfile, 개발: dockerfile.dev) |
| `ports: "8080:8080"`                 | 호스트 8080 포트 ↔ 컨테이너 8080 포트 연결.                                             |
| `environment`                        | 컨테이너 안에 넣을 환경 변수.                                                           |
| `env_file: [.env]`                   | 프로젝트 루트의 `.env` 내용을 환경 변수로 주입.                                         |
| `restart: unless-stopped`            | 컨테이너가 죽으면 자동 재시작 (재부팅 후에도 유지).                                     |

### compose 공통 명령

```bash
# 실행 중인 서비스 확인
docker compose ps
# 개발: docker compose -f docker-compose.dev.yaml ps

# 로그 보기
docker compose logs -f app
# 개발: docker compose -f docker-compose.dev.yaml logs -f app

# 중지 & 컨테이너 삭제
docker compose down
# 개발: docker compose -f docker-compose.dev.yaml down
```

- `--build`: 이미지가 없거나 Dockerfile/소스가 바뀌었을 때 다시 빌드.

---

## 8. 한 번 더 생각해볼 "왜?" 질문

1. **Alpine을 쓰는 이유는?**  
   이미지가 작아서 다운로드·디스크 사용이 줄고, 포함된 패키지가 적어서 보안 면에서도 유리해요. 대신 glibc가 아니라 musl libc라서, 일부 네이티브 모듈은 호환이 안 될 수 있어요.

2. **EXPOSE는 실제로 포트를 안 여는데 왜 쓰나요?**  
   “이 이미지는 이 포트를 쓴다”는 **문서/계약** 역할이에요. 실제로 포트를 쓰는 건 `docker run -p`나 오케스트레이터 설정이에요.

3. **CMD를 JSON 배열로 쓰는 이유는?**  
   `CMD ["node", "dist/main.js"]` 처럼 쓰면 **쉘을 거치지 않고** node가 직접 실행돼요. 그래서 `docker stop` 시 보내는 SIGTERM이 node 프로세스까지 제대로 전달돼서, 그레이스풀 셧다운을 할 수 있어요.

4. **이 프로젝트는 pnpm을 쓰나요?**  
   네. Dockerfile은 `pnpm-lock.yaml`을 쓰고, Node 20에 포함된 **corepack**으로 pnpm을 활성화해요. `package-lock.json`은 필요 없어요.

5. **USER node로 바꾸면 권한 문제가 생기지 않나요?**  
   `node` 사용자는 보통 `/usr/src/app` 같은 앱 디렉터리에 쓰기 권한이 있도록 이미지에서 설정돼 있어요. 그 밖의 시스템 디렉터리는 쓰지 못하게 두는 게 보안상 맞고, 필요하면 Dockerfile에서 해당 디렉터리 소유자를 `node`로 바꿔 주면 됩니다.

6. **프로덕션과 개발 Dockerfile을 왜 나눠 두나요?**  
   프로덕션 이미지는 **용량·보안**을 위해 dependencies만 넣고, 개발 이미지는 **class-validator 같은 devDependencies**까지 넣어서 로컬에서 Docker로 띄울 때 그대로 쓸 수 있게 하려고요. 빌드 인자(args) 대신 **파일을 분리**해 두면 “어떤 Dockerfile을 쓰느냐”만 보면 되어서, 설정이 단순해집니다.

---

이 문서는 `dockerfile` / `dockerfile.dev`와 함께 두고, **“이 줄이 왜 있지?”** 할 때 참고하면 됩니다.
