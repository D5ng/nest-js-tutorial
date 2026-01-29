# =============================================================================
# NestJS 앱을 위한 Dockerfile (멀티 스테이지 빌드)
# =============================================================================
# 이 파일은 "어떤 순서로, 어떤 환경에서 앱을 조립하고 실행할지"를 적어 둔 설계도예요.
# 아래에서 FROM이 두 번 나오면 → "두 번의 별도 환경(builder, runner)"을 만든 뒤,
# 마지막 환경의 결과물만 최종 이미지가 됩니다.
# =============================================================================

# -----------------------------------------------------------------------------
# 1단계: "빌더(builder)" 스테이지 — 여기서만 TypeScript 빌드 & dev 의존성 사용
# -----------------------------------------------------------------------------
# FROM = "이 스테이지의 출발점이 될 기본 이미지를 지정"
# node:20-alpine = Node.js 20 버전 + Alpine 리눅스(용량이 작은 배포판)
# AS builder = 이 스테이지에 이름을 붙여서, 나중에 "builder에서 뭔가 가져오기" 할 수 있게 함
FROM node:20-alpine AS builder

# WORKDIR = "이후 명령어들이 실행될 작업 폴더". 없으면 만들어 줌.
WORKDIR /usr/src/app

# Node 20 에 포함된 corepack 으로 pnpm 활성화 (별도 npm install -g pnpm 불필요)
# corepack = Node 공식 패키지 매니저 래퍼 (pnpm, yarn 사용 시 권장)
RUN corepack enable && corepack prepare pnpm@latest --activate

# COPY = "호스트의 파일을 이미지 안으로 복사"
# package.json + pnpm-lock.yaml 먼저 복사 → 레이어 캐시 활용 (소스 바뀌어도 의존성 단계는 캐시됨)
# 프로젝트에 .npmrc 가 있으면 다음 줄에 COPY .npmrc ./ 추가하면 됨
COPY package.json pnpm-lock.yaml ./

# pnpm install --frozen-lockfile = lock 파일을 바꾸지 않고 엄격히 따름 (npm ci 와 동일한 역할)
# lock 과 맞지 않으면 설치 실패 → "내 PC에선 되는데 서버에선 안 돼" 방지
RUN pnpm install --frozen-lockfile

# 이제 소스 전체를 복사. (.dockerignore 에 있는 건 제외되고 복사됨)
COPY . .

# NestJS 빌드: TypeScript → JavaScript, 결과물은 dist/ 폴더에 생성됨
RUN pnpm run build

# -----------------------------------------------------------------------------
# 2단계: "러너(runner)" 스테이지 — 프로덕션용 최종 이미지
# -----------------------------------------------------------------------------
# 개발 모드(devDependencies 포함)가 필요하면 dockerfile.dev + docker-compose.dev.yaml 사용.
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

# runner 스테이지에서도 pnpm 사용 (builder 와 동일하게 corepack 활성화)
RUN corepack enable && corepack prepare pnpm@latest --activate

# 프로덕션: dependencies 만 설치 → 이미지 크기 최소화
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# COPY --from=다른스테이지 = "다른 스테이지의 파일만 가져오기"
# builder 스테이지에서 만든 dist/ 폴더만, 현재 스테이지의 ./dist 로 복사
# → TypeScript 소스, node_modules(빌더용) 는 이 스테이지에 없음. 깔끔함.
COPY --from=builder /usr/src/app/dist ./dist

# USER = "이후 실행되는 프로세스의 권한을 이 사용자로"
# node 이미지가 미리 만들어 둔 비-root 사용자 "node" 로 전환.
# root 로 돌리면 컨테이너가 뚫렸을 때 위험도가 커지므로, 가능하면 비-root 로 실행.
USER node

# ENV = "컨테이너 안에서 쓰일 환경 변수"
# PORT=8080 → NestJS가 process.env.PORT 를 읽으면 8080 으로 리스닝 (main.ts 기본값과 맞춤)
ENV NODE_ENV=production
ENV PORT=8080

# EXPOSE = "이 이미지는 이 포트를 쓴다"고 문서로 남기는 것. 실제로 포트를 열거나 바인딩하는 건 아님.
# 실제 포트 매핑은 docker run -p 8080:8080 처럼 할 때 이루어짐.
# PORT=8080 이니까 EXPOSE 도 8080 으로 맞춰 두는 게 일관됨.
EXPOSE 8080

# CMD = "이 이미지로 컨테이너가 실행될 때, 기본으로 돌릴 명령"
# JSON 배열 형태로 쓰면 "쉘을 거치지 않고" 그대로 실행됨 → 시그널(SIGTERM 등)이 앱까지 제대로 전달됨.
# "npm run start:prod" 로 하면 PID 1 이 npm 이 되어서, docker stop 시 시그널이 node 에 안 넘어갈 수 있음.
# 그래서 node 를 직접 실행하는 걸 권장함.
CMD ["node", "dist/main.js"]
