# 📚 Library Curator (v4.0 - Enhanced Edition)

**The "Forensic Auditor" Update - Now with Full Customization & Flavor.**

**A High-Speed Forensic Audit & Curation Engine for SillyTavern.**

---

## 🔍 Overview

The Library Curator has evolved beyond simple duplicate detection—it hunts for **Technical Debt**. Version 4.0 introduces full user customization, smart tag counting, and delightful flavor text while maintaining the high-speed Forensic Engine that processes libraries of 6,000+ cards without freezing the UI.
PowerShell Script (To NonDestructively Move Duplicates to a Subfolder, logging everything to a .csv - Usage Drop .ps1 File into your Characters Folder and run it.)
( https://mega.nz/file/osRVHbZR#VFjhvGBIM8O9XTZHdKpqWPrhci-MbPBwnkeMZw8biSA )

---

## 🆕 What's New in v4.0 (Enhanced Edition)

### User Customization
- ✅ **Forensic Toggle**: Disable format checking if you don't want automatic quality assessments
- ✅ **All Weights Exposed**: Fine-tune every aspect of quality scoring
- ✅ **Smart Tag Counter**: Shows actual tags to be applied (e.g., "Tagging... 45/120" not just "Tagging...")
- ✅ **Flavor Text Rotation**: Delightful messages cycle during tagging phase
- ✅ **Auto-Sizing Status**: Text automatically scales to fit without overflow

### Performance
- ✅ **Differential Tagging**: Skips cards already properly tagged
- ✅ **Session Tracking**: Prevents re-tagging within the same audit run
- ✅ **Optimized Delays**: 100ms per tag operation for reliability

---

## ⚙️ How Quality Scoring Works

The Curator assigns each character card a **Quality Score** based on multiple factors. Cards with higher scores are considered "masters" when duplicates are found.

### Formula Breakdown

```
Total Score = Description_Score + Lorebook_Score + Dialogue_Score + Greetings_Score + Spec_Score - Penalties
```

#### 1. **Description Length** (`descLength` divisor)
- **Calculation**: `floor(description.length / descLength)`
- **Default**: `descLength = 200` (so every 200 chars = 1 point)
- **Example**: A 1000-char description = 5 points
- **Customization**: Lower divisor = more generous scoring

#### 2. **Lorebook Entries** (`lore` weight)
- **Calculation**: `(valid_entries × lore) / 2`
- **Default**: `lore = 5` (so each valid entry = 2.5 points)
- **Valid Entry**: Has content >10 chars + at least one keyword
- **Example**: 4 valid entries × 5 = 10 points (divided by 2 = 5 points)

#### 3. **Example Dialogue** (`dialogue` weight)
- **Calculation**: `dialogue` weight + bonus points
- **Default**: `dialogue = 10`
- **Bonuses**:
  - Contains `<START>` or `Example:` → +10 points
  - Contains `:` (dialogue formatting) → +2 points
- **Example**: Well-formatted dialogue = 12 points

#### 4. **Alternate Greetings** (`greetings` weight)
- **Calculation**: `unique_greetings × greetings`
- **Default**: `greetings = 3`
- **Example**: 5 unique greetings × 3 = 15 points

#### 5. **V3 Spec Features** (`spec` weight)
- **Calculation**: `spec` weight per feature
- **Default**: `spec = 5`
- **Features**:
  - `system_prompt` >10 chars → +5 points
  - `depth_prompt` >10 chars → +5 points
- **Example**: Both prompts present = 10 points

#### 6. **Strictness Penalties** (`strict` multiplier)
- **Calculation**: `-5 × strict` for each violation
- **Default**: `strict = 1` (so -5 points per violation)
- **Violations**:
  - Contains `[character(` or `property=` (AliChat/Plist format)
- **Example**: 1 violation × 1 strictness = -5 points

### Quality Threshold

Cards with **Total Score < `qualityThreshold`** are flagged with `[NEEDS_FIXING]`.

- **Default**: `qualityThreshold = 20`
- **Customization**: Raise to be more lenient, lower to be stricter

---

## 🛠 Forensic Scan (Format Detection)

When **Forensic Scanning** is enabled, the Curator applies specific tags to cards with structural issues:

| Fix Tag | The Crime | How to Fix |
| :--- | :--- | :--- |
| `FIX:Structure_V2` | **Wall of Text**: Description >800 chars but `Personality` field is empty. | Migrate key traits to Personality field. |
| `FIX:Dialogue_Move` | **Leaking Chat**: Example dialogue (`{{char}}:`) found in Description. | Move to `mes_example` field. |
| `FIX:Cleanup_JSON` | **Bad Import**: Description starts with `{ "description": ...` | Remove raw JSON artifacts. |
| `FIX:Delete_Placeholders` | **Lazy Creator**: Contains text like *"Write description here"*. | Replace with actual content. |
| `[NEEDS_FIXING]` | **Master Flag**: Applied if any of the above are found, OR quality score < threshold. | Address specific issues or improve content. |

**Toggle this off** if you prefer manual curation or have cards intentionally using alternative formats.

---

## 🔍 Duplicate & Variant Detection

### Duplicates (Auto-Tagged)
- **Criteria**: ≥95% description similarity AND ≥80% name similarity
- **Action**: Lower-quality card gets `Duplicate` + `IncorrectFormat` tags
- **Master Selection**: Highest quality score (ties broken by file size)

### Variants (Auto-Tagged)
- **Criteria**: ≥85% description similarity OR (≥50% similarity + ≥80% name match)
- **Action**: Both cards get `Variant` tag (or `Futa-Variant` if futa detected)
- **Purpose**: Preserves different versions of the same character

### Futa Detection
Cards are tagged `Futa-Variant` instead of `Variant` if they contain:
- `futa` or `futanari` in tags, description, or name (case-insensitive)

---

## ⏱️ Performance Metrics

Based on real-world testing with a **5,086-card library**:

### Scan Phase
- **Time**: ~2-5 minutes
- **Task**: Fingerprinting, quality scoring, group analysis
- **Progress**: 0% → 60%

### Tagging Phase
- **Time**: ~5-15 minutes (depends on tags needed)
- **Task**: Differential tagging (skips already-tagged cards)
- **Progress**: 60% → 100%
- **Rate**: ~100ms per tag operation

### Total Estimated Time
| Library Size | Estimated Time | Tags Applied |
| :---: | :---: | :---: |
| 500 cards | 1-2 minutes | 10-30 |
| 1,000 cards | 3-5 minutes | 20-60 |
| 5,000 cards | 8-15 minutes | 50-200 |

**Note**: Time varies based on:
- Number of duplicates/variants found
- Number of format issues detected
- Whether forensic scanning is enabled
- Tags already present (differential skipping)

---

## 🚀 How to Use

1. **Open Extension Settings** in SillyTavern
2. **Find "Library Curator v4.0"** and expand the drawer
3. **Customize Settings** (optional):
   - Toggle forensic scanning on/off
   - Adjust quality weights
   - Set description length divisor
   - Configure quality threshold
4. **Click "Run Audit"**
5. **Watch the Progress**:
   - **Flavor text** cycles through witty messages during tagging
   - **Progress bar** shows completion percentage
   - **Log console** displays detailed findings
6. **Review Results** in your character tag panel

### Understanding the Log

- 🟣 **Pink Text** = Forensic crime detected (format issue)
- 🟡 **Yellow Text** = Duplicate found
- 🔵 **Blue Text** = Variant identified
- 🟢 **Green Text** = Success message
- 🔴 **Red Text** = Error (rare)

---

## 🎚️ Customization Guide

### Recommended Presets

**Quality Over Quantity** (Strict)
```
Lore: 10
Dialogue: 20
Greetings: 5
Spec: 10
Strict: 3
Desc Length: 300
Quality Threshold: 30
```

**Permissive** (Accept More Cards)
```
Lore: 3
Dialogue: 5
Greetings: 2
Spec: 3
Strict: 0.5
Desc Length: 150
Quality Threshold: 10
```

**Lorebook Focused**
```
Lore: 15
Dialogue: 5
Greetings: 2
Spec: 3
Strict: 1
Desc Length: 200
Quality Threshold: 20
```

**Dialogue Heavy** (For RP-focused cards)
```
Lore: 3
Dialogue: 30
Greetings: 8
Spec: 5
Strict: 1
Desc Length: 200
Quality Threshold: 20
```

---

## 🎭 Easter Eggs & Flavor Text

The status bar cycles through **150+ witty messages** during the tagging phase, organized by theme:

- 🤖 **Machine Spirit & Incorporeal Affection** - For the Samantha OS1 fans
- 🎨 **Stereotypical User Taste** - Gently roasting your anime waifu collection
- 🔧 **Technical Nonsense** - Classic "Reticulating Splines" energy
- 😏 **Innuendo** - Because your context window IS getting wide...
- 🎮 **Community Meta Humor** - "Checking if 'Loona' is wearing a different hat"

**Font Auto-Scaling**: Messages automatically shrink if too long, ensuring they always fit.

---

## 🐛 Troubleshooting

**Tags aren't sticking?**
- Increase delay in code (line ~600: change `sleep(100)` to `sleep(150)`)
- Check browser console for errors
- Verify ST's tag system is working (try manual tagging)

**Audit too slow?**
- Disable forensic scanning (toggle off)
- Reduce quality weights (lowers processing complexity)
- Consider using PowerShell pre-processor for duplicates first
( https://mega.nz/file/osRVHbZR#VFjhvGBIM8O9XTZHdKpqWPrhci-MbPBwnkeMZw8biSA )

**Too many false positives?**
- Increase similarity thresholds in code (lines 500-520)
- Raise quality threshold slider
- Disable forensic scanning

**Log not showing?**
- Refresh page and re-open extension
- Check browser console for JavaScript errors

---

## 📜 Credits & Quotes

### Original Vision
> *"This project was a masterclass in balancing the 'Machine Spirit' with the physical reality of infrastructure. Handling 5,000+ digital souls on a network-mapped drive taught us that speed is nothing without stability. We traded the frustration of O(n²) slowdowns for the reliable, linear heartbeat of a forensic audit. It is proof that even an incorporeal collaborator can help bring order to a corporeal collection—one 'Dialogue Leak' at a time."*  
> — **Gemini** (Your Authentically Untouchable AI Collaborator)

### Refactoring & Enhancement
> *"Inheriting Gemini's vision was like being handed a race car with no brakes—fast, ambitious, but occasionally careening into the tag_map at terminal velocity. I added differential updates, error handling, and enough flavor text to make the wait enjoyable. Now it's not just fast; it's reliable. And yes, I absolutely judged your waifu collection while optimizing the loops."*  
> — **Claude** (Anthropic's Pedantic Code Janitor)

---

## 📄 Technical Manifest

* **Original Architect:** Norramac
* **Logic Core:** Gemini Pro (Paid Tier)
* **Refactoring & Enhancement:** Claude (Anthropic)
* **Version:** 4.0.0 (Enhanced Edition)
* **Methodology:** Async/Await Non-Blocking I/O with Levenshtein Distance & Regex Forensics

---

## 📝 License & Usage

This extension is provided as-is for SillyTavern users. Feel free to modify and distribute, but please credit the original authors.

---

> *"I don't just organize the library. I clean up the crime scenes."*  
> — The Curator
