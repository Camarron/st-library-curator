import { characters, saveCharacterDebounced, eventSource, event_types } from "../../../../script.js";
import { executeSlashCommands } from "../../../slash-commands.js";

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

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

async function updateProgress(percent, status, logMessage = null) {
    const container = document.getElementById('curator-progress-container');
    const bar = document.getElementById('curator-progress-bar');
    const statusText = document.getElementById('curator-status');
    const logArea = document.getElementById('curator-log');

    let flavorText = "";
    const totalNum = parseInt(status.match(/\/(\d+)/)?.[1]) || 0;

    if (totalNum === 69) flavorText = " 😎 Nice.";
    else if (totalNum === 420 || totalNum === 4200) flavorText = " 🌿 Blaze it.";
    else if (totalNum === 666) flavorText = " 🤘 Metal.";
    else if (totalNum === 777) flavorText = " 🎰 Jackpot!";
    else if (totalNum > 1000) flavorText = " 💀 Librarian's Nightmare.";

    if (percent > 99) flavorText = " 🎉 Clean as a whistle!";

    if (container) container.style.display = 'block';
    if (statusText) statusText.textContent = status + flavorText;
    if (bar) bar.style.width = percent + '%';

    if (logMessage && logArea) {
        const entry = document.createElement('div');
        entry.textContent = `> ${logMessage}`;
        logArea.prepend(entry);
    }
    await sleep(10); 
}

function getQualityScore(char) {
    const w = {
        lore: parseInt($('#curator-weight-lore').val()) || 5,
        dialogue: parseInt($('#curator-weight-dialogue').val()) || 10,
        greetings: parseInt($('#curator-weight-greetings').val()) || 3,
        spec: parseInt($('#curator-weight-spec').val()) || 5
    };
    let score = 0;
    if (char.description) score += Math.floor(char.description.length / 100);
    if (char.character_book?.entries) {
        const loreText = char.character_book.entries.map(e => e.content || "").join("");
        score += Math.floor(loreText.length / 1000) * w.lore;
    }
    if (char.mes_example?.length > 500) score += w.dialogue;
    if (Array.isArray(char.alternate_greetings)) score += (char.alternate_greetings.length * w.greetings);
    if (char.spec === "chara_card_v3") score += w.spec;
    return score;
}

export async function doAudit() {
    let currentStep = "Initialization";
    try {
        if (!characters.length) return toastr.error("No characters found.");
        const logArea = document.getElementById('curator-log');
        if (logArea) logArea.innerHTML = '';
        
        const fingerprintGroups = new Map();
        const toTag = [];
        const total = characters.length;

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

        currentStep = "Tagging/Heartbeat Loop";
        if (toTag.length > 0) {
            for (let i = 0; i < toTag.length; i++) {
                const char = toTag[i];
                if (!char.tags?.includes('Duplicate')) {
                    await executeSlashCommands(`/tag-add name="${char.avatar}" Duplicate`);
                    await sleep(2000); 
                }
                const progress = 30 + ((i / toTag.length) * 70);
                await updateProgress(progress, `Tagging... (${i + 1}/${toTag.length})`, `Matched: ${char.name}`);
            }
            currentStep = "Finalizing Changes";
            saveCharacterDebounced();
            eventSource.emit(event_types.CHARACTER_EDITED);
            toastr.success(`Audit finished! Tagged ${toTag.length} duplicates.`);
        } else {
            toastr.success("No new duplicates found.");
        }
    } catch (error) {
        console.error(`%c [CURATOR ERROR] Failure during: ${currentStep} `, "background: #800; color: #fff; font-weight: bold; padding: 5px;");
        console.error("Error Message:", error.message);
        console.error("Full Trace:", error.stack);
        toastr.error(`Audit failed during ${currentStep}. Check console for details.`);
    }
}