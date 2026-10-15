# Galaxy Pay — Dashboard Khối Kinh doanh

## Dự án làm gì
Dashboard nội bộ (Next.js App Router) báo cáo kết quả kinh doanh của Galaxy Pay:
doanh thu/chỉ tiêu, pipeline, sản phẩm, KPI, OTA, giao dịch, chứng khoán, tỷ giá, kèm chatbot.
Deploy lên Cloudflare Workers qua OpenNext.

## Lệnh thường dùng
- Cài đặt: `npm install`
- Chạy dev: `npm run dev` (http://localhost:3000)
- Lint: `npm run lint`
- Build: `npm run build` (build Cloudflare: `npm run build:cloudflare`)
- Test: dự án chưa có test tự động. Sửa xong thì chạy `npm run lint` và `npm run build`.

## Cấu trúc
- `app/(dashboard)/` — mỗi trang báo cáo một route; `layout.js` giữ auth gate, sidebar, user badge.
- `app/api/` — API route: `chat`, `users`, `auth/login-log`, `forex`, `stock`.
- `components/` — UI dùng chung (`ui/`), biểu đồ SVG (`charts/`), `AuthProvider`, `Sidebar`, `ChatBot`...
- `lib/data.js` — dữ liệu tĩnh; `lib/metrics.js` — hàm tính toán thuần (không JSX/SVG).
- `lib/auth.js` — auth phía client (prototype, không an toàn cho dữ liệu nhạy cảm).
- `lib/supabase.js`, `lib/syncData.js`, `supabase/schema.sql` — kết nối và schema Supabase.
- `scripts/` — script seed dữ liệu/knowledge và lấy dữ liệu chứng khoán (chạy trong GitHub Actions).

## Quy ước
- JavaScript (không TypeScript), alias import cấu hình trong `jsconfig.json`.
- Trang đọc dữ liệu qua `lib/metrics.js`; không tính toán trực tiếp trong component.
- Biến môi trường khai báo trong `.env.example` (GROQ_API_KEY, NEXT_PUBLIC_SUPABASE_*).

## Vùng nhạy cảm, cẩn thận gấp đôi
- `lib/auth.js`, `components/AuthProvider.js`, `app/api/users/`, `app/api/auth/`: xác thực và phân quyền
  (vd. user GuestIFC chỉ được xem trang Hello Vietnam). Không nới quyền khi chưa hỏi.
- `lib/data.js`, `lib/metrics.js`: số liệu báo cáo; không đổi công thức khi chưa hỏi.
- `supabase/schema.sql`: không đổi schema khi chưa hỏi.

## Không được động vào
- `.github/workflows/deploy.yml`, `wrangler.jsonc`, `open-next.config.ts` trừ khi được yêu cầu.
- `package-lock.json` chỉ thay đổi qua `npm install`, không sửa tay.
