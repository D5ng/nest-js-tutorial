# NestJS 찍먹해보기

NestJS + TypeORM + PostgreSQL 을 Docker 로 띄워서 쓰는 예제 프로젝트예요.

Express로 개발하다가 NestJS의 구조를 살펴보니, Layered Architecture 를 데코레이터와 DI 로 더 일관되게 쓸 수 있겠다고 느꼈어요. 그래서 이쪽으로 공부하면서 **실제로 한 번 돌려보고 정리한 내용**을 이 저장소에 담았습니다.

- **기능**: Post(게시글) CRUD API, class-validator 로 DTO 검증, TypeORM Repository 패턴.
- **운영**: 프로덕션/개발용 Dockerfile 분리, docker-compose 로 앱 + PostgreSQL 한 번에 기동.
- **개발 경험**: 개발 compose 에서는 `develop.watch` 로 `src/` 수정 시 자동 동기화·재시작, `package.json` 변경 시 이미지 재빌드.
- **문서**: Docker·compose·watch 사용법, NestJS/Express·TypeORM/Prisma 비교는 아래 섹션과 [docs/docker/](./docs/docker/) 에 정리해 두었어요.

---

## 왜 NestJS인가 (Express와 비교)

| 구분                | Express                                                   | NestJS                                                                            |
| ------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------- |
| **구조**            | 자유형. 폴더/아키텍처를 직접 정함.                        | 모듈·컨트롤러·서비스로 **계층이 정해져 있음**. 팀 단위로 일관된 구조 유지에 유리. |
| **의존성 주입**     | 없음. 필요하면 직접 연결.                                 | **내장 DI**. 테스트 시 mock 치환, 결합도 낮추기 쉬움.                             |
| **타입/데코레이터** | JS 위주. TS 쓰려면 직접 세팅.                             | **TS·데코레이터 기반**. 라우트·검증·엔티티를 선언적으로 작성.                     |
| **적합한 경우**     | 소규모 API, 빠른 프로토타입, 구조보다 유연성이 중요할 때. | 중규모 이상, 팀 개발, 유지보수·테스트를 오래 할 서비스.                           |

NestJS는 “Express 위에 구조와 규칙을 얹은 프레임워크”에 가깝다. Express의 유연함은 줄고, **일관된 아키텍처·DI·TS** 로 대규모/장기 프로젝트에 맞춤.

---

## TypeORM vs Prisma

| 구분             | TypeORM                                                                    | Prisma                                                                             |
| ---------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **스타일**       | 엔티티·데코레이터 기반. 클래스에 `@Entity`, `@Column` 등으로 스키마 정의.  | **스키마 파일**(`schema.prisma`) 로 모델 정의. 코드 생성으로 타입·클라이언트 생성. |
| **NestJS 연동**  | `@nestjs/typeorm` 으로 **모듈에 통합**. Repository 패턴, DI 와 잘 맞음.    | `PrismaService` 로 주입. 공식 지원 있음.                                           |
| **쿼리**         | QueryBuilder, Repository 메서드, Raw SQL. 관계 로딩은 `relations` 옵션 등. | **선언적** `include` / `select`. 타입 안전하고 가독성 좋음.                        |
| **마이그레이션** | CLI 로 생성·실행. DB 스키마와 엔티티를 맞추는 작업 필요.                   | `prisma migrate`. 스키마에서 마이그레이션 생성. 툴링이 정돈돼 있음.                |
| **적합한 경우**  | NestJS·데코레이터·Repository 패턴에 익숙할 때, 기존 ORM 경험 활용.         | 새 프로젝트, 팀이 Prisma 문법을 선호할 때, 타입·DX 중시.                           |

이 프로젝트는 **TypeORM** 을 사용한다. NestJS 모듈·DI·엔티티 데코레이터와 한 세트로 쓰기 편하고, 레이어드 아키텍처(Controller → Service → Repository) 에 잘 맞기 때문이다.

---

## API 엔드포인트

기본 URL: `http://localhost:8080`

| 메서드 | 경로         | 설명             | Body (JSON)                                                                        |
| ------ | ------------ | ---------------- | ---------------------------------------------------------------------------------- |
| GET    | `/`          | 헬로 메시지      | —                                                                                  |
| GET    | `/posts`     | 게시글 목록 조회 | —                                                                                  |
| GET    | `/posts/:id` | 게시글 단건 조회 | —                                                                                  |
| POST   | `/posts`     | 게시글 생성      | `{ "title": string, "content": string, "authorId": number }`                       |
| PUT    | `/posts/:id` | 게시글 수정      | `{ "title"?: string, "content"?: string, "authorId"?: number }` (일부만 보내도 됨) |
| DELETE | `/posts/:id` | 게시글 삭제      | —                                                                                  |

`id` 는 숫자. POST/PUT Body 는 `Content-Type: application/json`.

---

## 1. 로컬에서 실행 (DB 별도)

```bash
pnpm install
cp .env.example .env   # 필요 시 값 수정
pnpm run start:dev     # http://localhost:8080
```

DB 는 로컬 PostgreSQL 이나 Docker 로 따로 띄우고, `.env` 의 `DB_HOST` / `DB_PORT` 등만 맞추면 됨.

---

## 2. Docker 로 한 번에 실행 (앱 + PostgreSQL)

| 목적         | 명령                                                   | 접속                    |
| ------------ | ------------------------------------------------------ | ----------------------- |
| **개발**     | `docker compose -f docker-compose.dev.yaml up --build` | <http://localhost:8080> |
| **프로덕션** | `docker compose up --build`                            | <http://localhost:8080> |

- **개발**: `src/` 수정 시 develop.watch 로 자동 동기화 + `nest start --watch` 재시작. `package.json` 변경 시 이미지 자동 재빌드.
- 중지: `docker compose down` (개발은 `-f docker-compose.dev.yaml` 추가).

---

## 3. 문서

- **Docker / compose / develop.watch**: [docs/docker/README.md](./docs/docker/README.md) 부터 보면 됨.

---

## 4. 주요 스크립트

| 스크립트                   | 설명                          |
| -------------------------- | ----------------------------- |
| `pnpm run start:dev`       | watch 모드로 로컬 실행        |
| `pnpm run build`           | 빌드                          |
| `pnpm run docker:dev:up`   | 개발용 Docker 백그라운드 기동 |
| `pnpm run docker:dev:down` | 개발용 Docker 중지            |
