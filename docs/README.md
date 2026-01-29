# 문서 목차

프로젝트 루트의 [README.md](../README.md)에서 요약한 내용을, **원리와 "왜?"** 위주로 풀어 둔 문서예요.

---

## 백엔드·프레임워크·라이브러리 비교

| 문서                                                         | 내용                                                                                                      |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| [nestjs-express.md](./nestjs-express.md)                     | NestJS 특징(구조, DI, 데코레이터, 파이프·가드) 및 Express와 비교. 왜 Nest가 "구조를 얹은 프레임워크"인지. |
| [typeorm-prisma.md](./typeorm-prisma.md)                     | TypeORM vs Prisma. 스키마 정의 방식, Nest 연동, 쿼리·마이그레이션·적합한 경우.                            |
| [class-validator-nest-zod.md](./class-validator-nest-zod.md) | class-validator vs nest-zod. DTO 검증을 데코레이터 vs Zod 스키마로 할 때의 차이.                          |

---

## Docker·Compose

| 문서                                                                     | 내용                                                                             |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| [docker/README.md](./docker/README.md)                                   | Docker 가이드 **목차** 및 빠른 참조.                                             |
| [docker/01-concepts.md](./docker/01-concepts.md)                         | Docker 기초 — 이미지/컨테이너, Dockerfile, 레이어, 빌드 컨텍스트, 멀티 스테이지. |
| [docker/02-project-setup.md](./docker/02-project-setup.md)               | 이 프로젝트의 Docker 파일 구성 — 프로덕션/개발 분리, develop.watch, PostgreSQL.  |
| [docker/03-dockerfile-reference.md](./docker/03-dockerfile-reference.md) | Dockerfile 한 줄 한 줄 요약.                                                     |
| [docker/04-build-and-run.md](./docker/04-build-and-run.md)               | 빌드 & 실행 방법.                                                                |
| [docker/05-postgresql-psql.md](./docker/05-postgresql-psql.md)           | Docker PostgreSQL에 psql로 접속하기.                                             |
| [docker/06-faq.md](./docker/06-faq.md)                                   | Docker 관련 "왜?" 질문.                                                          |
