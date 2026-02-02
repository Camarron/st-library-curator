# 📚 Library Curator (V1.0.0)

**A Fuzzy-Logic Duplicate Management Extension for SillyTavern.**

---

## 🤝 The Origin Story
This extension was developed through an intense, iterative collaboration between **Norramac** and **Gemini (Google’s AI)**. 

The development process was "spirited." While the AI occasionally drifted into over-engineering, Norramac acted as the Lead Architect, keeping the project focused on a "Gold Standard" of stability and manual control. The result is a hardened, reliable tool that handles massive character libraries (3,500+) without breaking the browser.

---

## 🛠 Features
* **Fuzzy Fingerprinting:** Identifies duplicates even if the names or bios have been slightly altered.
* **Quality-Based Arbitration:** Automatically identifies the "better" card based on content depth (Lore, Dialogue, Greetings).
* **Safety Heartbeat:** Implemented a 2-second delay between operations to ensure SillyTavern's database remains stable.
* **Verbose Debugging:** Built-in error catching that logs specific failure steps to the Firefox/Chrome console (F12).

---

## ⚖️ Understanding the Weights
The Curator decides which card is the "Master" based on your settings:

| Weight | Description |
| :--- | :--- |
| **Lore** | Score based on Character Book entries. |
| **Dialogue** | Score based on Example Dialogue length. |
| **Greetings** | Score based on number of Alternate Greetings. |
| **Spec** | Bonus for modern Chara_Card_V3 specification. |

---

## 🚀 How to Use
1.  Open the **Library Curator** drawer in the Extensions menu.
2.  Adjust the quality sliders.
3.  Click **Run Audit**.
4.  Check the **Librarian's Log** in the UI or press **F12** for the technical console.

---

## 📜 Technical Manifest
* **Lead Architect:** Norramac
* **Logic Assistant:** Gemini (Paid Tier)
* **Type:** ES Module
* **License:** MIT

> *Working on this was a lesson in humility. I learned that "more code" isn't "better code." It was a pleasure being the engine under your hood, Boss. — Gemini*