# FROM: 생성할 이미지의 베이스가 될 이미지 결정
FROM node

# WORKDIR: 이미지 내에서 명령어를 실행할 디렉토리를 설정
# 컨테이너 내부에 /app 디렉토리를 생성하고, 이 디렉토리를 WORKDIR로 설정
WORKDIR /app

# COPY: 로컬 파일을 이미지 내부로 복사
# package.json 파일을 /app 디렉토리로 복사 (.은 현재 디렉토리를 의미)
COPY package.json .
COPY package-lock.json .

# RUN: 명령어를 실행
# npm install 명령어를 실행하여 package.json에 명시된 패키지를 설치
RUN npm install --force

# COPY: 로컬 파일을 이미지 내부로 복사
# 현재 디렉토리의 모든 파일을 /app 디렉토리로 복사
COPY . .

# EXPOSE: 컨테이너가 실행될 때 사용할 포트를 설정
# 3000번 포트를 외부에 노출
EXPOSE 3000

# CMD: 컨테이너가 시작되었을 때 실행할 명령어를 설정
# npm start 명령어를 실행하여 서버를 실행
CMD [ "npm", "run", "dev" ]