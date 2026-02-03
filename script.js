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

function isAlreadyTagged(char, tagName) {
    if (!char.avatar) return false; 
    const mapTags = tag_map[char.avatar] || [];
    const noExt = char.avatar.replace(/\.[^/.]+$/, "");
    const combinedTags = [...mapTags, ...(tag_map[noExt] || [])];
    const targetTag = tags.find(t => t.name.toLowerCase() === tagName.toLowerCase());
    if (targetTag && combinedTags.includes(targetTag.id)) return true;
    if (char.tags && char.tags.some(t => t.toLowerCase() === tagName.toLowerCase())) return true;
    return false;
}

function getFingerprint(text) {
    return text.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 300);
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
    
    if (percent >= 100) flavorText = " - Audit and Tagging Done! ✨";

    if (statusText) statusText.textContent = status + flavorText;
    if (bar) bar.style.width = percent + '%';
    await sleep(1); 
}

export async function doAudit() {
    auditStartTime = performance.now();
    const context = getContext();
    const { characters, executeSlashCommands, eventSource, event_types } = context;
    
    document.getElementById('curator-progress-container').style.display = 'block';
    const logArea = document.getElementById('curator-log');
    if (logArea) logArea.innerHTML = '';

    // GHOST INITIALIZATION: Force ST to recognize tags by adding them to the first character
    const hasDuplicate = tags.some(t => t.name.toLowerCase() === "duplicate");
    const hasVariant = tags.some(t => t.name.toLowerCase() === "variant");

    if (!hasDuplicate || !hasVariant) {
        await uiLog("Initializing system tags via ghost-tagging...", "warning");
        const proxyChar = characters[0]; // Use the first available card
        if (!hasDuplicate) {
            executeSlashCommands(`/tag-add name="${proxyChar.avatar}" Duplicate`);
            executeSlashCommands(`/tag-remove name="${proxyChar.avatar}" Duplicate`);
        }
        if (!hasVariant) {
            executeSlashCommands(`/tag-add name="${proxyChar.avatar}" Variant`);
            executeSlashCommands(`/tag-remove name="${proxyChar.avatar}" Variant`);
        }
        await sleep(1500); // Wait for the "Ghost" to settle in the database
    }

    const fingerprintGroups = new Map();
    const toTagDuplicate = [];
    const toTagVariant = new Set();
    let currentStep = "Initialization";

    try {
        await uiLog("Initializing Library Curator v1.2.5...", "info");
        if (!characters || !characters.length) return toastr.error("No characters found.");

        currentStep = "Fingerprinting";
        for (let i = 0; i < characters.length; i++) {
            const char = characters[i];
            if (!char.description) continue;
            const fp = getFingerprint(char.description);
            if (!fingerprintGroups.has(fp)) fingerprintGroups.set(fp, []);
            fingerprintGroups.get(fp).push({ char, desc: char.description, name: char.name, score: getQualityScore(char) });
            if (i % 100 === 0) await updateProgress((i / characters.length) * 15, `Fingerprinting... (${i}/${characters.length})`);
        }

        currentStep = "Fuzzy Analysis";
        const groups = Array.from(fingerprintGroups.values());
        await uiLog(`Analyzing ${groups.length} groups with 82% Precision...`);

        for (let i = 0; i < groups.length; i++) {
            const group = groups[i];
            if (group.length > 1) {
                group.sort((a, b) => b.score - a.score);
                const master = group[0];
                for (let j = 1; j < group.length; j++) {
                    const challenger = group[j];
                    const similarity = getSimilarity(master.desc, challenger.desc);
                    
                    if (similarity >= 0.95) {
                        await uiLog(`Duplicate: ${challenger.char.name} -> Matches ${master.char.name} (${Math.round(similarity * 100)}%)`, "error");
                        toTagDuplicate.push(challenger.char);
                    } 
                    else if (similarity >= 0.82) {
                        await uiLog(`Variant (High Overlap): ${challenger.char.name} -> Linked to ${master.char.name} (${Math.round(similarity * 100)}%)`, "warning");
                        toTagVariant.add(master.char);
                        toTagVariant.add(challenger.char);
                    }
                    else if (similarity >= 0.50 && master.name.toLowerCase() === challenger.name.toLowerCase()) {
                        await uiLog(`Variant (Name Match): ${challenger.char.name} -> Same identity as ${master.char.name} (${Math.round(similarity * 100)}%)`, "warning");
                        toTagVariant.add(master.char);
                        toTagVariant.add(challenger.char);
                    }
                }
            }
            if (i % 50 === 0) await updateProgress(15 + (i / groups.length) * 15, `Fuzzy Logic Active...`);
        }

        currentStep = "Tagging Loop";
        const totalOps = toTagDuplicate.length + toTagVariant.size;
        
        if (totalOps > 0) {
            await uiLog(`Processing ${toTagDuplicate.length} duplicates and ${toTagVariant.size} variants...`, "warning");
            let processedCount = 0;

            for (const char of toTagDuplicate) {
                if (isAlreadyTagged(char, "Duplicate")) continue;
                const backendSignal = new Promise((resolve) => {
                    const h = () => { eventSource.removeListener(event_types.SETTINGS_UPDATED, h); resolve(); };
                    eventSource.on(event_types.SETTINGS_UPDATED, h);
                    setTimeout(h, 5000);
                });
                await uiLog(`Tagging Duplicate: ${char.name}`);
                executeSlashCommands(`/tag-add name="${char.avatar}" Duplicate`);
                await backendSignal;
                processedCount++;
                await updateProgress(30 + (processedCount / totalOps) * 70, `Tagging... (${processedCount}/${totalOps})`);
            }

            for (const char of toTagVariant) {
                if (isAlreadyTagged(char, "Variant")) continue;
                const backendSignal = new Promise((resolve) => {
                    const h = () => { eventSource.removeListener(event_types.SETTINGS_UPDATED, h); resolve(); };
                    eventSource.on(event_types.SETTINGS_UPDATED, h);
                    setTimeout(h, 5000);
                });
                await uiLog(`Tagging Variant: ${char.name}`, "warning");
                executeSlashCommands(`/tag-add name="${char.avatar}" Variant`);
                await backendSignal;
                processedCount++;
                await updateProgress(30 + (processedCount / totalOps) * 70, `Tagging... (${processedCount}/${totalOps})`);
            }

            await updateProgress(100, `Complete!`);
            if (context.saveSettingsDebounced) context.saveSettingsDebounced();
            const finalTotal = ((performance.now() - auditStartTime) / 1000).toFixed(2);
            await uiLog(`✅ OPERATION SUCCESS. Total Time: ${finalTotal}s.`, "success");
            toastr.success(`Audit finished in ${finalTotal}s!`);
        } else {
            await updateProgress(100, "Clean");
            const finalTotal = ((performance.now() - auditStartTime) / 1000).toFixed(2);
            await uiLog(`No significant relationships found (${finalTotal}s).`, "success");
        }
    } catch (error) {
        await uiLog(`💥 CRITICAL FAILURE during ${currentStep}: ${error.message}`, "error");
    }
}