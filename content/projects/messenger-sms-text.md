---
title: "Messenger - SMS Text Messages"
type: "Messaging"
status: live
featured: false
order: 55
icon: /images/apps/messenger-sms-text.webp
playPackage: com.bluemessages.smstextingapp
developer: "Messenger SMS Messages"
developerUrl: https://play.google.com/store/apps/developer?id=Messenger+SMS+Messages
summary: "A default SMS & MMS messenger with end-to-end encrypted threads, scheduled sends and caller ID."
features:
  - "Default SMS/MMS app with dual-SIM sending"
  - "End-to-end encrypted conversations (ECDH key exchange)"
  - "Scheduled messages and archive"
  - "Quick reply from conversation-style notifications"
  - "Message search and themes"
  - "Caller-ID screen after calls"
  - "12 languages"
highlights:
  - "Room database (9 entities, v12 migrations) + Paging 3 conversation lists"
  - "Per-contact keys kept in the Android Keystore"
  - "WorkManager jobs that retry routed messages when the network returns"
  - "JNI/C++ bridge for MMS sending"
tags:
  - "Java"
  - "Kotlin"
  - "XML Views"
  - "Default SMS role"
  - "Room"
  - "Paging 3"
  - "WorkManager"
  - "E2EE"
  - "Firebase"
  - "AdMob"
  - "AppLovin MAX"
basedOn: "Deku SMS"
screenshots:
  - src: /images/apps/messenger-sms-text/1.webp
    alt: "Messenger - SMS Text Messages screenshot 1"
    width: 720
    height: 352
  - src: /images/apps/messenger-sms-text/2.webp
    alt: "Messenger - SMS Text Messages screenshot 2"
    width: 720
    height: 1280
  - src: /images/apps/messenger-sms-text/3.webp
    alt: "Messenger - SMS Text Messages screenshot 3"
    width: 720
    height: 1280
  - src: /images/apps/messenger-sms-text/4.webp
    alt: "Messenger - SMS Text Messages screenshot 4"
    width: 720
    height: 1280
  - src: /images/apps/messenger-sms-text/5.webp
    alt: "Messenger - SMS Text Messages screenshot 5"
    width: 720
    height: 1280
  - src: /images/apps/messenger-sms-text/6.webp
    alt: "Messenger - SMS Text Messages screenshot 6"
    width: 720
    height: 1280
---

## Overview

A default SMS & MMS messenger for Android, published on Google Play as **Messenger - SMS Text Messages**. On top of everyday texting, it can encrypt a conversation end to end, schedule messages, archive threads, and show a caller-ID screen after calls.

## How it works

- **Default SMS role.** The app asks for `RoleManager.ROLE_SMS`. It then receives `SMS_DELIVER` and `WAP_PUSH_DELIVER` broadcasts and handles `RESPOND_VIA_MESSAGE` (quick replies from the incoming-call screen).
- **Dual SIM.** `SubscriptionManager` lists the active SIMs so the user picks the one each message is sent from.
- **Notifications.** New messages appear as `MessagingStyle` notifications, with an inline `RemoteInput` reply.
- **Scheduled messages** are stored in Room and fired by `AlarmManager` through a dedicated receiver.
- **End-to-end encryption.** Each contact gets an ECDH key pair. The private key is wrapped by the Android Keystore before it is saved, and public keys are exchanged over SMS. After that, the thread's messages are encrypted.

## Architecture

- **Data:** one Room `Datastore` for conversations, threads, archive, scheduled messages, keys and gateway settings, with explicit migrations up to schema v12.
- **UI:** conversation lists page through `PagingSource`, behind ViewModels (`MainChatViewModel`, `ChatViewModel`, `SearchViewModel`).
- **Background work:** routed messages are queued as `OneTimeWorkRequest`s that require a network connection and back off between retries. A RabbitMQ (AMQP) client handles gateway connections.
- **Native code:** a small C++ library behind JNI handles MMS sending.
- **Platform services:** Firebase (Remote Config, Analytics, Crashlytics, Messaging, Performance), in-app updates and reviews, and AdMob with AppLovin MAX mediation.
- **Languages:** 12 locales, switched in the app with Lingver.
