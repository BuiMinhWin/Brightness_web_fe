# 🔄 Flow Thanh Toán Hoàn Chỉnh - Chi Tiết Từng Bước

## Tổng Quan Quy Trình

```
┌─────────────┐      ┌──────────────┐      ┌──────────┐      ┌────────────┐
│   User      │─────▶│   Frontend   │─────▶│ Backend  │─────▶│   PayOS    │
│  (Browser)  │◀─────│  (React)     │◀─────│  (API)   │◀─────│  (Gateway) │
└─────────────┘      └──────────────┘      └──────────┘      └────────────┘
```

---

## 📍 BƯỚC 1: User Vào Trang Pricing

### Frontend Action:

```typescript
// URL: /pricing
Component: PricingPage.tsx;
```

### API Call #1: Lấy Danh Sách Gói Đăng Ký

```typescript
// Frontend Call
const response = await subscriptionPlanService.getPlans({
  isActive: true,
  sortBy: "price",
  sortDirection: "asc",
});
```

**HTTP Request:**

```http
GET /billing/api/billing/plans?onlyActive=true&sortBy=price&sortDirection=asc
Headers:
  Authorization: Bearer {accessToken}
  Content-Type: application/json
  Ocp-Apim-Subscription-Key: {apiGatewayKey}
```

**Backend Processing:**

- Lấy danh sách plans từ database
- Filter chỉ plans có `isActive = true`
- Sort theo price ascending
- Return danh sách plans

**Response Success (200):**

```json
{
  "flag": true,
  "message": "Success",
  "data": {
    "items": [
      {
        "id": "c876e0b7-0a4c-413a-8864-1636d1577936",
        "name": "Basic Monthly",
        "description": "Access to premium features\nPersonal AI coach\nAdvanced analytics",
        "price": 79000,
        "currency": "VND",
        "durationDays": 30,
        "isActive": true,
        "createdAt": "2025-10-14T10:00:00Z"
      },
      {
        "id": "d987e1c8-1b5d-424b-9975-2747d2688a47",
        "name": "Pro Quarterly",
        "description": "All Basic features\nPriority support\nExclusive content",
        "price": 199000,
        "currency": "VND",
        "durationDays": 90,
        "isActive": true,
        "createdAt": "2025-10-14T10:00:00Z"
      }
    ],
    "totalCount": 2,
    "pageNumber": 1,
    "pageSize": 10
  }
}
```

**Frontend Processing:**

- Parse response data
- Map thành PricingPlan format
- Display trong UI

---

## 📍 BƯỚC 2: User Chọn Gói và Click "Choose Plan"

### Frontend Action:

```typescript
// User clicks "Choose plan" button
handlePlanSelection(planId: "c876e0b7-0a4c-413a-8864-1636d1577936")
```

**UI Changes:**

- Hiển thị Confirmation Modal
- Show plan details và giá
- Buttons: "Cancel" và "Confirm Purchase"

---

## 📍 BƯỚC 3: User Click "Confirm Purchase"

### API Call #2: Verify Plan Still Active

```typescript
// Frontend Call
const subscriptionPlan = await subscriptionPlanService.getPlanById(planId);
```

**HTTP Request:**

```http
GET /billing/api/billing/plans/{planId}
Headers:
  Authorization: Bearer {accessToken}
  Content-Type: application/json
  Ocp-Apim-Subscription-Key: {apiGatewayKey}
```

**Response Success (200):**

```json
{
  "flag": true,
  "message": "Success",
  "data": {
    "id": "c876e0b7-0a4c-413a-8864-1636d1577936",
    "name": "Basic Monthly",
    "description": "Access to premium features\nPersonal AI coach",
    "price": 79000,
    "currency": "VND",
    "durationDays": 30,
    "isActive": true,
    "createdAt": "2025-10-14T10:00:00Z",
    "updatedAt": "2025-10-14T12:00:00Z"
  }
}
```

**Frontend Validation:**

- Check `isActive === true`
- If false → Show error và return
- If true → Proceed to create invoice

---

## 📍 BƯỚC 4: Tạo Hóa Đơn (Invoice)

### API Call #3: Create Invoice

```typescript
// Frontend Call
const invoice = await billingService.createInvoice({
  userExternalId: userId, // từ Redux store
  subscriptionPlanId: planId,
  dueDate: "2025-10-14", // YYYY-MM-DD format
  notes: "Invoice for plan Basic Monthly",
});
```

**HTTP Request:**

```http
POST /billing/api/billing/invoices
Headers:
  Authorization: Bearer {accessToken}
  Content-Type: application/json
  Ocp-Apim-Subscription-Key: {apiGatewayKey}

Body:
{
  "userExternalId": "41225d05-5904-4cfd-9b7d-d585715ca212",
  "subscriptionPlanId": "c876e0b7-0a4c-413a-8864-1636d1577936",
  "dueDate": "2025-10-14",
  "notes": "Invoice for plan Basic Monthly"
}
```

**Backend Processing:**

1. Validate user exists
2. Validate subscription plan exists và active
3. Calculate amount từ subscription plan
4. Generate unique invoice code (INV-YYYYMMDD-XXXXXXXX)
5. Create invoice record với status = "pending"
6. Save to database

**Database Insert:**

```sql
INSERT INTO invoices (
  id, user_external_id, subscription_plan_id,
  invoice_code, amount, currency, status,
  created_at, due_date, notes
) VALUES (
  '72df1b4c-64a9-4990-9b78-863778ac6e65',
  '41225d05-5904-4cfd-9b7d-d585715ca212',
  'c876e0b7-0a4c-413a-8864-1636d1577936',
  'INV-20251014-AC2B1CFC',
  79000.00,
  'VND',
  'pending',
  '2025-10-14 14:00:44.360749+00',
  '2025-10-14 00:00:00+00',
  'Invoice for plan Basic Monthly'
);
```

**Response Success (200):**

```json
{
  "flag": true,
  "message": "Invoice created successfully",
  "data": {
    "id": "72df1b4c-64a9-4990-9b78-863778ac6e65",
    "userExternalId": "41225d05-5904-4cfd-9b7d-d585715ca212",
    "subscriptionPlanId": "c876e0b7-0a4c-413a-8864-1636d1577936",
    "invoiceCode": "INV-20251014-AC2B1CFC",
    "amount": 79000,
    "currency": "VND",
    "status": "pending",
    "createdAt": "2025-10-14T14:00:44.360749Z",
    "dueDate": "2025-10-14T00:00:00Z",
    "paidAt": null,
    "cancelledAt": null,
    "updatedAt": null,
    "notes": "Invoice for plan Basic Monthly"
  }
}
```

**Response Error (400):**

```json
{
  "flag": false,
  "message": "Subscription plan not found or inactive",
  "data": null
}
```

---

## 📍 BƯỚC 5: Khởi Tạo Payment Session với PayOS

### API Call #4: Initiate Payment

```typescript
// Frontend Call
const paymentSession = await billingService.initiatePayment({
  invoiceId: invoice.id,
  gateway: 2, // 2 = PayOS
  returnUrl: `${window.location.origin}/payment-success?invoiceId=${invoice.id}`,
  cancelUrl: `${window.location.origin}/pricing`,
});
```

**HTTP Request:**

```http
POST /billing/api/billing/payments/initiate
Headers:
  Authorization: Bearer {accessToken}
  Content-Type: application/json
  Ocp-Apim-Subscription-Key: {apiGatewayKey}

Body:
{
  "invoiceId": "72df1b4c-64a9-4990-9b78-863778ac6e65",
  "gateway": 2,
  "returnUrl": "http://localhost:5173/payment-success?invoiceId=72df1b4c-64a9-4990-9b78-863778ac6e65",
  "cancelUrl": "http://localhost:5173/pricing"
}
```

**Backend Processing:**

1. Validate invoice exists và status = "pending"
2. Get invoice amount và description
3. Generate unique order code
4. Call PayOS API để tạo payment link
5. Create payment session record
6. Return payment URL

**Backend → PayOS API Call:**

```http
POST https://api-merchant.payos.vn/v2/payment-requests
Headers:
  x-client-id: {payosClientId}
  x-api-key: {payosApiKey}
  Content-Type: application/json

Body:
{
  "orderCode": 835844,
  "amount": 79000,
  "description": "Payment for INV-20251014-AC2B1CFC",
  "returnUrl": "http://localhost:5173/payment-success?invoiceId=72df1b4c-64a9-4990-9b78-863778ac6e65",
  "cancelUrl": "http://localhost:5173/pricing",
  "signature": "computed_signature_here"
}
```

**PayOS Response:**

```json
{
  "code": "00",
  "desc": "success",
  "data": {
    "bin": null,
    "accountNumber": "12345678",
    "accountName": "NGUYEN VAN A",
    "amount": 79000,
    "description": "Payment for INV-20251014-AC2B1CFC",
    "orderCode": 835844,
    "currency": "VND",
    "paymentLinkId": "40e3105553844dcd933440ac5cbd5111",
    "status": "PENDING",
    "checkoutUrl": "https://pay.payos.vn/web/40e3105553844dcd933440ac5cbd5111",
    "qrCode": "data:image/png;base64,..."
  }
}
```

**Backend Save Payment Record:**

```sql
INSERT INTO payment_sessions (
  id, invoice_id, gateway, payment_url,
  transaction_id, status, expired_at, created_at
) VALUES (
  '9a29029a-2c25-4f58-a150-7f7dd5bf730e',
  '72df1b4c-64a9-4990-9b78-863778ac6e65',
  2,
  'https://pay.payos.vn/web/40e3105553844dcd933440ac5cbd5111',
  '835844',
  'pending',
  '2025-10-14 14:08:22.318143+00',
  '2025-10-14 14:00:22.318143+00'
);
```

**Response to Frontend (200):**

```json
{
  "paymentId": "9a29029a-2c25-4f58-a150-7f7dd5bf730e",
  "invoiceId": "72df1b4c-64a9-4990-9b78-863778ac6e65",
  "gateway": 2,
  "paymentUrl": "https://pay.payos.vn/web/40e3105553844dcd933440ac5cbd5111",
  "expiredAt": "2025-10-14T14:08:22.3181433Z",
  "transactionId": "835844"
}
```

**Frontend Processing:**

```typescript
// Lưu thông tin vào sessionStorage
sessionStorage.setItem(
  "pendingPayment",
  JSON.stringify({
    paymentId: paymentSession.paymentId,
    invoiceId: invoice.id,
    transactionId: paymentSession.transactionId,
  })
);

// Redirect đến PayOS
window.location.href = paymentSession.paymentUrl;
```

---

## 📍 BƯỚC 6: User Thanh Toán Trên PayOS

### PayOS Processing:

1. User nhập thông tin thanh toán
2. PayOS xử lý giao dịch với ngân hàng
3. Giao dịch thành công/thất bại

**Timeline:**

```
t=0s:  User vào PayOS page
t=30s: User nhập thông tin và submit
t=35s: PayOS xử lý với ngân hàng
t=40s: Giao dịch thành công
```

---

## 📍 BƯỚC 7: PayOS Gửi Webhook (SERVER-TO-SERVER) ⭐ QUAN TRỌNG

### Webhook Call: PayOS → Backend

```http
POST /billing/api/billing/payments/payos/webhook
Headers:
  Content-Type: application/json
  X-Webhook-Signature: {signature_from_payos}

Body:
{
  "code": "00",
  "desc": "success",
  "data": {
    "orderCode": 835844,
    "amount": 79000,
    "description": "Payment for INV-20251014-AC2B1CFC",
    "accountNumber": "12345678",
    "reference": "FT25287654321",
    "transactionDateTime": "2025-10-14 14:02:15",
    "currency": "VND",
    "paymentLinkId": "40e3105553844dcd933440ac5cbd5111",
    "code": "00",
    "desc": "success",
    "counterAccountBankId": "970422",
    "counterAccountBankName": "MB Bank",
    "counterAccountName": "NGUYEN VAN A",
    "counterAccountNumber": "9876543210",
    "virtualAccountName": "BRIGHTNESS FITNESS",
    "virtualAccountNumber": "12345678"
  },
  "signature": "d9f0e4e8c1d2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p8q9r0"
}
```

**Backend Webhook Handler Processing:**

```csharp
[HttpPost("payos/webhook")]
public async Task<IActionResult> HandlePayOSWebhook([FromBody] PayOSWebhookDto webhook)
{
    // 1. VERIFY SIGNATURE
    var isValidSignature = VerifyWebhookSignature(webhook);
    if (!isValidSignature)
    {
        _logger.LogWarning("Invalid webhook signature");
        return Unauthorized("Invalid signature");
    }

    // 2. CHECK IDEMPOTENCY (đã xử lý chưa?)
    var orderCode = webhook.Data.OrderCode;
    var existingWebhook = await _webhookLogRepo.GetByOrderCode(orderCode);
    if (existingWebhook != null && existingWebhook.Processed)
    {
        _logger.LogInformation("Webhook already processed: {OrderCode}", orderCode);
        return Ok("Already processed");
    }

    // 3. FIND INVOICE BY ORDER CODE/TRANSACTION ID
    var paymentSession = await _paymentRepo.GetByTransactionId(orderCode.ToString());
    if (paymentSession == null)
    {
        _logger.LogError("Payment session not found: {OrderCode}", orderCode);
        return NotFound("Payment session not found");
    }

    var invoice = await _invoiceRepo.GetById(paymentSession.InvoiceId);
    if (invoice == null)
    {
        _logger.LogError("Invoice not found: {InvoiceId}", paymentSession.InvoiceId);
        return NotFound("Invoice not found");
    }

    // 4. UPDATE INVOICE STATUS
    if (webhook.Data.Code == "00") // Success
    {
        invoice.Status = "paid";
        invoice.PaidAt = DateTime.UtcNow;
        invoice.TransactionId = webhook.Data.Reference;
        invoice.UpdatedAt = DateTime.UtcNow;

        _logger.LogInformation(
            "Invoice {InvoiceCode} marked as paid. Amount: {Amount}",
            invoice.InvoiceCode,
            invoice.Amount
        );
    }
    else // Failed
    {
        invoice.Status = "failed";
        invoice.UpdatedAt = DateTime.UtcNow;

        _logger.LogWarning(
            "Payment failed for invoice {InvoiceCode}. Code: {Code}, Desc: {Desc}",
            invoice.InvoiceCode,
            webhook.Data.Code,
            webhook.Data.Desc
        );
    }

    // 5. UPDATE PAYMENT SESSION
    paymentSession.Status = webhook.Data.Code == "00" ? "completed" : "failed";
    paymentSession.UpdatedAt = DateTime.UtcNow;

    // 6. SAVE TO DATABASE (Transaction)
    using var transaction = await _dbContext.Database.BeginTransactionAsync();
    try
    {
        await _invoiceRepo.Update(invoice);
        await _paymentRepo.Update(paymentSession);

        // Log webhook
        await _webhookLogRepo.Create(new WebhookLog
        {
            OrderCode = orderCode,
            Payload = JsonSerializer.Serialize(webhook),
            Processed = true,
            ProcessedAt = DateTime.UtcNow
        });

        await transaction.CommitAsync();

        _logger.LogInformation("Webhook processed successfully: {OrderCode}", orderCode);
    }
    catch (Exception ex)
    {
        await transaction.RollbackAsync();
        _logger.LogError(ex, "Error processing webhook: {OrderCode}", orderCode);
        return StatusCode(500, "Error processing webhook");
    }

    // 7. TRIGGER POST-PAYMENT ACTIONS (Optional)
    if (invoice.Status == "paid")
    {
        // Activate user subscription
        await _subscriptionService.ActivateSubscription(invoice.UserExternalId, invoice.SubscriptionPlanId);

        // Send confirmation email
        await _emailService.SendPaymentConfirmation(invoice);

        // Update user points/rewards
        await _gamificationService.AwardPoints(invoice.UserExternalId, invoice.Amount);
    }

    return Ok("Webhook processed");
}
```

**Database Updates:**

```sql
-- Update Invoice
UPDATE invoices
SET
  status = 'paid',
  paid_at = '2025-10-14 14:02:15+00',
  transaction_id = 'FT25287654321',
  updated_at = '2025-10-14 14:02:15+00'
WHERE id = '72df1b4c-64a9-4990-9b78-863778ac6e65';

-- Update Payment Session
UPDATE payment_sessions
SET
  status = 'completed',
  updated_at = '2025-10-14 14:02:15+00'
WHERE id = '9a29029a-2c25-4f58-a150-7f7dd5bf730e';

-- Insert Webhook Log
INSERT INTO webhook_logs (
  id, order_code, payload, processed, processed_at, created_at
) VALUES (
  uuid_generate_v4(),
  835844,
  '{"code":"00","desc":"success",...}',
  true,
  '2025-10-14 14:02:15+00',
  '2025-10-14 14:02:15+00'
);
```

**Backend Response to PayOS:**

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "message": "Webhook processed"
}
```

---

## 📍 BƯỚC 8: PayOS Redirect User Về Frontend

### Browser Redirect:

```
FROM: https://pay.payos.vn/web/40e3105553844dcd933440ac5cbd5111
TO:   http://localhost:5173/payment-success?invoiceId=72df1b4c-64a9-4990-9b78-863778ac6e65&status=success&orderCode=835844
```

**Timeline:**

```
t=40s: Webhook gửi đến backend
t=40s: Backend cập nhật DB (status = paid) ✅
t=41s: PayOS redirect user về frontend
t=42s: Frontend load PaymentSuccessPage
```

---

## 📍 BƯỚC 9: PaymentSuccessPage Load và Verify

### Component Mount:

```typescript
// URL: /payment-success?invoiceId=xxx&status=success&orderCode=xxx
Component: PaymentSuccessPage.tsx;
```

### API Call #5: Get Invoice Status

```typescript
// Frontend Call (lần 1)
const invoice = await billingService.getInvoiceById(invoiceId);
```

**HTTP Request:**

```http
GET /billing/api/billing/invoices/72df1b4c-64a9-4990-9b78-863778ac6e65
Headers:
  Authorization: Bearer {accessToken}
  Content-Type: application/json
  Ocp-Apim-Subscription-Key: {apiGatewayKey}
```

**Backend Processing:**

- Query invoice từ database
- Return current status (đã được webhook update = "paid")

**Response Success (200):**

```json
{
  "flag": true,
  "message": "Success",
  "data": {
    "id": "72df1b4c-64a9-4990-9b78-863778ac6e65",
    "userExternalId": "41225d05-5904-4cfd-9b7d-d585715ca212",
    "subscriptionPlanId": "c876e0b7-0a4c-413a-8864-1636d1577936",
    "invoiceCode": "INV-20251014-AC2B1CFC",
    "amount": 79000,
    "currency": "VND",
    "status": "paid", // ✅ ĐÃ ĐƯỢC WEBHOOK CẬP NHẬT
    "createdAt": "2025-10-14T14:00:44.360749Z",
    "dueDate": "2025-10-14T00:00:00Z",
    "paidAt": "2025-10-14T14:02:15Z", // ✅ CÓ PAID_AT
    "transactionId": "FT25287654321",
    "cancelledAt": null,
    "updatedAt": "2025-10-14T14:02:15Z",
    "notes": "Invoice for plan Basic Monthly"
  }
}
```

**Frontend Processing:**

```typescript
if (invoice.status === "paid" || invoice.status === "completed") {
  // ✅ THANH TOÁN THÀNH CÔNG
  setError(null);
  setAutoRefreshing(false);
  // Display success message và invoice details
}
```

---

## 📍 BƯỚC 10: Auto-Refresh (Nếu Status Vẫn Pending)

### Scenario: Webhook chậm hơn redirect

**Nếu invoice.status === "pending":**

```typescript
// Setup auto-refresh mỗi 3 giây
useEffect(() => {
  if (invoice?.status === "pending" && pollingCount < MAX_POLLING_ATTEMPTS) {
    const timer = setTimeout(() => {
      setPollingCount((prev) => prev + 1); // Trigger re-fetch
    }, 3000);

    return () => clearTimeout(timer);
  }
}, [invoice, pollingCount]);
```

**Polling Loop:**

```
t=0s:  Load page → status = "pending" → Start polling
t=3s:  API Call #6 → status = "pending" → Continue
t=6s:  API Call #7 → status = "paid" ✅ → Stop polling
```

### API Call #6, #7, #8... (Polling):

```http
GET /billing/api/billing/invoices/{invoiceId}
(Same as API Call #5)
```

**Stop Conditions:**

- `status === "paid"` → Success! Stop polling
- `pollingCount >= 10` → Timeout, show manual refresh button
- User clicks "Refresh Status" → Manual check

---

## 📊 Summary Timeline

```
t=0s    User vào /pricing
t=1s    ├─ API #1: GET /plans → Display plans
t=10s   User chọn plan và click "Confirm Purchase"
t=11s   ├─ API #2: GET /plans/{id} → Verify plan active
t=12s   ├─ API #3: POST /invoices → Create invoice (status=pending)
t=13s   ├─ API #4: POST /payments/initiate → Get PayOS URL
t=14s   └─ Redirect to PayOS

t=14s   User trên PayOS page
t=30s   User nhập thông tin và submit
t=35s   PayOS xử lý với ngân hàng

t=40s   🎯 PayOS gửi WEBHOOK → Backend
t=40s   ├─ Backend verify signature
t=40s   ├─ Update invoice: status = "paid" ✅
t=40s   ├─ Update payment_sessions
t=40s   └─ Return 200 OK to PayOS

t=41s   PayOS redirect user về /payment-success

t=42s   Frontend load PaymentSuccessPage
t=42s   ├─ API #5: GET /invoices/{id}
t=42s   ├─ Response: status = "paid" ✅
t=42s   └─ Display success message

✅ DONE!
```

---

## 🔐 Security Best Practices

### 1. Signature Verification (Webhook)

```csharp
private bool VerifyWebhookSignature(PayOSWebhookDto webhook)
{
    var payload = JsonSerializer.Serialize(webhook.Data);
    var expectedSignature = ComputeHmacSha256(payload, _webhookSecret);
    return webhook.Signature == expectedSignature;
}
```

### 2. Idempotency (Webhook)

```csharp
// Check if already processed
var existingLog = await _webhookLogRepo.GetByOrderCode(orderCode);
if (existingLog?.Processed == true)
{
    return Ok("Already processed");
}
```

### 3. Authorization

```csharp
// All API endpoints require authentication
[Authorize]
[HttpPost("invoices")]
public async Task<IActionResult> CreateInvoice(...)
```

---

## 🔄 Error Handling Scenarios

### Scenario 1: Plan Không Active

```
API #2 Response:
{
  "flag": false,
  "message": "Subscription plan is not active",
  "data": null
}

Frontend Action:
- Show alert: "This plan is no longer available"
- Close modal
- Return to pricing page
```

### Scenario 2: Invoice Creation Failed

```
API #3 Response:
{
  "flag": false,
  "message": "User not found",
  "data": null
}

Frontend Action:
- Show alert: "Failed to create invoice. Please try again."
- Close modal
- Log error to console
```

### Scenario 3: PayOS API Failed

```
API #4 Response:
{
  "flag": false,
  "message": "PayOS API error: insufficient balance",
  "data": null
}

Frontend Action:
- Show alert: "Payment service error. Please try again later."
- Keep invoice as pending for retry
```

### Scenario 4: Webhook Failed

```
Webhook không được gọi hoặc failed

Frontend Fallback:
- Auto-refresh mỗi 3s (max 10 lần)
- API #5 polling cho đến khi status = "paid"
- Nếu timeout → Show manual refresh button
```

### Scenario 5: User Cancel

```
User clicks "Cancel" trên PayOS page

PayOS Action:
- Redirect to cancelUrl: /pricing
- NO webhook được gọi

Backend:
- Invoice vẫn ở status = "pending"
- Có thể có cronjob để auto-expire sau X hours
```

---

## 📝 Database Schema Reference

```sql
-- Invoices Table
CREATE TABLE invoices (
  id UUID PRIMARY KEY,
  user_external_id UUID NOT NULL,
  subscription_plan_id UUID NOT NULL,
  invoice_code VARCHAR(50) UNIQUE NOT NULL,
  amount DECIMAL(18,2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  status VARCHAR(20) NOT NULL, -- pending, paid, failed, cancelled, expired
  created_at TIMESTAMP NOT NULL,
  due_date TIMESTAMP NOT NULL,
  paid_at TIMESTAMP NULL,
  cancelled_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  transaction_id VARCHAR(100) NULL,
  notes TEXT NULL,
  FOREIGN KEY (user_external_id) REFERENCES users(id),
  FOREIGN KEY (subscription_plan_id) REFERENCES subscription_plans(id)
);

-- Payment Sessions Table
CREATE TABLE payment_sessions (
  id UUID PRIMARY KEY,
  invoice_id UUID NOT NULL,
  gateway INT NOT NULL, -- 0=PayPal, 1=Stripe, 2=PayOS
  payment_url TEXT NOT NULL,
  transaction_id VARCHAR(100) NULL,
  status VARCHAR(20) NOT NULL, -- pending, completed, failed, expired
  expired_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NULL,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id)
);

-- Webhook Logs Table (for idempotency)
CREATE TABLE webhook_logs (
  id UUID PRIMARY KEY,
  order_code BIGINT NOT NULL,
  payload TEXT NOT NULL,
  processed BOOLEAN NOT NULL DEFAULT false,
  processed_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL,
  INDEX idx_order_code (order_code)
);

-- User Subscriptions Table
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY,
  user_external_id UUID NOT NULL,
  subscription_plan_id UUID NOT NULL,
  invoice_id UUID NOT NULL,
  status VARCHAR(20) NOT NULL, -- active, expired, cancelled
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NULL,
  FOREIGN KEY (user_external_id) REFERENCES users(id),
  FOREIGN KEY (subscription_plan_id) REFERENCES subscription_plans(id),
  FOREIGN KEY (invoice_id) REFERENCES invoices(id)
);
```

---

## 🎯 Checklist Deploy Production

- [ ] PayOS webhook URL đã đăng ký: `https://api.yourdomain.com/billing/api/billing/payments/payos/webhook`
- [ ] Webhook secret đã được config trong backend
- [ ] SSL certificate valid cho webhook endpoint
- [ ] Database indexes đã được tạo (invoice_code, transaction_id, order_code)
- [ ] Logging đã enable cho tất cả payment operations
- [ ] Error monitoring setup (Sentry, Application Insights, etc.)
- [ ] Webhook idempotency đã được test
- [ ] Payment flow đã test với PayOS sandbox
- [ ] Cronjob để expire old pending invoices
- [ ] Email notifications cho payment success/failed
- [ ] Admin dashboard để xem payment analytics
- [ ] Backup và recovery plan cho payment data

---

## 📚 API Endpoints Summary

| #   | Method | Endpoint                                      | Purpose                 | Called By           |
| --- | ------ | --------------------------------------------- | ----------------------- | ------------------- |
| 1   | GET    | `/billing/api/billing/plans`                  | List subscription plans | Frontend            |
| 2   | GET    | `/billing/api/billing/plans/{id}`             | Get plan details        | Frontend            |
| 3   | POST   | `/billing/api/billing/invoices`               | Create invoice          | Frontend            |
| 4   | POST   | `/billing/api/billing/payments/initiate`      | Create payment session  | Frontend            |
| 5   | GET    | `/billing/api/billing/invoices/{id}`          | Get invoice status      | Frontend (polling)  |
| 6   | POST   | `/billing/api/billing/payments/payos/webhook` | Handle payment webhook  | PayOS               |
| 7   | POST   | `/billing/api/billing/payments/{id}/verify`   | Manual verify payment   | Frontend (fallback) |

---

Đây là flow hoàn chỉnh với tất cả API calls chi tiết! Bạn có câu hỏi gì về bất kỳ bước nào không? 🚀
