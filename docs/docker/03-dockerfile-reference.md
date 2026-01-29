# Dockerfile 한 줄 한 줄 요약 (프로덕션용 dockerfile 기준)

| 지시어 | 역할 |
|--------|------|
| `FROM node:20-alpine AS builder` | Node 20 + Alpine 기반의 "builder" 스테이지 시작. |
| `WORKDIR /usr/src/app` | 이후 명령이 실행될 디렉터리를 `/usr/src/app`으로 설정. |
| `RUN corepack enable && corepack prepare pnpm@latest --activate` | Node 20 내장 corepack으로 pnpm 활성화. |
| `COPY package.json pnpm-lock.yaml ./` | package 파일 + lock 파일 먼저 복사 → 레이어 캐시 활용. |
| `RUN pnpm install --frozen-lockfile` | pnpm-lock.yaml 기준으로 의존성 설치 (환경 일관성). |
| `COPY . .` | 소스 전체 복사 (.dockerignore 제외). |
| `RUN pnpm run build` | NestJS 빌드 → `dist/` 생성. |
| `FROM node:20-alpine AS runner` | 새로운 "runner" 스테이지 시작 (깨끗한 환경). |
| `RUN corepack enable && corepack prepare pnpm@latest --activate` | runner에서도 pnpm 활성화. |
| `COPY package.json pnpm-lock.yaml ./` | package 파일만 복사. |
| `RUN pnpm install --frozen-lockfile --prod` | 실행에 필요한 dependencies만 설치 (devDependencies 제외). |
| `COPY --from=builder /usr/src/app/dist ./dist` | builder 스테이지에서 만든 `dist/`만 가져옴. |
| `USER node` | root 대신 `node` 사용자로 실행 (권한 최소화). |
| `ENV NODE_ENV=production` | 프로덕션 모드로 동작하도록 설정. |
| `ENV PORT=8080` | 앱이 리스닝할 포트를 8080으로. |
| `EXPOSE 8080` | "이 이미지는 8080 포트를 쓴다"고 문서화. (실제 포트 열기는 `docker run -p`에서 함) |
| `CMD ["node", "dist/main.js"]` | 컨테이너 실행 시 기본 명령: Node로 `dist/main.js` 실행. |
