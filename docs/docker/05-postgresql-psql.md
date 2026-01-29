# Docker PostgreSQL에 psql로 접속하기

Docker로 띄운 PostgreSQL에 **psql**로 접속하는 방법은 두 가지예요.

---

## 방법 1: 컨테이너 안에서 psql 실행 (docker exec)

DB 컨테이너 안에 이미 `psql`이 있으므로, `docker exec`로 들어가서 실행하면 됩니다.

### 프로덕션 (docker-compose.yaml 로 띄운 경우)

```bash
docker exec -it first-nestjs-db psql -U postgres -d first_nestjs_db
```

### 개발 (docker-compose.dev.yaml 로 띄운 경우)

```bash
docker exec -it first-nestjs-db-dev psql -U postgres -d first_nestjs_db
```

- `-it`: 터미널을 붙여서 대화형으로 사용
- `-U postgres`: 사용자 이름 (`.env`의 `DB_USERNAME`과 맞추면 됨)
- `-d first_nestjs_db`: DB 이름 (`.env`의 `DB_DATABASE`와 맞추면 됨)

`.env`에서 사용자/DB 이름을 바꿨다면 그에 맞게 `-U`, `-d` 값을 넣으면 됨.

---

## 방법 2: 호스트에서 psql 클라이언트로 접속

로컬에 **psql**(PostgreSQL 클라이언트)이 설치돼 있다면, compose가 매핑한 **호스트 포트**로 접속할 수 있어요.

- compose에서 `ports: "${DB_PORT:-5432}:5432"` 로 매핑했으므로,
  `.env`에 `DB_PORT=5432`(또는 비어 있으면 5432)면 **localhost:5432** 로 접속
- 5432가 이미 쓰이고 있어서 다른 포트(예: 5433)로 매핑했다면 **localhost:5433** 으로 접속

```bash
# 기본 포트 5432 로 매핑했다면
psql -h localhost -p 5432 -U postgres -d first_nestjs_db

# .env 에 DB_PORT=5433 등으로 바꿨다면
psql -h localhost -p 5433 -U postgres -d first_nestjs_db
```

비밀번호는 compose/DB 설정에 넣은 값(기본 `postgres`)을 입력하면 됨.

---

## 요약

| 접속 방식       | 프로덕션                                                              | 개발                                                                      |
| --------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| **docker exec** | `docker exec -it first-nestjs-db psql -U postgres -d first_nestjs_db` | `docker exec -it first-nestjs-db-dev psql -U postgres -d first_nestjs_db` |
| **호스트 psql** | `psql -h localhost -p <DB_PORT> -U postgres -d first_nestjs_db`       | 동일 (같은 포트 쓰면 한 번에 하나만 띄울 수 있음)                         |
