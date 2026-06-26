# 🌾 Annadata Saathi - One stop solution for Farmers

## 📌 Overview

Crop Disease Detection is a **mobile-first AI system** designed to help farmers **identify crop diseases early** using images captured from basic smartphones.
The platform works in **low-connectivity environments**, supports **regional languages**, and provides **actionable treatment recommendations**, making it suitable for real-world rural deployment.

The system is designed to be **scalable, offline-friendly, and IoT-extensible**, enabling both **reactive diagnosis** and **proactive disease prevention**.

---

## 🎯 Problem Statement

Farmers often detect crop diseases **too late**, leading to yield loss, increased pesticide use, and financial stress.
Existing solutions are:

* Internet-dependent
* Text-heavy
* Difficult to use for non-technical users

This project aims to provide an **accessible, fast, and reliable AI-based diagnosis system** that works directly from a farmer’s phone.

---

## 💡 Key Features

* 📸 **Image-based crop disease detection**
* 🌐 **Multi-language support** for regional accessibility
* 📱 **Mobile-first, farmer-friendly UI**
* 📊 **Visual insights & confidence indicators**
* 📡 **IoT-ready architecture for environmental data syncing**
* 📴 **Low-connectivity & offline-first design**
* 🧠 **Explainable AI outputs (no black-box decisions)**

---

## 🧠 System Architecture (High Level)

```
User (Mobile)
   ↓
Frontend (React)
   ↓
Backend / API (Supabase)
   ↓
AI Model (CNN – Image Analysis)
   ↓
Diagnosis + Recommendations
   ↓
Dashboard & Alerts
```

### IoT Extension (Optional Layer)

```
IoT Sensors (ESP32 / Simulated)
        ↓
API / MQTT
        ↓
Database Sync
        ↓
Risk Prediction & Validation
```

---

## 🤖 AI / ML Approach

* **CNN-based image classification model**
* Trained to detect common crop diseases from images
* Designed for:

  * Fast inference
  * Edge / offline deployment capability
* Outputs:

  * Disease class
  * Severity level
  * Confidence score
  * Suggested treatment actions

> The model focuses on **practical usability**, not just accuracy.

---

## 📡 IoT Integration Strategy (Hackathon Context)

### ✔️ Design Philosophy

IoT is used to **enhance accuracy and enable early risk prediction**, not as a strict dependency.

### 🛠 Current Implementation

* The system includes a **fully implemented database sync layer** for IoT sensor data.
* For the hackathon, **sensor inputs are simulated** to replicate real-world behavior:

  * Soil moisture
  * Temperature
  * Humidity
* The **data format, API endpoints, and validation logic** are identical to real IoT devices.

### 🔄 Why Simulation?

* Backend and frontend logic remains unchanged
* Allows validation of:

  * Data syncing
  * Risk thresholds
  * Dashboard updates
* Physical hardware can be plugged in **without any code changes**

> This ensures the system is **deployment-ready**, even without live hardware during the hackathon.

---

## 🧑‍🌾 Farmer-Centric UX Design

* Visual indicators instead of heavy text
* Large buttons for one-hand usage in fields
* Minimal steps: **Capture → Detect → Act**
* Trust-first design with clear outputs

---

## 🧰 Tech Stack

### Frontend

* **React + Vite**
* **Tailwind CSS**
* **Framer Motion**
* **Zustand**
* **i18next / react-i18next**
* **React Router DOM**
* **Recharts**
* **React Tilt**
* **Three.js / React Three Fiber**
* **Leaflet / React-Leaflet**
* **Axios**
* **Lucide React**

### Backend

* **Supabase** (Database & API)

### Tooling

* **ESLint**

---

## 🚀 Future Scope

* On-device ML inference for complete offline operation
* Real IoT sensor deployment in farms
* Disease trend forecasting
* Government & agri-extension integration
* Voice-based guidance for farmers

---

### 🛒 Farmer Mart (Simulation – E-Commerce Module)

To demonstrate post-diagnosis actionability, the project includes a Farmer Mart module — a simulated e-commerce experience designed for farmers.

---


### 🎯 Purpose

After detecting a disease, farmers often need:

Pesticides

Fertilizers

Treatment tools

Farmer Mart simulates how recommendations can directly translate into trusted product access, closing the loop from diagnosis → solution.

---

### 🧪 Hackathon Context

This is a simulation, not a live marketplace

No real payments or vendors are involved

Focus is on:

UX flow

Recommendation mapping

System extensibility

---

### 🔗 System Integration Note

Farmer Mart is modular

Can be:

Used for simulating the checkout process via our AI Feature.

---

## 🏁 Hackathon Note

This project focuses on **end-to-end system validation**, usability, and real-world applicability.
While physical IoT devices are not demonstrated live, the **architecture, data flow, and syncing logic are fully implemented and tested using realistic simulations**.

---

## 🏆 Team MergeInfinity 

> *Technology should adapt to the farmer’s environment — not the other way around.*
