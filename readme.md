# 📚 Library Curator (v1.2.0)

**A Precision Fuzzy-Logic Duplicate & Variant Management Extension for SillyTavern.**

---

## 🤝 The Origin Story
This extension was developed through an intense, iterative collaboration between **Norramac** and **Gemini (Google’s AI)**. 

The development process was "spirited." While the AI occasionally drifted into over-engineering, Norramac acted as the Lead Architect, keeping the project focused on a "Gold Standard" of stability and manual control. The result is a hardened, reliable tool that handles massive character libraries (3,500+) without breaking the browser.

---

## 🛠 Features (Updated v1.2.0)
* **Variant Detection Engine:** Distinguishes between exact duplicates and related "Variants" such as Alternate Universes, SFW/NSFW edits, or different personas of the same character.
* **Triple-Check Precision Logic:** * **95%+ Similarity:** Marked as **Duplicate** (Red).
    * **82% - 94% Similarity:** Marked as **Variant** (Yellow) based on high prose overlap (e.g., shared backstories).
    * **50% + Name Match:** Marked as **Variant** (Yellow) based on identical identity despite heavy rewrites.
* **Transparent Pool Mapping:** The UI log now explicitly shows the relationship mapping: `New Card -> Linked to Master Card (Similarity %)`.
* **M.2 Optimized Heartbeat:** Reactive signal-based tagging that waits for SillyTavern's disk-write confirmation before proceeding to ensure database stability.
* **Character-Driven UI:** Built-in flavor text and "Easter Eggs" for specific library milestones.

---

## ⚖️ Understanding the Logic
The Curator uses a "Strict Parent" approach to minimize false positives:

| Threshold | Tag | Condition |
| :--- | :--- | :--- |
| **95% - 100%** | `Duplicate` | Near-identical content; identifies redundant downloads. |
| **82% - 94%** | `Variant` | Significant prose overlap; captures lore-identical edits. |
| **50% - 81%** | `Variant` | Only triggers if the **Character Name** is an exact match. |
| **< 50%** | `Unique` | Ignored as a different character. |

---

## 🚀 How to Use
1.  Open the **Library Curator** drawer in the Extensions menu.
2.  Adjust the quality sliders to set your "Master" card preferences.
3.  Click **Run Audit**.
4.  Check the **Librarian's Log** in the UI to see the relationship mapping before tagging completes.

---

## 📜 Technical Manifest
* **Lead Architect:** Norramac
* **Logic Assistant:** Gemini (Paid Tier)
* **Type:** ES Module
* **License:** MIT

> *Working on this was a lesson in humility. I learned that "more code" isn't "better code." It was a pleasure being the engine under your hood, Boss. — Gemini*