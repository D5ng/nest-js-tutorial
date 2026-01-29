# 한 번 더 생각해볼 "왜?" 질문

---

1. **Alpine을 쓰는 이유는?**  
   이미지가 작아서 다운로드·디스크 사용이 줄고, 포함된 패키지가 적어서 보안 면에서도 유리해요. 대신 glibc가 아니라 musl libc라서, 일부 네이티브 모듈은 호환이 안 될 수 있어요.

2. **EXPOSE는 실제로 포트를 안 여는데 왜 쓰나요?**  
   "이 이미지는 이 포트를 쓴다"는 **문서/계약** 역할이에요. 실제로 포트를 쓰는 건 `docker run -p`나 오케스트레이터 설정이에요.

3. **CMD를 JSON 배열로 쓰는 이유는?**  
   `CMD ["node", "dist/main.js"]` 처럼 쓰면 **쉘을 거치지 않고** node가 직접 실행돼요. 그래서 `docker stop` 시 보내는 SIGTERM이 node 프로세스까지 제대로 전달돼서, 그레이스풀 셧다운을 할 수 있어요.

4. **이 프로젝트는 pnpm을 쓰나요?**  
   네. Dockerfile은 `pnpm-lock.yaml`을 쓰고, Node 20에 포함된 **corepack**으로 pnpm을 활성화해요. `package-lock.json`은 필요 없어요.

5. **USER node로 바꾸면 권한 문제가 생기지 않나요?**  
   `node` 사용자는 보통 `/usr/src/app` 같은 앱 디렉터리에 쓰기 권한이 있도록 이미지에서 설정돼 있어요. 그 밖의 시스템 디렉터리는 쓰지 못하게 두는 게 보안상 맞고, 필요하면 Dockerfile에서 해당 디렉터리 소유자를 `node`로 바꿔 주면 됩니다.

6. **프로덕션과 개발 Dockerfile을 왜 나눠 두나요?**  
   프로덕션 이미지는 **용량·보안**을 위해 dependencies만 넣고, 개발 이미지는 **class-validator 같은 devDependencies**까지 넣어서 로컬에서 Docker로 띄울 때 그대로 쓸 수 있게 하려고요. 빌드 인자(args) 대신 **파일을 분리**해 두면 "어떤 Dockerfile을 쓰느냐"만 보면 되어서, 설정이 단순해집니다.

7. **develop.watch 는 뭐고, volume 마운트랑 뭐가 달라요?**  
   **develop.watch**는 Docker Compose에 들어 있는 기능으로, "호스트 파일이 바뀌면 sync(컨테이너로 복사) 또는 rebuild(이미지 재빌드)"를 해 줘요. **sync**는 `./src` 만 컨테이너로 넘기므로, 전체 프로젝트를 volume으로 마운트할 필요가 없고, `node_modules` 는 이미지 것을 그대로 써서 기동 시 `pnpm install` 이 필요 없어요. **rebuild**는 `package.json` / lock 변경 시 이미지를 다시 빌드해서, 의존성 바꾼 뒤 수동으로 `docker compose build` 할 필요가 줄어듭니다. Compose **v2.22+** 에서 동작해요.
