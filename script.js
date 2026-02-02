import getContext from "/scripts/st-context.js";
import { tags, tag_map } from "/scripts/tags.js";

// Minimal sleep to let the UI breathe
const sleep = (ms) => new Promise(res => setTimeout(res, ms));

// --- ENHANCED LOGGER ---
function uiLog(message, type = "info") {
    console.log(`[CURATOR] ${message}`);
    const logArea = document.getElementById('curator-log');
    if (logArea) {
        const entry = document.createElement('div');
        entry.textContent = `> ${message}`;
        entry.style.borderBottom = "1px solid #ffffff22";
        entry.style.padding = "2px 0";
        
        if (type === "error") {
            entry.style.color = "#ff6b6b";
            entry.style.fontWeight = "bold";
        } else if (type === "success") {
            entry.style.color = "#51cf66";
        } else if (type === "warning") {
            entry.style.color = "#fcc419";
        }
        
        logArea.prepend(entry);
    }
}

function getDuplicateTagId() {
    if (!tags) return null;
    const match = tags.find(t => t.name.toLowerCase() === "duplicate");
    return match ? match.id : null;
}

function isAlreadyTagged(char, duplicateId) {
    if (!duplicateId) return false; 
    const mapTags = tag_map[char.avatar] || [];
    if (mapTags.includes(duplicateId)) return true;
    
    const noExt = char.avatar.replace(/\.[^/.]+$/, "");
    if ((tag_map[noExt] || []).includes(duplicateId)) return true;

    if (char.tags && char.tags.some(t => t.toLowerCase() === "duplicate")) return true;
    return false;
}

function getFingerprint(text) {
    return text.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 100);
}

function getSimilarity(s1, s2) {
    let longer = s1.length < s2.length ? s2 : s1;
    let shorter = s1.length < s2.length ? s1 : s2;
    if (longer.length === 0) return 1.0;
    const costs = [];
    for (let i = 0; i <= s1.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= s2.length; j++) {
            if (i === 0) costs[j] = j;
            else if (j > 0) {
                let newValue = costs[j - 1];
                if (s1.charAt(i - 1) !== s2.charAt(j - 1))
                    newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                costs[j - 1] = lastValue;
                lastValue = newValue;
            }
        }
        if (i > 0) costs[s2.length] = lastValue;
    }
    return (longer.length - costs[s2.length]) / parseFloat(longer.length);
}

// --- RESTORED FLAVOR TEXT ---
async function updateProgress(percent, status) {
    const container = document.getElementById('curator-progress-container');
    const bar = document.getElementById('curator-progress-bar');
    const statusText = document.getElementById('curator-status');

    let flavorText = "";
    
    // Extract the denominator number from "Grouping... (50/100)"
    const totalNum = parseInt(status.match(/\/(\d+)/)?.[1]) || 0;

    if (totalNum === 69) flavorText = " 🕶️ Nice.";
    else if (totalNum > 1000) flavorText = " 📚 Librarian's Nightmare.";

    if (percent > 99) flavorText = " ✨ Clean as a whistle!";

    if (container) container.style.display = 'block';
    if (statusText) statusText.textContent = status + flavorText;
    if (bar) bar.style.width = percent + '%';
    
    await sleep(10); 
}

function getQualityScore(char) {
    let score = 0;
    if (char.description) score += Math.floor(char.description.length / 100);
    if (char.character_book?.entries) score += 5;
    if (char.mes_example?.length > 500) score += 10;
    return score;
}

export async function doAudit() {
    const context = getContext();
    const characters = context.characters;
    const executeSlashCommands = context.executeSlashCommands;
    const eventSource = context.eventSource;
    const event_types = context.event_types;

    let currentStep = "Initialization";
    try {
        const logArea = document.getElementById('curator-log');
        if (logArea) logArea.innerHTML = '';
        uiLog("Initializing Turbo Librarian...", "info");

        if (!characters.length) {
            uiLog("CRITICAL: No characters found in library.", "error");
            return toastr.error("No characters found.");
        }
        
        const duplicateId = getDuplicateTagId();
        if (duplicateId) {
            uiLog(`System Check: 'Duplicate' tag ID resolved.`, "success");
        } else {
            uiLog("WARNING: 'Duplicate' tag not defined in system.", "warning");
        }

        const fingerprintGroups = new Map();
        const toTag = [];
        const total = characters.length;
        uiLog(`Library Size: ${total} cards.`);

        currentStep = "Fingerprinting/Grouping";
        for (let i = 0; i < total; i++) {
            const char = characters[i];
            const desc = char.description?.trim();
            const name = char.name?.trim().toLowerCase();
            if (!desc || !name) continue;

            const fingerprint = getFingerprint(desc);
            if (!fingerprintGroups.has(fingerprint)) fingerprintGroups.set(fingerprint, []);
            fingerprintGroups.get(fingerprint).push({ char, desc, name, score: getQualityScore(char) });

            if (i % 100 === 0) await updateProgress((i / total) * 15, `Grouping... (${i}/${total})`);
        }

        currentStep = "Fuzzy Analysis";
        let analyzed = 0;
        const groups = Array.from(fingerprintGroups.values());
        
        uiLog(`Grouping complete. Analyzing ${groups.length} unique fingerprints...`);

        for (const group of groups) {
            if (group.length > 1) {
                group.sort((a, b) => b.score - a.score);
                const master = group[0];
                for (let j = 1; j < group.length; j++) {
                    const challenger = group[j];
                    const similarity = getSimilarity(master.desc, challenger.desc);
                    const sameName = (master.name === challenger.name);
                    
                    if (similarity > 0.90 || (sameName && similarity > 0.40)) {
                        toTag.push(challenger.char);
                    }
                }
            }
            analyzed++;
            if (analyzed % 50 === 0) await updateProgress(15 + (analyzed / groups.length) * 15, `Analyzing matches...`);
        }

        currentStep = "Tagging Loop";
        if (toTag.length > 0) {
            uiLog(`Analysis Complete. Found ${toTag.length} potential duplicates.`);
            uiLog("Starting TURBO tagging process...");
            
            let skippedCount = 0;
            let taggedCount = 0;

            for (let i = 0; i < toTag.length; i++) {
                const char = toTag[i];
                
                if (isAlreadyTagged(char, duplicateId)) {
                    skippedCount++;
                    uiLog(`Skipped: ${char.name}`, "warning");
                    await updateProgress(30 + ((i / toTag.length) * 70), `Skipping... (${i + 1}/${toTag.length})`);
                    continue; 
                }

                await executeSlashCommands(`/tag-add name="${char.avatar}" Duplicate`);
                taggedCount++;
                uiLog(`Tagged: ${char.name}`, "success");
                
                // Turbo Sleep: 50ms
                await sleep(50); 
                
                await updateProgress(30 + ((i / toTag.length) * 70), `Tagging... (${i + 1}/${toTag.length})`);
            }

            if (eventSource && event_types) {
                eventSource.emit(event_types.CHARACTER_EDITED);
            }
            
            uiLog(`Audit Finished. Tagged: ${taggedCount} | Skipped: ${skippedCount}`, "success");
            toastr.success(`Audit finished!`);
        } else {
            uiLog("No new duplicates found. Library is clean.", "success");
            toastr.success("No new duplicates found.");
        }
    } catch (error) {
        uiLog(`CRITICAL FAILURE during ${currentStep}`, "error");
        uiLog(`Error: ${error.message}`, "error");
        console.error(`[CURATOR ERROR]`, error);
        toastr.error(`Audit failed.`);
    }
}