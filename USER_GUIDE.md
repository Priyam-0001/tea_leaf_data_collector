# Tea Leaf Data Collector – End-to-End User & Training Guide

This guide provides a comprehensive, field-ready protocol for data collectors, agricultural researchers, and students operating the **Tea Leaf Data Collection System** developed at the **Tocklai Tea Research Institute (TTRI)** under the supervision of **Dr. Sangeeta Borchetia** and **Dr. Prabir Barooah**.

---

## 📋 Table of Contents
1. [Project Background & Scientific Goal](#1-project-background--scientific-goal)
2. [Quick-Start 5-Step Field Workflow](#2-quick-start-5-step-field-workflow)
3. [App Installation & First-Time Setup](#3-app-installation--first-time-setup)
4. [Step-by-Step: Adding a New Sample](#4-step-by-step-adding-a-new-sample)
5. [Leaf Photography & Optical Protocol (Crucial for AI/ML)](#5-leaf-photography--optical-protocol-crucial-for-aiml)
6. [Chlorophyll Meter (SPAD) Measurement Standard](#6-chlorophyll-meter-spad-measurement-standard)
7. [Reviewing, Searching & Editing Records](#7-reviewing-searching--editing-records)
8. [End-of-Day Data Export (CSV & Images Backup)](#8-end-of-day-data-export-csv--images-backup)
9. [Cloud Synchronization](#9-cloud-synchronization)
10. [Troubleshooting & Frequently Asked Questions (FAQ)](#10-troubleshooting--frequently-asked-questions-faq)
11. [Daily Field Readiness Checklist](#11-daily-field-readiness-checklist)

---

## 1. Project Background & Scientific Goal

The objective of this research is to build a high-accuracy Deep Learning and Computer Vision model capable of estimating tea leaf chlorophyll concentration directly from smartphone images. 

To train this model successfully:
- Leaf photos must be paired with precise numerical optical readings from a calibrated chlorophyll meter (SPAD-502).
- Agronomic metadata (clone number, leaf position, flush season, location) must be consistently maintained.
- Every photo must adhere to standardized lighting, angle, and framing standards.

---

## 2. Quick-Start 5-Step Field Workflow

```
[1. Office (Online)]       Log in to app over Wi-Fi
        ↓
[2. Field / Lab (Offline)] Measure 3 SPAD points on target leaf
        ↓
[3. In-App Capture]        Enter Clone, Leaf Pos, Health & snap photo
        ↓
[4. Offline Backup]        Tap "Export Records" to save CSV & image files to phone
        ↓
[5. Office Return]         Tap "Cloud Sync" → "Sync Now" to push to Supabase
```

---

## 3. App Installation & First-Time Setup

1. **Permissions Required:**
   - **Camera:** Required for high-resolution leaf capture.
   - **Location (GPS):** Required on initial startup to capture coordinates when available.
   - **Notifications:** Required to notify you of cloud synchronization progress in the background.
2. **Initial Login:**
   - Open the app while connected to Wi-Fi or mobile data.
   - Enter your researcher account email and password.
   - Once logged in, your session is saved locally in encrypted storage. **You can now use the app completely offline in the tea gardens.**

> ⚠️ **Important:** Do NOT tap "Logout" while in the field without internet, as logging back in requires an active internet connection to contact Supabase Auth.

---

## 4. Step-by-Step: Adding a New Sample

1. On the Home screen, tap **"Add Sample"**.
2. **Sample Information:**
   - **Clone Number:** Enter the tea clone identifier (e.g. `TV1`, `TV2`, `TV23`, `T3E3`).
   - **Tree Number:** Number identifying the bush or plant.
   - **Leaf Number:** Sequence number for that session.
   - **Leaf Position:** Select from dropdown:
     - `1st Leaf` (topmost tender apical leaf)
     - `2nd Leaf`
     - `3rd Leaf`
     - `4th Leaf` / `5th Leaf`
     - `Maintenance Leaf` (mature lower leaf)
3. **Meter Readings:**
   - Take 3 separate readings with the SPAD chlorophyll meter.
   - Enter **Meter Reading 1**, **Meter Reading 2**, and **Meter Reading 3**.
4. **Collection Information:**
   - **Flush:** Select `First Flush`, `Second Flush`, `Monsoon Flush`, or `Autumn Flush`.
   - **Garden Name:** e.g. `Tocklai Experimental Garden`.
   - **Section Name:** e.g. `Plot 4B`.
5. **Plant Health Assessment:**
   - Check all applicable flags: `Healthy`, `Wilting`, `Chlorosis` (yellowing), `Scorching` (burnt tips), `Pest Damage`, or `Disease`.
6. **Leaf Photos:**
   - Tap **"Capture Images"**. Frame the leaf and capture. (Take 1 to 3 photos per sample).
7. **Remarks:** Add any optional observations (shading, mechanical tears, rain wetness).
8. Tap **"Save Sample"**.

---

## 5. Leaf Photography & Optical Protocol (Crucial for AI/ML)

The Deep Learning model predicts chlorophyll from fine pixel values (green intensity, reflectance, and vein structure). Follow these optical rules:

### ✅ DO:
- **Place leaf on a clean white / neutral background** (a white clipboard or sheet of paper).
- **Keep camera parallel to the leaf surface** (straight top-down 90° angle, no oblique tilt).
- **Ensure diffused, uniform lighting:** Capture indoors or under open shade. Avoid harsh direct midday sunlight which causes severe specular glare.
- **Ensure full leaf is inside the frame:** The apex (tip), lamina (blade), and petiole (stalk) should all be clearly visible and in focus.

### ❌ AVOID:
- **Never hold the leaf with fingers covering the blade.**
- **Never photograph on cluttered soil or patterned surfaces** (confuses AI segmentation).
- **Avoid blurry shots:** Hold the phone steady until the shutter completes.

---

## 6. Chlorophyll Meter (SPAD) Measurement Standard

For every leaf sample, take **3 distinct readings**:
- **Point 1:** Upper third of the leaf (near the tip), halfway between midrib and margin.
- **Point 2:** Middle of the leaf blade, on the opposite side of the midrib.
- **Point 3:** Lower third (near leaf base), ensuring the sensor head is fully covered by leaf tissue.

*Avoid clamping the optical sensor directly on thick primary veins.*

---

## 7. Reviewing, Searching & Editing Records

- From the Home screen, tap **"View/Update Sample"**.
- Use the **Search bar** to search by Clone, Tree, Leaf number, Garden, or Sample UUID.
- Tap any record to view its full details, GPS coordinates, timestamps, and images.
- If a reading or note was entered incorrectly, tap **"Edit Sample"**, adjust the values, and save.

---

## 8. End-of-Day Data Export (CSV & Images Backup)

Before leaving the field or shutting down for the day, create a local backup:

1. Tap **"Export Records"** on the Home screen.
2. Review total samples ready to export, then tap **"Export Records"**.
3. Select which samples you wish to export (or select all).
4. The system Storage Access Framework picker will open. Select a destination folder (e.g. `Documents` or an external SD Card) and tap **"Use this folder"** $\rightarrow$ **"Allow"**.
5. The app writes:
   - A standardized CSV file containing all agronomic columns, timestamps, device IDs, and SPAD readings.
   - An image subfolder containing all high-resolution PNG/JPEG photos.

---

## 9. Cloud Synchronization

When returning to the office:

1. Connect the phone to stable Wi-Fi.
2. Open the app and observe the **Cloud Sync** status card on Home.
3. Tap **"Sync Now"**.
4. Keep the app open on the sync screen until the progress bar reaches 100%.
5. If the network drops or you need to pause, tap **"Pause Sync"**. You can resume at any time from the exact same point without losing progress.

---

## 10. Troubleshooting & Frequently Asked Questions (FAQ)

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **"Location Required" alert on app open** | GPS is turned off on device | Enable Location/GPS in Android notification settings and tap "Ok". |
| **"User is not authenticated"** | Phone went offline before initial login | Connect to Wi-Fi/4G once, log in, and do not log out during field work. |
| **Image sync seems slow** | Uploading full uncompressed photos over weak 3G/2G | Pause sync and wait until connected to broadband Wi-Fi in the lab/office. |
| **Folder picker closed without saving** | User pressed Back or Cancel during folder selection | Tap "Export Records" again and select a folder without pressing Back. |
| **Accidental sample deletion** | Tap on "Clear Records" | Clear records only after verifying files are exported to CSV or synced to cloud. |

---

## 11. Daily Field Readiness Checklist

- [ ] Phone charged $\ge 80\%$.
- [ ] At least 2 GB of internal storage available.
- [ ] Logged into app while on office Wi-Fi.
- [ ] White photography board / paper packed.
- [ ] SPAD meter calibrated and lenses wiped.
- [ ] End of field shift: Exported CSV + images to phone storage.
- [ ] Office return: Ran Cloud Sync to push data to Supabase.
