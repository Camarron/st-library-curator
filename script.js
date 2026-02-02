import getContext from "/scripts/st-context.js";
import { tags, tag_map } from "/scripts/tags.js";

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

let auditStartTime = 0;

function getTimestamp() {
    if (auditStartTime === 0) return "[0.00s]";
    const elapsed = (performance.now() - auditStartTime) / 1000;
    return `[+${elapsed.toFixed(2)}s]`;
}

async function uiLog(message, type = "info") {
    const ts = getTimestamp();
    console.log(`[CURATOR] ${ts} ${message}`);
    const logArea = document.getElementById('curator-log');
    if (logArea) {
        const entry = document.createElement('div');
        entry.textContent = `> ${ts} ${message}`;
        entry.style.flexShrink = "0";
        entry.style.minHeight = "fit-content";
        entry.style.borderBottom = "1px solid #ffffff11";
        entry.style.padding = "2px 0";
        if (type === "error") { entry.style.color = "#ff6b6b"; entry.style.fontWeight = "bold"; }
        else if (type === "success") { entry.style.color = "#51cf66"; }
        else if (type === "warning") { entry.style.color = "#fcc419"; }
        logArea.prepend(entry);
        await sleep(1); 
    }
}

function getDuplicateTagId() {
    if (!tags) return null;
    return tags.find(t => t.name.toLowerCase() === "duplicate")?.id || null;
}

function isAlreadyTagged(char, duplicateId) {
    if (!duplicateId || !char.avatar) return false; 
    const mapTags = tag_map[char.avatar] || [];
    const noExt = char.avatar.replace(/\.[^/.]+$/, "");
    const combinedTags = [...mapTags, ...(tag_map[noExt] || [])];
    if (combinedTags.includes(duplicateId)) return true;
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

function getQualityScore(char) {
    let score = 0;
    if (char.description) score += Math.floor(char.description.length / 100);
    if (char.character_book?.entries) score += 5;
    if (char.mes_example?.length > 500) score += 10;
    return score;
}

async function updateProgress(percent, status) {
    const bar = document.getElementById('curator-progress-bar');
    const statusText = document.getElementById('curator-status');
    let flavorText = "";
    const totalNum = parseInt(status.match(/\/(\d+)/)?.[1]) || 0;
    if (totalNum === 69) flavorText = " 🕶️ Nice.";
    else if (totalNum > 1000) flavorText = " 📚 Librarian's Nightmare.";
    if (percent >= 100) flavorText = "- Audit and Tagging Done! ✨";

    if (statusText) statusText.textContent = status + flavorText;
    if (bar) bar.style.width = percent + '%';
    await sleep(1); 
}

export async function doAudit() {
    auditStartTime = performance.now();
    const context = getContext();
    const { characters, executeSlashCommands, eventSource, event_types } = context;

    const progressContainer = document.getElementById('curator-progress-container');
    if (progressContainer) progressContainer.style.display = 'block';

    let currentStep = "Initialization";
    try {
        const logArea = document.getElementById('curator-log');
        if (logArea) logArea.innerHTML = '';
        await uiLog("Initializing Library Curator...", "info");

        if (!characters || !characters.length) return toastr.error("No characters found.");
        
        const duplicateId = getDuplicateTagId();
        const fingerprintGroups = new Map();
        const toTag = [];
        const total = characters.length;
        await uiLog(`Library Check: ${total} cards indexed.`);

        currentStep = "Fingerprinting";
        for (let i = 0; i < total; i++) {
            const char = characters[i];
            const desc = char.description?.trim();
            if (!desc || !char.name) continue;
            const fingerprint = getFingerprint(desc);
            if (!fingerprintGroups.has(fingerprint)) fingerprintGroups.set(fingerprint, []);
            fingerprintGroups.get(fingerprint).push({ char, desc, name: char.name.toLowerCase(), score: getQualityScore(char) });
            if (i % 100 === 0) await updateProgress((i / total) * 15, `Fingerprinting... (${i}/${total})`);
        }

        currentStep = "Fuzzy Analysis";
        let analyzedGroups = 0;
        const groups = Array.from(fingerprintGroups.values());
        await uiLog(`Grouping complete. Analyzing ${groups.length} unique groups...`);

        for (const group of groups) {
            if (group.length > 1) {
                group.sort((a, b) => b.score - a.score);
                const master = group[0];
                for (let j = 1; j < group.length; j++) {
                    const challenger = group[j];
                    const similarity = getSimilarity(master.desc, challenger.desc);
                    if (similarity > 0.90 || (master.name === challenger.name && similarity > 0.40)) {
                        toTag.push(challenger.char);
                    }
                }
            }
            analyzedGroups++;
            if (analyzedGroups % 50 === 0) {
                await updateProgress(15 + (analyzedGroups / groups.length) * 15, `Fuzzy Logic Active...`);
            }
        }

        currentStep = "Tagging Loop";
        if (toTag.length > 0) {
            await uiLog(`Targeting ${toTag.length} potential duplicates.`, "warning");
            
            let skippedCount = 0, taggedCount = 0, errorCount = 0;

            for (let i = 0; i < toTag.length; i++) {
                const char = toTag[i];
                try {
                    if (isAlreadyTagged(char, duplicateId)) {
                        skippedCount++;
                        await uiLog(`Already Tagged: ${char.name} (${i + 1}/${toTag.length})`, "warning");
                        continue;
                    }

                    const backendSignal = new Promise((resolve) => {
                        const handler = () => {
                            eventSource.removeListener(event_types.SETTINGS_UPDATED, handler); // FIXED METHOD NAME
                            resolve('success');
                        };
                        eventSource.on(event_types.SETTINGS_UPDATED, handler);
                        setTimeout(() => {
                            eventSource.removeListener(event_types.SETTINGS_UPDATED, handler); // FIXED METHOD NAME
                            resolve('timeout');
                        }, 5000);
                    });

                    await uiLog(`[${i+1}/${toTag.length}] Tagging: ${char.name}...`);
                    
                    if (char.avatar) {
                        executeSlashCommands(`/tag-add name="${char.avatar}" Duplicate`);
                    } else {
                        throw new Error("Missing avatar data");
                    }
                    
                    const result = await backendSignal;
                    if (result === 'timeout') {
                        await uiLog(`⚠️ Card ${char.name} timed out, moving to next.`, "warning");
                    }
                    
                    taggedCount++;
                    const tagProgress = 30 + ((i + 1) / toTag.length) * 70;
                    await updateProgress(tagProgress, `Tagging character... (${i + 1}/${toTag.length})`);
                    
                } catch (e) {
                    errorCount++;
                    await uiLog(`❌ FAILED ${char.name || 'Unknown'}: ${e.message}`, "error");
                }
            }

            await updateProgress(100, `Complete!`);
            const finalTotal = ((performance.now() - auditStartTime) / 1000).toFixed(2);
            await uiLog(`✅ OPERATION SUCCESS. Total Time: ${finalTotal}s.`, "success");
            await uiLog(`Summary - Tagged: ${taggedCount} | Skipped: ${skippedCount} | Errors: ${errorCount}`);
            toastr.success(`Audit finished in ${finalTotal}s!`);
        } else {
            await updateProgress(100, "Clean");
            const finalTotal = ((performance.now() - auditStartTime) / 1000).toFixed(2);
            await uiLog(`No duplicates found (${finalTotal}s).`, "success");
        }
    } catch (error) {
        await uiLog(`💥 CRITICAL FAILURE during ${currentStep}: ${error.message}`, "error");
    }
}