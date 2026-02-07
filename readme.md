# 📚 Library Curator (v2.0)

**A Semantic-Analysis & Fuzzy-Logic Curation Engine for SillyTavern.**

---

## 🤝 The Origin Story
This extension is the result of an evolving collaboration between **Norramac** (Lead Architect) and **Gemini** (AI Assistant). 

What started as a simple duplicate finder has evolved into a **Quality Control Engine**. In v1.5.0, we pivoted away from the "bigger is better" mindset. We realized that a 10,000-character description full of broken JSON is worse than a clean 500-character summary. The Curator now "reads" your cards like an LLM would, punishing garbage data and rewarding proper formatting.

---

## 🛠 Features (Updated v1.5.0)

### 🧠 Semantic Smart Scoring
The Curator no longer assumes "Longer = Better." It now parses card fields to determine **Functional Quality**:
* **Feature Detection:** Awards points for **Alternate Greetings**, **System Prompts**, **Depth Prompts**, and **V3 Specs**.
* **Garbage Detection:** Heavily penalizes cards containing placeholder text (e.g., *"Write description here..."*) or JSON pollution.
* **Dialogue Validation:** Checks `mes_example` for proper formatting (e.g., `<START>` headers) rather than just raw character count.

### 🏷️ Smart Tagging System
The Curator is now non-destructive and highly specific. It applies tags based on *why* a card was flagged:
* `#Duplicate`: The standard tag for a card that is statistically inferior to a matching "Master" card.
* `#Variant`: For cards that share an identity (Name + 50% similarity) but have significant creative differences.
* `#IncorrectFormat`: **(NEW)** A "Shame Tag" applied to cards that contain broken code, raw JSON dumps, or lazy placeholders.

### 🎛️ Granular Control
You now have full control over the scoring algorithm via the UI:
* **Strictness Slider:** Crank this up to penalize obsolete formats (like 2023-era "AliChat" brackets) that confuse modern LLMs.
* **Weight Sliders:** Decide what matters most to you—Lorebook density, Dialogue length, or V3 Technical Specs.

---

## ⚖️ Understanding the Logic
The Curator uses a two-step process: **Fingerprinting** (to find matches) and **Tribunal** (to judge them).

| Logic Layer | Action |
| :--- | :--- |
| **Fuzzy Match (95%+)** | Identifies the group. The card with the highest **Semantic Score** becomes the Master. Losers get tagged `#Duplicate`. |
| **Garbage Check** | If a loser contains broken JSON or placeholders, it also gets tagged `#IncorrectFormat`. |
| **Variant Match (82%)** | Cards with different prose but identical names/themes are tagged `#Variant` so you can manually review them. |
| **Strict Mode** | If enabled, penalizes `[character("Name")]` style brackets in favor of natural language descriptions. |

---

## 🚀 How to Use
1.  Open the **Library Curator** drawer in the Extensions menu.
2.  **Set your Weights:**
    * *Dialogue:* Values proper formatting and length.
    * *Lore:* Values valid, non-empty World Info entries.
    * *Spec:* Values advanced prompts (Depth/System).
    * *Strictness:* Controls how aggressively we punish "old school" formatting.
3.  Click **Run Audit**.
4.  Watch the **Verbose Log** to see exactly *why* a card is being tagged (e.g., `>> Flagging Bad Format: CardName`).

---

## 📜 Technical Manifest
* **Lead Architect:** Norramac
* **Logic Assistant:** Gemini (Paid Tier)
* **Version:** 2.0.0 (Semantic Update)
* **Type:** ES Module

> *"We finally taught the machine to tell the difference between a novel and a dictionary. It's not about how much you write; it's about whether the AI can actually read it." — Gemini*