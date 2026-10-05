# Project Registry

> **Source of truth for which apps appear on https://ravisorathiya.github.io/.**
> Each app is one Markdown file, `content/projects/<slug>.md` (data + case study). Every app file must have a row in
> **Registry**, and every Registry row must have a file. `npm run check` (also run in CI before every deploy) fails if the
> two drift apart.
>
> Workflow for adding, updating or removing apps: [`CLAUDE.md`](../CLAUDE.md#workflows) · Site plan: [`SITE_PLAN.md`](SITE_PLAN.md)

Source folders are relative to the local workspace root `D:\workspace\`.

---

## 📥 Inbox: new projects to add

Add a line here, then ask Claude: **"process the project inbox"** or run **`/add-project <folder>`**.
Claude reads the source folder, adds the app to the site, moves the line into **Registry**, and logs it in **Changelog**.

<!-- Format: - `<source folder>`, optional note (e.g. "live on Play", "feature it", "group with X") -->

_(empty)_

---

## ✅ Registry: apps on the site

<!-- registry:start (parsed by scripts/check-projects.mjs; keep the table format) -->
| Slug | Title | Status | Type | Featured | Play package | Source folder |
| --- | --- | --- | --- | --- | --- | --- |
| pdf-reader | PDF Reader & Editor | in-progress | Productivity | yes | — | `development/ongoing/PDFReaderOrigin` |
| phone-call | Phone Call | live | Dialer & Contacts | yes | com.phonecall.phone.contact.callerdialer | `producation/PhoneCall_ZombiApp/1.7/PhoneCall_ZombiApp` |
| messages-compose | Messages | live | Messaging | yes | com.message.textmessenger.smsapp | `producation/Message/1.1/Messages_tiana_15_05_2026` |
| gallery-pro | Gallery - Photo Gallery | live | Gallery & Media | yes | com.gallery.picturegalleryapp.gallerypro | `producation/GalleryPro/1.4/Gallery_splash_02_04_2026` |
| messages-sms | Messages - SMS Messenger | live | Messaging | | com.messages.smsmessenger.textmessage.messenger | `producation/Message_SavexDesing/Messages_savexdesing_V2` (+ `producation/MessageUpdate`) |
| contacts-dialer | Contacts | live | Dialer & Contacts | | com.contacts.callerdialer.phonecalldialerapp | `producation/ContactHuntix/1.3/Contacts - AccuraLab-V2` |
| phone-caller-contacts | Phone Caller - Contacts | live | Dialer & Contacts | | com.calldialerpro.mobiledialer.phonebookdialer | `producation/PhoneCaller_Digital_GTD/1.3.1/PhoneCaller_Digital_GTD` |
| gallery-photo-album | Gallery - Photo Album | live | Gallery & Media | | com.albumgallery.imagegallery.photogallery | `producation/Gallery - Photo Album/Gallery - Photo Album/2.8/PhotoGallery` |
| gallery-locker | Gallery - Private Gallery | live | Gallery & Media | | com.photogallery.gallery.privategallery | `producation/GalleryLocker/Gallery_t_08_12_2025` |
| calendar-2026 | Calendar 2026 | live | Productivity | | com.calendar.sscalendar.holidaycalendar | `producation/CalenderUmbreltic/Callender-umbrellatac-V6` |
| alarm-clock | Alarm Clock | live | Productivity | | com.alarmclock.simplealarm.alarmapp | `producation/Alram_Beatiful_Disater/1.5/Alarm Clock - Beautifuls Disaster` |
| messenger-all-social | Messenger - All Social Apps | live | Social | | com.allmessages.messengerapp.allinonesocialmediaapps | `producation/Messenger_sc_29_12_2025` |
| noys-music-video-maker | Noys - Music Video Maker | live | Gallery & Media | | vishow.musical.video.maker.editor | — (earlier app, source not in workspace; content from its Play listing) |
| voice-recorder | Voice Recorder | completed | Productivity | | — | `development/completed/VoiceRecorder` |
<!-- registry:end -->

**Totals:** 14 apps: 12 live · 1 in progress · 1 completed.

---

## 🚫 Excluded: do not add these again

Apps that were deliberately removed or skipped. Before adding a new project, check it isn't listed here.

| Source folder | Was | Reason | Date |
| --- | --- | --- | --- |
| `development/completed/RaviGallery` | Photo Video Gallery | Unpublished duplicate of the published gallery apps | 2026-10-02 |
| `development/completed/RaviPhoneCall` | Ravi Phone Call | Unpublished; owner asked to remove | 2026-10-02 |
| `development/completed/RaviQuickSMS` (+ `_Origin`) | RaviMessage | Unpublished; owner asked to remove | 2026-10-02 |
| `development/completed/AllMessageSocial` | All Message Social | Unpublished; owner asked to remove | 2026-10-02 |
| `development/ongoing/daily-backup` | — | Zip snapshots only, not a project | 2026-10-02 |
| `development/queued/PDFReaderOrigin` | — | Older snapshot of `pdf-reader` | 2026-10-02 |

---

## 📝 Changelog

Newest first. One line per change to the project list.

- **2026-10-02:** Added `noys-music-video-maker` (Noys - Music Video Maker, live). It's an earlier app with no local source, so its content comes from the owner's Google Play listing.
- **2026-10-02:** Moved all apps to Markdown files in `content/projects/`, with case studies and Google Play screenshots.
- **2026-10-02:** Removed `all-message-social`, `ravi-message`, `ravi-phone-call`, `ravi-gallery` (unpublished).
- **2026-10-02:** Initial import: 11 Google Play apps + PDF Reader (in progress) + unpublished builds.
