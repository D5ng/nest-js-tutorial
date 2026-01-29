# Docker 가이드 — 목차

도커를 잘 모르는 분을 위해, **왜 이렇게 쓰는지** 위주로 나눠 둔 문서예요.

---

## 빠른 참조 (Quick Reference)

| 목적 | 명령 |
|------|------|
| **프로덕션** (배포·운영용, 이미지 작음) | `docker compose up --build` |
| **개발** (devDependencies + develop.watch, 실시간 반영) | `docker compose -f docker-compose.dev.yaml up --build` |
| 중지 (프로덕션) | `docker compose down` |
| 중지 (개발) | `docker compose -f docker-compose.dev.yaml down` |

접속: http://localhost:8080

---

## 문서 목차

| 파일 | 내용 |
|------|------|
| [01-concepts.md](./01-concepts.md) | Docker 기초 — 이미지/컨테이너, Dockerfile, 레이어, 빌드 컨텍스트, 멀티 스테이지 |
| [02-project-setup.md](./02-project-setup.md) | 이 프로젝트의 Docker 파일 구성 — 프로덕션/개발 분리, develop.watch, PostgreSQL 서비스 |
| [03-dockerfile-reference.md](./03-dockerfile-reference.md) | Dockerfile 한 줄 한 줄 요약 (프로덕션용 dockerfile 기준) |
| [04-build-and-run.md](./04-build-and-run.md) | 빌드 & 실행 방법 — compose, docker 명령, 자주 쓰는 명령, compose 옵션 |
| [05-postgresql-psql.md](./05-postgresql-psql.md) | Docker PostgreSQL에 psql로 접속하기 |
| [06-faq.md](./06-faq.md) | 한 번 더 생각해볼 "왜?" 질문 |

---

이 문서들은 `dockerfile` / `dockerfile.dev`와 함께 두고, **"이 줄이 왜 있지?"** 할 때 참고하면 됩니다.
