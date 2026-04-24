# GreenScope AI

تطبيق GreenScope AI عبارة عن منظومة متكاملة (Monorepo) مبنية باستخدام **pnpm workspaces** وتضم تطبيق هاتف محمول (Expo / React Native)، خادم API (Express) ومعمل لمعاينة المكونات (Mockup Sandbox).

---

## بنية المشروع

```text
.
├── artifacts/
│   ├── mobile/             # تطبيق الهاتف (Expo / React Native)
│   ├── api-server/         # خادم Express API
│   └── mockup-sandbox/     # معاينة مكونات الواجهة
├── lib/
│   ├── api-spec/           # مواصفات OpenAPI + إعدادات Orval
│   ├── api-client-react/   # React Query hooks مولّدة تلقائياً
│   ├── api-zod/            # مخططات Zod مولّدة تلقائياً
│   └── db/                 # طبقة قاعدة البيانات (Drizzle ORM + PostgreSQL)
├── scripts/                # سكربتات مساعدة
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── package.json
```

## المتطلبات

- **Node.js** 24+
- **pnpm** 9+
- **PostgreSQL** (يتم توفيره تلقائياً عبر Replit عند النشر)

## التثبيت

```bash
pnpm install
```

## التشغيل في وضع التطوير

```bash
# خادم الـ API
pnpm --filter @workspace/api-server run dev

# تطبيق الهاتف (Expo)
pnpm --filter mobile run dev

# معمل المعاينة
pnpm --filter mockup-sandbox run dev
```

## أوامر مفيدة

| الأمر | الوصف |
| --- | --- |
| `pnpm run typecheck` | فحص أنواع TypeScript لكامل المشروع |
| `pnpm run build` | بناء جميع الحزم |
| `pnpm --filter @workspace/api-spec run codegen` | توليد الكود من OpenAPI |
| `pnpm --filter @workspace/db run push` | تطبيق تغييرات مخطط قاعدة البيانات |

## التقنيات المستخدمة

- **TypeScript 5.9** بنمط Composite Projects
- **Express 5** لبناء API
- **Expo / React Native** لتطبيق الهاتف
- **Drizzle ORM** + **PostgreSQL** لقاعدة البيانات
- **Zod** للتحقق من صحة البيانات
- **Orval** لتوليد عملاء API من OpenAPI
- **esbuild** و **Vite** للبناء

## النشر

تتم إدارة عملية النشر تلقائياً عبر منصة Replit (Build / Hosting / TLS / Health Checks).

## الترخيص

جميع الحقوق محفوظة © GreenScope AI.
