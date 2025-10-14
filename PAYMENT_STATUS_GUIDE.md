# Hướng dẫn xử lý vấn đề trạng thái thanh toán không cập nhật

## Vấn đề

Sau khi thanh toán thành công qua cổng thanh toán PayOS, trạng thái hóa đơn vẫn giữ ở "pending" và không được cập nhật thành "paid".

## Nguyên nhân

1. **Thiếu cơ chế callback/webhook**: Backend cần có endpoint để nhận thông báo từ PayOS khi thanh toán thành công
2. **Thiếu trang xử lý payment success**: Frontend chưa có trang để verify và cập nhật trạng thái sau khi thanh toán
3. **Không có API để verify payment**: Chưa có phương thức để kiểm tra trạng thái thanh toán với cổng thanh toán

## Giải pháp đã thực hiện

### 1. Thêm các API methods mới vào billingService.ts

Đã thêm 3 phương thức mới:

```typescript
// Lấy thông tin chi tiết hóa đơn
async getInvoiceById(invoiceId: string): Promise<InvoiceResponse>

// Verify trạng thái thanh toán với cổng thanh toán
async verifyPayment(paymentId: string): Promise<any>

// Xử lý callback từ cổng thanh toán
async handlePaymentCallback(params: Record<string, string>): Promise<InvoiceResponse>
```

### 2. Tạo trang PaymentSuccessPage

Trang này sẽ:

- Nhận các tham số từ URL sau khi người dùng được redirect về từ PayOS
- Gọi API để verify và cập nhật trạng thái thanh toán
- Hiển thị thông tin hóa đơn và trạng thái thanh toán
- Cho phép người dùng tiếp tục sử dụng ứng dụng

### 3. Cập nhật returnUrl trong PricingPage

Đã thay đổi returnUrl để bao gồm invoiceId:

```typescript
returnUrl: `${window.location.origin}/payment-success?invoiceId=${invoice.id}`;
```

### 4. Thêm route cho trang payment success

Đã thêm route `/payment-success` vào Router.tsx

## Cách hoạt động

### Luồng thanh toán đầy đủ (Có Webhook):

1. **Người dùng chọn gói và xác nhận mua**
   - Frontend tạo invoice qua API
   - Khởi tạo payment session với PayOS
   - Lưu thông tin payment vào sessionStorage
   - Redirect người dùng đến PayOS checkout URL

2. **Người dùng thanh toán trên PayOS**
   - Nhập thông tin thanh toán (thẻ, QR code, v.v.)
   - PayOS xử lý giao dịch

3. **PayOS gửi webhook đến Backend** ⭐ QUAN TRỌNG NHẤT
   - PayOS gọi: `POST /billing/api/billing/payments/payos/webhook`
   - Backend verify signature webhook
   - Backend cập nhật trạng thái invoice từ "pending" → "paid"
   - Backend lưu thông tin giao dịch (transactionId, paidAt, v.v.)
   - **Đây là bước chính cập nhật trạng thái thanh toán**

4. **PayOS redirect người dùng về returnUrl**
   - URL: `/payment-success?invoiceId=xxx&paymentId=yyy&...`
   - Xảy ra gần như ngay sau bước 3 hoặc có thể trước bước 3 (nếu network chậm)

5. **PaymentSuccessPage xử lý (Frontend)**
   - Nhận các query parameters từ URL
   - Gọi API `getInvoiceById()` để lấy trạng thái mới nhất
   - Nếu webhook đã xử lý xong → hiển thị "paid"
   - Nếu webhook chưa xử lý xong → hiển thị "pending" và hướng dẫn refresh
   - Hiển thị thông tin chi tiết invoice cho người dùng

### Sơ đồ luồng:

```
User → Frontend → Backend API → PayOS
                                   ↓
                            [Processing Payment]
                                   ↓
                    ┌──────────────┴──────────────┐
                    ↓                             ↓
            Webhook (Server-to-Server)    Redirect (Browser)
                    ↓                             ↓
         Update DB Status ✅              PaymentSuccessPage
                    ↓                             ↓
            Status = "paid"              Check Invoice Status
                                                  ↓
                                         Display Result
```

### Tại sao Webhook quan trọng:

1. **Đáng tin cậy**: Server-to-server communication, không phụ thuộc vào browser
2. **Bảo mật**: Có signature verification, không thể fake
3. **Đồng bộ**: Đảm bảo database luôn được cập nhật kịp thời
4. **Async safe**: Xử lý được trường hợp thanh toán chậm hoặc offline

### Luồng dự phòng (Không có webhook):

Nếu webhook fail hoặc chưa được gọi, PaymentSuccessPage có thể:

- Gọi `verifyPayment()` để backend chủ động kiểm tra với PayOS
- Polling để refresh trạng thái định kỳ
- Hiển thị hướng dẫn người dùng check lại sau

## Cấu hình Webhook trong PayOS

### Bước 1: Đăng ký Webhook URL trong PayOS Dashboard

1. Đăng nhập vào PayOS Dashboard
2. Vào phần Settings → Webhooks
3. Thêm Webhook URL: `https://your-domain.com/billing/api/billing/payments/payos/webhook`
4. Lưu ý:
   - URL phải là HTTPS trong production
   - Trong development, có thể dùng ngrok để expose localhost
   - PayOS sẽ test webhook URL trước khi lưu

### Bước 2: Nhận và xử lý Webhook

Webhook payload từ PayOS thường có format:

```json
{
  "code": "00",
  "desc": "success",
  "data": {
    "orderCode": 123456,
    "amount": 79000,
    "description": "Payment for invoice INV-xxx",
    "accountNumber": "xxx",
    "reference": "xxx",
    "transactionDateTime": "2025-10-14 14:30:00",
    "currency": "VND",
    "paymentLinkId": "xxx",
    "code": "00",
    "desc": "success",
    "counterAccountBankId": null,
    "counterAccountBankName": null,
    "counterAccountName": null,
    "counterAccountNumber": null,
    "virtualAccountName": null,
    "virtualAccountNumber": null
  },
  "signature": "xxxxxxxxxx"
}
```

### Bước 3: Verify Signature

Backend PHẢI verify signature để đảm bảo webhook từ PayOS:

```csharp
// Example in C#
public bool VerifyWebhookSignature(string payload, string signature, string webhookSecret)
{
    var computedSignature = ComputeHmacSha256(payload, webhookSecret);
    return computedSignature == signature;
}
```

### Bước 4: Xử lý Webhook

```csharp
[HttpPost("payos/webhook")]
public async Task<IActionResult> HandlePayOSWebhook([FromBody] PayOSWebhookPayload payload)
{
    // 1. Verify signature
    if (!VerifyWebhookSignature(payload))
        return Unauthorized();

    // 2. Check if already processed (idempotency)
    if (await IsWebhookAlreadyProcessed(payload.Data.OrderCode))
        return Ok();

    // 3. Update invoice status
    var invoice = await GetInvoiceByOrderCode(payload.Data.OrderCode);
    if (payload.Data.Code == "00") // Success
    {
        invoice.Status = "paid";
        invoice.PaidAt = DateTime.UtcNow;
        invoice.TransactionId = payload.Data.Reference;
    }
    else // Failed
    {
        invoice.Status = "failed";
    }

    await UpdateInvoice(invoice);

    // 4. Mark webhook as processed
    await MarkWebhookAsProcessed(payload.Data.OrderCode);

    return Ok();
}
```

## Backend cần implement

### 1. Endpoint Verify Payment

```
POST /billing/api/billing/payments/{paymentId}/verify
```

Chức năng:

- Gọi API của PayOS để kiểm tra trạng thái thanh toán
- Cập nhật trạng thái invoice nếu thanh toán thành công
- Trả về thông tin thanh toán đã được verify

### 2. Endpoint Payment Callback

```
POST /billing/api/billing/payments/callback
```

Chức năng:

- Nhận các tham số từ URL callback
- Verify chữ ký (signature) từ PayOS
- Cập nhật trạng thái invoice
- Trả về invoice đã được cập nhật

### 3. Webhook Endpoint ✅ ĐÃ CÓ

```
POST /billing/api/billing/payments/payos/webhook
```

**Trạng thái: ĐÃ IMPLEMENT**

Chức năng:

- Nhận webhook notification từ PayOS khi thanh toán thành công/thất bại
- Verify chữ ký webhook để đảm bảo tính xác thực
- Tự động cập nhật trạng thái invoice trong database
- Xử lý các trường hợp thanh toán chậm (async payment)
- Đảm bảo idempotency (xử lý webhook trùng lặp)

**Quan trọng**: Đây là cách chính để cập nhật trạng thái thanh toán. Webhook được PayOS gọi trực tiếp đến server backend, đảm bảo độ tin cậy cao hơn callback từ client.

### 4. Get Invoice Endpoint

```
GET /billing/api/billing/invoices/{invoiceId}
```

Chức năng:

- Trả về thông tin chi tiết của invoice
- Bao gồm trạng thái hiện tại

## Cấu trúc Database cần có

Invoice table nên có các trường:

- `status`: pending, paid, failed, cancelled, expired
- `paidAt`: timestamp khi thanh toán thành công
- `paymentGateway`: gateway được sử dụng (PayOS, v.v.)
- `transactionId`: ID giao dịch từ cổng thanh toán

Payment table (tùy chọn):

- `id` (paymentId)
- `invoiceId`
- `gateway`
- `transactionId`
- `status`
- `paymentUrl`
- `expiredAt`

## Testing

### Test case 1: Thanh toán thành công

1. Chọn gói và thanh toán
2. Hoàn tất thanh toán trên PayOS
3. Được redirect về payment-success
4. Kiểm tra trạng thái invoice = "paid"

### Test case 2: Thanh toán thất bại

1. Chọn gói và thanh toán
2. Hủy hoặc thanh toán thất bại
3. Được redirect về pricing
4. Invoice vẫn ở trạng thái "pending"

### Test case 3: Webhook xử lý

1. PayOS gửi webhook sau khi thanh toán
2. Backend nhận và xử lý webhook
3. Cập nhật trạng thái invoice
4. Người dùng có thể thấy trạng thái mới khi refresh

## Lưu ý quan trọng

1. **Bảo mật**:
   - Luôn verify signature từ PayOS
   - Không tin tưởng dữ liệu từ client
   - Kiểm tra lại với PayOS API

2. **Idempotency**:
   - Xử lý trường hợp webhook được gửi nhiều lần
   - Không cập nhật invoice nhiều lần

3. **Timeout**:
   - Payment session có thời gian hết hạn
   - Cần xử lý trường hợp thanh toán sau khi hết hạn

4. **Error Handling**:
   - Xử lý các lỗi network
   - Xử lý trường hợp PayOS API không khả dụng
   - Thông báo rõ ràng cho người dùng

## Monitoring

Backend nên log các sự kiện:

- Payment initiated
- Payment callback received
- Webhook received
- Invoice status changed
- Payment verification success/failure

## Troubleshooting - Tại sao status vẫn là "pending"?

### Checklist để debug:

#### 1. Kiểm tra Webhook có được gọi không?

**Cách kiểm tra:**

```bash
# Xem logs của backend server
# Tìm request đến /billing/api/billing/payments/payos/webhook
```

**Nếu KHÔNG có log webhook:**

- ✅ Kiểm tra webhook URL đã đăng ký đúng trong PayOS Dashboard chưa
- ✅ URL có accessible từ internet không? (test bằng curl/Postman)
- ✅ Trong development, có dùng ngrok để expose localhost không?
- ✅ Firewall/Security group có block request từ PayOS không?

**Nếu CÓ log webhook:**

- Đi sang bước 2

#### 2. Kiểm tra Webhook processing có thành công không?

**Cách kiểm tra:**

```bash
# Xem response status của webhook endpoint
# Nếu 200 OK → thành công
# Nếu 4xx/5xx → có lỗi
```

**Các lỗi thường gặp:**

- ❌ Signature verification failed → Sai webhook secret
- ❌ OrderCode/Invoice not found → Logic mapping sai
- ❌ Database update failed → Lỗi DB connection hoặc constraint
- ❌ Exception trong code → Check stack trace

#### 3. Kiểm tra Database có được update không?

**Cách kiểm tra:**

```sql
-- Xem invoice status
SELECT id, invoice_code, status, paid_at, updated_at
FROM invoices
WHERE id = 'your-invoice-id';

-- Xem webhook logs (nếu có table)
SELECT * FROM webhook_logs
WHERE order_code = 'xxx'
ORDER BY created_at DESC;
```

**Nếu status vẫn là "pending":**

- ❌ Webhook handler không update database
- ❌ Transaction bị rollback do lỗi
- ❌ Update sai invoice (sai ID)

#### 4. Kiểm tra Frontend có fetch status mới không?

**Cách kiểm tra:**

```javascript
// Trong PaymentSuccessPage, mở Console
// Xem request đến /billing/api/billing/invoices/{invoiceId}
// Check response data
```

**Nếu frontend vẫn hiển thị "pending":**

- Có thể webhook chưa xử lý xong khi user được redirect về
- Thử refresh trang sau vài giây
- Check API response có trả về status mới không

### Debug Flow Chart:

```
Thanh toán thành công trên PayOS
          ↓
    PayOS gọi webhook?
          ↓
    NO → Check webhook config
          ↓
   YES → Webhook trả về 200 OK?
          ↓
    NO → Check logs & errors
          ↓
   YES → Database có update?
          ↓
    NO → Check update logic
          ↓
   YES → Frontend fetch được status mới?
          ↓
    NO → Check API & cache
          ↓
   YES → ✅ DONE!
```

### Các công cụ hữu ích:

1. **ngrok** (Development):

   ```bash
   ngrok http 8088
   # Sử dụng URL này để đăng ký webhook
   ```

2. **Postman** (Testing webhook):

   ```
   POST https://your-domain.com/billing/api/billing/payments/payos/webhook
   Body: [Webhook payload mẫu từ PayOS docs]
   ```

3. **Database GUI** (Check data):
   - pgAdmin (PostgreSQL)
   - MySQL Workbench
   - DBeaver (Universal)

### Giải pháp tạm thời nếu webhook fail:

Nếu webhook không hoạt động ngay, có thể:

1. **Manual verify trong PaymentSuccessPage:**
   - Gọi `verifyPayment(paymentId)`
   - Backend sẽ chủ động query PayOS API
   - Cập nhật status dựa trên kết quả

2. **Polling mechanism:**
   - PaymentSuccessPage tự động refresh mỗi 3-5 giây
   - Kiểm tra status cho đến khi = "paid" hoặc timeout

3. **Manual update bằng Admin panel:**
   - Tạo trang admin để list pending invoices
   - Cho phép admin verify và update thủ công

## Monitoring và Logging

### Backend nên log:

```csharp
// Khi nhận webhook
Log.Information("Webhook received: OrderCode={OrderCode}, Amount={Amount}",
    payload.Data.OrderCode, payload.Data.Amount);

// Khi verify signature
Log.Information("Signature verification: {Result}", isValid ? "SUCCESS" : "FAILED");

// Khi update invoice
Log.Information("Invoice {InvoiceId} status updated: {OldStatus} → {NewStatus}",
    invoice.Id, oldStatus, newStatus);

// Khi có lỗi
Log.Error(ex, "Failed to process webhook for OrderCode={OrderCode}", orderCode);
```

### Frontend nên track:

```javascript
// Khi vào PaymentSuccessPage
console.log("Payment success page loaded:", { invoiceId, paymentId });

// Khi fetch invoice
console.log("Invoice fetched:", invoice);

// Khi verify payment
console.log("Payment verification result:", result);
```

## Best Practices

1. **Luôn xử lý webhook như source of truth**
   - Webhook đáng tin cậy hơn callback từ browser
   - User có thể close browser trước khi callback xong

2. **Implement retry mechanism**
   - PayOS có thể retry webhook nếu server trả về lỗi
   - Backend phải handle idempotency

3. **Có fallback mechanism**
   - Nếu webhook fail, có thể verify manual
   - Có cronjob để check pending invoices quá lâu

4. **Monitor webhook health**
   - Track webhook success rate
   - Alert nếu nhiều webhook fail

5. **Test thoroughly**
   - Test với PayOS sandbox trước
   - Test các case: success, failure, timeout
   - Test idempotency với duplicate webhooks

## Tài liệu tham khảo

- PayOS API Documentation: https://payos.vn/docs
- PayOS Webhook Guide: https://payos.vn/docs/webhooks
- Payment Gateway Best Practices
- Webhook Security Guidelines
- Idempotency in Distributed Systems
