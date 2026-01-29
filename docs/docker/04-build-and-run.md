# 빌드 & 실행 방법

---

## 1. docker-compose 로 실행 (권장)

| 목적 | 명령 | 접속 |
|------|------|------|
| **프로덕션** | `docker compose up --build` | http://localhost:8080 |
| **개발** | `docker compose -f docker-compose.dev.yaml up --build` | http://localhost:8080 |

- 백그라운드 실행: 위 명령에 `-d` 추가 (예: `docker compose up -d --build`).
- 중지·삭제: `docker compose down` (개발은 `docker compose -f docker-compose.dev.yaml down`).

---

## 2. docker 명령만으로 빌드·실행

### 프로덕션 이미지

```bash
# 이미지 빌드
docker build -f dockerfile -t first-nestjs-app .

# 컨테이너 실행 (호스트 8080 ↔ 컨테이너 8080)
docker run -p 8080:8080 --name my-app first-nestjs-app
```

### 개발 이미지

```bash
# 이미지 빌드
docker build -f dockerfile.dev -t first-nestjs-app-dev .

# 컨테이너 실행
docker run -p 8080:8080 --name my-app-dev first-nestjs-app-dev
```

- `-f`: 사용할 Dockerfile 파일.
- `-t`: 이미지 이름(태그).
- 브라우저에서 `http://localhost:8080` 으로 접속.

---

## 3. 자주 쓰는 명령

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

## 4. docker-compose 옵션 설명

| 항목 | 의미 |
|------|------|
| `build.context` / `build.dockerfile` | 어떤 Dockerfile 로 이미지를 빌드할지 지정. (프로덕션: dockerfile, 개발: dockerfile.dev) |
| `ports: "8080:8080"` | 호스트 8080 포트 ↔ 컨테이너 8080 포트 연결. |
| `environment` | 컨테이너 안에 넣을 환경 변수. |
| `env_file: [.env]` | 프로젝트 루트의 `.env` 내용을 환경 변수로 주입. |
| `restart: unless-stopped` | 컨테이너가 죽으면 자동 재시작 (재부팅 후에도 유지). |

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
