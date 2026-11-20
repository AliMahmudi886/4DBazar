# معماری مستندات 4D

## هدف

هدف معماری مستندات این است که پروژه بدون وابستگی به حافظه یک agent ادامه‌پذیر باشد. هر سند باید نقش اجرایی مشخص داشته باشد و اطلاعات مشابه در چند جا کپی نشود.

## اسناد مرجع

| سند | نقش | وضعیت |
|---|---|---|
| `README.md` | معرفی، وضعیت خلاصه، لینک به اسناد اصلی | فعال |
| `AGENTS.md` | راهنمای ادامه کار agentها | فعال |
| `PROJECT_STATUS_FA.md` | وضعیت زنده پروژه | فعال |
| `docs/ROADMAP_FA.md` | نقشه راه phaseها و exit criteria | فعال |
| `docs/TRACKER_FA.md` | کنترل اجرای phaseها و taskها | فعال |
| `docs/DECISION_LOG_FA.md` | ثبت تصمیم‌های مهم و foundation | فعال |
| `docs/RISK_REGISTER_FA.md` | ثبت و پایش ریسک‌ها | فعال |
| `docs/TECH_DEBT_FA.md` | ثبت بدهی فنی، محصولی و مستنداتی | فعال |
| `docs/UNKNOWNS_FA.md` | فرضیات، پرسش‌ها و ناشناخته‌ها | فعال |
| `docs/phase-reports/*` | گزارش پایان هر phase | فعال |

## اسناد فازهای آینده

| Phase | سند پیشنهادی |
|---|---|
| Phase 1 | `docs/PRODUCT_DISCOVERY_FA.md` |
| Phase 2 | `docs/MARKET_RESEARCH_FA.md` |
| Phase 3 | `docs/PRODUCT_STRATEGY_FA.md` |
| Phase 4 | `docs/PRD_MVP_FA.md` |
| Phase 5 | `docs/UX_DESIGN_FA.md` |
| Phase 6 | `docs/DOMAIN_MODEL_FA.md` |
| Phase 7 | `docs/DATABASE_API_DESIGN_FA.md` |
| Phase 8 | `docs/SYSTEM_ARCHITECTURE_FA.md` |
| Phase 9 | `docs/SECURITY_TRUST_FA.md` |
| Phase 10 | `docs/DEVELOPMENT_FOUNDATION_FA.md` |

## قوانین sync

- تغییر معماری: update در سند معماری و ثبت decision log
- تغییر API: update در API design و tracker
- تغییر database: update در database design و decision log
- shortcut یا compromise: ثبت در tech debt
- ریسک جدید: ثبت در risk register
- سؤال باز جدید: ثبت در unknowns
