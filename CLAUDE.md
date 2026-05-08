# CLAUDE.md

스포츠 용품 중고거래 서비스. 개발 계획은 `PLAN.md` 참고.

## 기술 스택

- **Framework**: Next.js 14 (App Router)
- **DB**: PostgreSQL + Prisma ORM
- **인증**: NextAuth.js
- **이미지**: Cloudinary
- **스타일**: Tailwind CSS
- **배포**: Vercel + Supabase

## 개발 명령어

```bash
npm install        # 패키지 설치
npm run dev        # 개발 서버 실행
npx prisma migrate dev   # DB 마이그레이션
npx prisma studio        # DB GUI
```

## 환경 변수

`.env` 파일에 아래 값 필요:

```
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## 컨벤션

- API 라우트: `/app/api/` 하위에 작성
- 컴포넌트: PascalCase
- 유틸 함수: camelCase
- DB 접근은 반드시 Prisma 클라이언트 사용 (`/lib/prisma.ts`)
