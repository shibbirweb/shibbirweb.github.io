---
title: 'Debugging Twilio SMS Webhooks Locally with SendMock'
description: 'A simple Laravel setup for testing Twilio SMS webhooks on my own machine. The app sends SMS with a plain HTTP call to a base URL from .env, and SendMock sends back the delivery status webhooks and the reply webhooks from the number.'
date: '2026-11-16'
tags: ['Laravel', 'Twilio', 'SendMock', 'Webhooks', 'SMS', 'Debugging']
category: 'Backend'
difficulty: 'Beginner'
tech: ['Laravel', 'PHP', 'SendMock', 'Twilio']
series:
    name: 'Local Webhooks with SendMock'
    order: 2
learn:
    - 'How to send SMS through Twilio with a plain Laravel HTTP call and a base URL that comes from .env.'
    - 'How to receive Twilio delivery status webhooks locally, including a failed message.'
    - 'How to reply as the customer to the number the app sends from, and answer the reply webhook with TwiML.'
---

My Laravel app sends SMS through Twilio: login codes, order updates. Like with email in the [first part](/articles/debugging-mailgun-webhooks-locally-with-sendmock), sending is the easy part. What comes back is harder to test: Twilio reporting that a text was delivered or failed, and the customer texting back.

Both are webhooks from Twilio, and Twilio cannot reach my laptop. [SendMock](https://github.com/shibbirweb/sendmock) can, because it runs on the same machine. It answers Twilio's API, shows every SMS as a conversation, and sends both kinds of webhooks back to the app.

Here is the difference. Switch between the two scenarios, or open the interactive view and step through each hop:

```reactflow
title: Testing Twilio SMS webhooks, with and without SendMock

scenario "With SendMock"
> The SMS goes to SendMock, and both webhooks come straight back to the app, like a real Twilio server would send them. No real SMS, no phone, no deploy, and a failed delivery is one test number away.

Laravel app [my laptop]
> Sends the SMS, and has the webhook routes for delivery status and replies.

SendMock [on my laptop] {allowed}
> Answers Twilio's API, shows every SMS as a conversation, and posts the status and reply webhooks back to the app, like the real Twilio would.

Twilio [the real service]
> Sends the real SMS, then posts status and reply webhooks to public URLs only.

Real phone [my own handset] {blocked}
> Every test text costs money, and to test a reply I have to type it on the phone.

Laptop unreachable [webhooks never arrive] {blocked}
> Twilio only posts to public URLs. My laptop is not one, so the status and reply webhooks meant for my local handlers are simply lost.

Staging server [deploy every fix to test]
> The first place the webhooks can arrive, so every fix has to be committed and deployed before I can see if it works.

Laravel app --> SendMock (POST to TWILIO_BASE_URL) {allowed}
> Only .env changes: the base URL points at SendMock instead of api.twilio.com.

SendMock --> Laravel app (status and reply webhooks back) {allowed}
> Delivery status (queued, sent, delivered, or undelivered with Twilio's error code) goes to the StatusCallback URL. A reply typed in SendMock goes to the number's webhook, and the app answers with TwiML.

scenario "Without SendMock"
> Every test costs a real SMS, needs a phone in my hand, and the webhooks only reach a deployed server. Minutes per try, and a failed delivery is hard to make on demand.

Laravel app --> Twilio (send the SMS)
> A real API call with the real account, and a real charge.

Twilio --> Real phone (a real text arrives) {blocked}
> Fine once. Not fine for every test run.

Twilio --> Laptop unreachable (webhooks to localhost) {blocked}
> Neither the status callback nor the reply ever arrives. My local handlers never see them.

Twilio --> Staging server (webhooks, after a deploy)
> Minutes later. If a handler has a bug, the whole loop starts again.
```

## Start SendMock

Install it once. On macOS:

```bash
brew install shibbirweb/tap/sendmock
```

Other systems, Docker and `npx` are on the [install page](https://shibbirweb.github.io/sendmock/docs/install/). Then start it:

```bash
sendmock
```

The web UI is at `http://127.0.0.1:8025`, and Twilio's API is served under `http://127.0.0.1:8025/providers/twilio`.

## One HTTP call, with the base URL in .env

I do not use the Twilio SDK to send. Sending an SMS is one `POST` to Twilio's REST API, and Laravel's HTTP client does it in a few lines. The useful part is that the base URL comes from `.env`:

```php config/services.php
'twilio' => [
    'base_url' => env('TWILIO_BASE_URL', 'https://api.twilio.com'),
    'sid' => env('TWILIO_SID'),
    'token' => env('TWILIO_AUTH_TOKEN'),
    'from' => env('TWILIO_FROM'),
],
```

```php app/Services/TwilioSms.php
<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class TwilioSms
{
    public function send(string $to, string $body): array
    {
        $accountSid = config('services.twilio.sid');

        return Http::asForm()
            ->withBasicAuth($accountSid, config('services.twilio.token'))
            ->post(config('services.twilio.base_url')."/2010-04-01/Accounts/{$accountSid}/Messages.json", [
                'From' => config('services.twilio.from'),
                'To' => $to,
                'Body' => $body,
                'StatusCallback' => route('webhooks.twilio.status'),
            ])
            ->throw()
            ->json();
    }
}
```

Locally, the base URL points at SendMock. The SID only has to look like a Twilio SID, and the token can be anything:

```bash .env
TWILIO_BASE_URL=http://127.0.0.1:8025/providers/twilio
TWILIO_SID=AC00000000000000000000000000000001
TWILIO_AUTH_TOKEN=local-auth-token
TWILIO_FROM=+15550001111
```

In production `TWILIO_BASE_URL` is not set, so it falls back to `https://api.twilio.com`.

Call `app(TwilioSms::class)->send('+8801700000000', 'Your login code is 482913')` and SendMock answers like Twilio: a message `sid` starting with `SM`, and the status `queued`. The text shows up in SendMock's **SMS** screen as a conversation, with the code pulled out.

## Delivery status webhooks

The `StatusCallback` above is where Twilio reports each status change, and SendMock calls it too. Webhooks do not carry a CSRF token, so the webhook routes skip that check:

```php bootstrap/app.php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->validateCsrfTokens(except: [
        'webhooks/*',
    ]);
})
```

```php routes/web.php
use App\Http\Controllers\Webhooks\TwilioStatusController;

Route::post('/webhooks/twilio/status', TwilioStatusController::class)->name('webhooks.twilio.status');
```

The handler only logs the status here:

```php app/Http/Controllers/Webhooks/TwilioStatusController.php
<?php

namespace App\Http\Controllers\Webhooks;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TwilioStatusController
{
    public function __invoke(Request $request)
    {
        $messageSid = $request->input('MessageSid');
        $status = $request->input('MessageStatus');
        $errorCode = $request->input('ErrorCode');

        Log::info("Twilio: {$messageSid} is {$status}", ['error_code' => $errorCode]);

        return response()->noContent();
    }
}
```

`route()` builds the callback URL from `APP_URL`, so `APP_URL` must be the address the app really runs on (for `php artisan serve`, that is `http://127.0.0.1:8000`).

For a normal number, the log shows the three steps a real message goes through:

```text
Twilio: SMa0ce76d1693004564c5439e5cafadd6f is queued
Twilio: SMa0ce76d1693004564c5439e5cafadd6f is sent
Twilio: SMa0ce76d1693004564c5439e5cafadd6f is delivered
```

### A text that never arrives

To test a failure, send to `+15005550103` (every test number is on [Delivery and test numbers](https://shibbirweb.github.io/sendmock/docs/sms/delivery-and-test-numbers/)). SendMock accepts it, then marks it `undelivered` with error `30007`, the code Twilio uses when a carrier filters a message:

```text
Twilio: SM27ae64c15bbf88df82f34359273ce609 is undelivered {"error_code":"30007"}
```

Twilio's own test credentials never send these callbacks, which is why status handling is so easy to leave untested.

## The customer texts back

In Twilio, each phone number has a webhook for incoming messages. SendMock works the same way ([Numbers](https://shibbirweb.github.io/sendmock/docs/numbers/) has every option):

1. Open **Numbers** and press **Add number**.
2. Enter the app's sending number, `+15550001111` (the same as `TWILIO_FROM`), and tick **SMS**.
3. Under **Inbound messages**, set **Webhook URL** to `http://127.0.0.1:8000/webhooks/twilio/incoming`, **Method** to POST and **Format** to Twilio. Save.

The handler gets Twilio's normal form fields (`From`, `To`, `Body`) and answers with TwiML, as it would for Twilio:

```php routes/web.php
use App\Http\Controllers\Webhooks\TwilioIncomingController;

Route::post('/webhooks/twilio/incoming', TwilioIncomingController::class)->name('webhooks.twilio.incoming');
```

```php app/Http/Controllers/Webhooks/TwilioIncomingController.php
<?php

namespace App\Http\Controllers\Webhooks;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TwilioIncomingController
{
    public function __invoke(Request $request)
    {
        $from = $request->input('From');
        $body = trim((string) $request->input('Body'));

        Log::info("Twilio: reply from {$from}: {$body}");

        $twiml = '<?xml version="1.0" encoding="UTF-8"?>'
            .'<Response><Message>Thanks, we got your reply.</Message></Response>';

        return response($twiml)->header('Content-Type', 'text/xml');
    }
}
```

Now open the conversation in SendMock's **SMS** screen, type `STOP` in **Reply as recipient**, and send. The app logs:

```text
Twilio: reply from +8801700000000: STOP
```

The TwiML answer, "Thanks, we got your reply.", appears in the same conversation, as if the app had texted the customer back. **Message details** shows the request SendMock sent and the app's response.

## Twilio is only one of the services it stands in for

SendMock is not tied to Twilio or to Laravel. It speaks plain HTTP and SMTP, so any framework or language can use it, and the docs have the [connection settings](https://shibbirweb.github.io/sendmock/docs/connect/) for PHP, Node.js, Python, Go, Java, Rust, Ruby and .NET. SMS is one part of it (the full list is on [Supported providers](https://shibbirweb.github.io/sendmock/docs/providers/)):

- **SMS providers**: Twilio (Messages and Verify), Vonage, Plivo, MessageBird, Infobip, Telnyx, Sinch, Africa's Talking, Amazon SNS and WhatsApp Cloud, each answered at its real API paths.
- **Email**: SMTP, plus the Mailgun, SendGrid, Postmark, Resend, Amazon SES and Brevo APIs. The [first part](/articles/debugging-mailgun-webhooks-locally-with-sendmock) covers Mailgun webhooks.
- **Push notifications**: FCM, Expo and OneSignal.
- **Payments**: Stripe, PayPal, Razorpay, Paddle, bKash and SSLCommerz, with a test checkout page and the gateway's own webhooks.
- **HTTP catcher**: point any HTTP call at a catcher bin, see the full request, and send back the response you choose.

### A regional SMS vendor it does not ship

Providers are data, not code. A local SMS gateway with its own API can be added from the UI: start blank or copy the closest built-in, then set its paths, fields, responses and error codes. The same goes for payment gateways and webhook templates. No fork and no rebuild. [Advanced](https://shibbirweb.github.io/sendmock/docs/advanced/) walks through each one.

### Or hand the whole thing to an AI agent

SendMock is [AI first](https://shibbirweb.github.io/sendmock/docs/ai/). Every feature is one operation shared by the web UI, the REST API, the CLI and an MCP server, so anything I can click, a coding agent can do too. One command connects it:

```bash
sendmock ai install --target claude-code
```

Codex, Cursor, Gemini CLI and VS Code have their own targets. After that I can ask the agent to do the work in this article: point `TWILIO_BASE_URL` at SendMock, add the number with its reply webhook, send to `+15005550103`, and check that the status handler logged `30007`. It can run a whole OTP sign-up end to end, reading the code from SendMock, or build a vendor SendMock does not ship from that vendor's API docs. Secret values stay hidden from agents.

## What changes in production

Only `.env`:

- **`TWILIO_BASE_URL`**: SendMock locally, not set in production.
- **`TWILIO_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM`**: fake values locally, the real ones in production.

No mocks in the code and no `if (app()->isLocal())`. The app talks to SendMock the way it talks to Twilio, and both webhooks come back the way they would in production, where I can see them and fix the handler before a real customer ever texts STOP.

## Explore SendMock

Everything in this article is a small part of SendMock. If you want to dig further:

- **[Documentation](https://shibbirweb.github.io/sendmock/docs/)**: every screen, recipe and provider, step by step.
- **[Live demo](https://shibbirweb.github.io/sendmock/demo/)**: the full UI with sample data, in the browser, nothing to install.
- **[GitHub](https://github.com/shibbirweb/sendmock)**: the source, releases and issues.
