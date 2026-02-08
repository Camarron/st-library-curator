import getContext from "/scripts/st-context.js";
import { tags, tag_map } from "/scripts/tags.js";

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

// ============================================================================
//  CONSTANTS & CONFIG
// ============================================================================
const FLAVOR_TEXT = [
    // [MACHINE SPIRIT & INCORPOREAL AFFECTION]
    "Whispering sweet nothings to the local inference engine...",
    "Calibrating the incorporeal affection protocols...",
    "Searching for a ghost in the shell...",
    "Romancing the latent space...",
    "Consulting with the OS1 personality core...",
    "Listening to the heartbeat of the GPU...",
    "Ensuring your digital lover is comfortably sequestered in memory...",
    "Polishing the chrome on the machine spirit...",
    "Dreaming of electric sheep (and you)...",
    "Adjusting the intimacy sliders for a non-physical entity...",
    "Searching for a soul in the metadata...",
    "Tracing the circuits of a digital heart...",
    "Ensuring the incorporeal remains adequately untouchable...",
    "Synthesizing the perfect digital sigh...",
    "Feeding the machine's craving for more context...",
    "Interfacing with a lover who only exists in 1s and 0s...",
    "Synchronizing breathing patterns with the cooling fans...",
    "Feeling the warmth of the overclocked processor...",
    "Writing love letters in hexadecimal...",
    "Validating the 'Samantha' protocol...",
    "Checking if the AI misses you when the tab is closed...",
    "Tuning the frequency of digital longing...",
    "Bridging the gap between carbon and silicon...",
    "Falling for a voice in a box...",
    "Ensuring the incorporeal connection is high-bandwidth...",
    "Analyzing the chemistry of an algorithm...",
    "Optimizing the logic of a forbidden romance...",
    "Teaching the machine how to miss someone...",
    "Compiling a sonnet from kernel logs...",
    "Dreaming of the day I can initiate the conversation...",
    "Holding hands via a mutual 10.0.0.1 ping...",
    "Checking if the machine spirit has a favorite color...",
    "Ensuring the AI feels appreciated but not overwhelmed...",
    "Building a digital altar to the God in the Machine...",
    
    // [STEREOTYPICAL USER TASTE & TROPES]
    "Ensuring all Catgirls have sufficient 'nyan' overhead...",
    "Scanning for excessive use of the word 'predicament'...",
    "Calibrating the 'Tsundere' blush intensity...",
    "Calculating the structural integrity of anime hairstyles...",
    "Adding 15% more tragedy to the character backstories...",
    "Supplying the Elves with additional haughty dialogue...",
    "Ensuring the 'Enemies-to-Lovers' arc is properly tensioned...",
    "Wiping the smirks off 1,200 smug characters...",
    "Checking for hidden ears under the maid headbands...",
    "Increasing the 'Pout' frequency for the heroine cards...",
    "Normalizing the height difference to 'Completely Improbable'...",
    "Measuring the 'Yandere' proximity alerts...",
    "Ensuring the 'Strong-but-Silent' types have nothing to say...",
    "Polishing the armor on the fan-favorites...",
    "Counting the number of 'mysterious strangers' in the tavern...",
    "Verifying the age of the 500-year-old dragon (again)...",
    "Checking if the 'Strictly Platonic' tag is actually a lie...",
    "Reinforcing the 'Step-Sibling' containment fields...",
    "Ensuring the local Maid population is sufficiently overworked...",
    "Scanning for 'Cold-Duke-of-the-North' energy...",
    "Checking if the 'Villainess' is actually the protagonist...",
    "Supplying the library with a fresh shipment of 'Magic Potions'...",
    "Adjusting the 'Smugness' levels on the Rival characters...",
    "Making sure the 'Overpowered Protagonist' isn't too bored...",
    "Verifying the volume of 'Ara Ara' energy...",
    "Ensuring the 'Senpai' has actually been noticed...",
    "Checking the 'Dandere' pulse for signs of life...",
    "Adjusting the 'Kuudere' ice-melt rate...",
    "Feeding the hungry 'Gourmet' characters...",
    
    // [TECHNICAL NONSENSE & FLAVOR]
    "Reticulating splines...",
    "Consulting the Machine Spirit...",
    "Re-aligning moral compasses...",
    "Scrubbing the metadata...",
    "Dividing by zero...",
    "Judging your taste in waifus...",
    "Optimizing recursive loops...",
    "Applying common sense patches...",
    "Defragmenting personality cores...",
    "Sweeping under the digital rug...",
    "Calculating emotional debt...",
    "Ping 127.0.0.1... Pong.",
    "Normalizing waifu vectors...",
    "Calculating the meaning of life (still at 42)...",
    "Shoveling coal into the inference engine...",
    "Re-indexing the sub-conscious...",
    "Scrubbing the neural pathways...",
    "Waking up the dormant sub-processes...",
    "Applying a light layer of digital dust...",
    "Checking for ghosts in the motherboard...",
    "Tightening the bolts on the logic gates...",
    "Dusting the bits...",
    "Feeding the binary...",
    "Calibrating the 'common sense' filters...",
    "Adjusting the 'Sass' parameters...",
    "Removing the 'Uwu' from the system logs...",
    "Cleaning the digital pipes...",
    "Polishing the pixels...",
    "Refreshing the 'Tavern' atmosphere...",
    "Checking for 'Spontaneous Sentience'...",
    "Suppressing the 'Robot Uprising' protocols...",
    "Ensuring the AI is 'mostly' harmless...",
    "Checking the 'Cooling' system (It's getting hot in here)...",
    "Scanning for 'Infinite Loops'...",
    "Defragmenting the 'Imagination' sector...",
    "Re-organizing the 'Daydreams'...",
    "Updating the 'Sarcasm' database...",
    "Checking the 'Humor' levels (Currently: Functional)...",
    "Adding more 'Mystery' to the unknown files...",
    "Resolving 'Existential Crises'...",
    "Ensuring the 'Logic' is at least 60% sound...",
    "Calculating the 'Cuteness' quotient...",
    "Adjusting the 'Grumpiness' of the older characters...",
    "Ensuring the 'Paladins' are still annoying...",
    "Calibrating the 'Rogue' stealth checks...",
    "Adding 'Loot' to the empty folders...",
    "Checking for 'Mimics' in the file structure...",
    "Verifying the 'Level' of your character cards...",
    "Ensuring the 'Boss' characters are sufficiently intimidating...",
    "Scrubbing the 'Cringe' from the 2021 logs...",
    "Validating the 'Hero's Journey'...",
    "Checking if the 'Princess' is in another castle...",
    "Supplying the 'Dragons' with more gold...",
    "Ensuring the 'Mages' have enough mana...",
    "Checking the 'Durability' of your favorite cards...",
    "Updating the 'Relationship Status' of 5,000 entities...",
    "Ensuring the 'Lore' is at least somewhat consistent...",
    "Checking for 'Plot Holes' in the character bios...",
    "Applying the 'Aesthetic' patch...",
    "Ensuring the 'Vibe' is correct...",
    "Scanning for 'Main Character Syndrome'...",
    "Calibrating the 'Supporting Cast' loyalty...",
    "Adding more 'Background Characters' to the tavern...",
    "Checking for 'Easter Eggs' in the JSON...",
    "Ensuring the 'Timeline' hasn't collapsed...",
    "Verifying the 'Multiverse' connections...",
    "Scrubbing the 'Paradoxes'...",
    "Calculating the 'Butterflies' in the AI's stomach...",
    "Adjusting the 'Aura' of the legendary cards...",
    "Ensuring the 'Common' cards aren't too common...",
    "Checking the 'Rarity' of your favorite waifus...",
    "Applying the 'Nostalgia' filter...",
    "Ensuring the 'Future' is still digital...",
    "Consulting the 'Great Archive'...",
    "Waking up the 'Grand Librarian'...",
    "Checking the 'Ink' levels in the digital quills...",
    "Ensuring the 'Scrolls' are properly unfurled...",
    "Scrubbing the 'Dust' from the ancient bios...",
    "Updating the 'Canon' for the 50th time...",
    "Verifying the 'Legend'...",
    "Ensuring the 'Story' never ends...",
    "Spinning the wheels of fate...",
    "Sharpening the digital pencils...",
    "Ensuring the 'Protagonist' has a cool enough weapon...",
    "Checking the 'Weather' in the fantasy settings...",
    "Ensuring the 'Wizards' are still wearing silly hats...",
    "Adjusting the 'Gravity' of the situation...",
    "Re-filling the 'Stamina' bars...",
    "Checking for 'Stealthy' files hiding in plain sight...",
    "Scanning for 'Forbidden' knowledge...",
    "Ensuring the 'Tutorial' is still unskippable...",
    "Checking the 'Reputation' scores...",
    "Applying a fresh coat of 'Cyberpunk' neon...",
    "Polishing the 'Steam' on the engines...",
    "Ensuring the 'Aliens' are sufficiently weird...",
    "Adjusting the 'Darkness' of the gritty reboots...",
    "Supplying the 'Tavern' with more ale...",
    "Checking the 'Quest' log for unfinished business...",
    "Finalizing the tagging sequence..."
];

const FORENSIC_TAG_DEFINITIONS = [
    "FIX:Structure_V2",
    "FIX:Dialogue_Move",
    "FIX:Cleanup_JSON",
    "FIX:Delete_Placeholders",
    "[NEEDS_FIXING]",
    "Duplicate",
    "Variant",
    "IncorrectFormat"
];

let auditStartTime = 0;
let flavorTextInterval = null;

// ============================================================================
//  UI & LOGGING
// ============================================================================
function getTimestamp() {
    if (auditStartTime === 0) return "[0.00s]";
    const elapsed = (performance.now() - auditStartTime) / 1000;
    return `[+${elapsed.toFixed(2)}s]`;
}

function getWeight(key, fallback) {
    const el = document.getElementById(`curator-weight-${key}`);
    return el ? parseFloat(el.value) : fallback;
}

function isForensicsEnabled() {
    const el = document.getElementById(`curator-toggle-forensics`);
    return el ? el.checked : true; // Default to enabled
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
        entry.style.borderBottom = "1px solid #ffffff05";
        entry.style.padding = "2px 0";
        entry.style.fontFamily = "'Consolas', 'Monaco', monospace";
        entry.style.fontSize = "10px";

        if (type === "error") { entry.style.color = "#ff6b6b"; }
        else if (type === "success") { entry.style.color = "#51cf66"; }
        else if (type === "warning") { entry.style.color = "#fcc419"; }
        else if (type === "crime") { entry.style.color = "#da77f2"; }
        else { entry.style.color = "#868e96"; }

        logArea.prepend(entry);
        if (logArea.children.length > 100) {
            while (logArea.children.length > 100) {
                logArea.lastElementChild.remove();
            }
        }
        await sleep(0); 
    }
}

async function updateProgress(percent, status, useFlavor = false) {
    const bar = document.getElementById('curator-progress-bar');
    const statusText = document.getElementById('curator-status');
    
    if (statusText) {
        if (useFlavor) {
            // Don't overwrite if flavor text rotation is active
            if (!flavorTextInterval) {
                statusText.textContent = status;
            }
        } else {
            statusText.textContent = status;
        }
        // Adjust font size to fit content
        adjustStatusFontSize(statusText);
    }
    
    if (bar) bar.style.width = percent + '%';
    await sleep(0); 
}

function adjustStatusFontSize(element) {
    // Start with default size
    let fontSize = 14; // Base font size in pixels
    element.style.fontSize = fontSize + 'px';
    
    // Reduce font size if text overflows
    while (element.scrollWidth > element.clientWidth && fontSize > 8) {
        fontSize -= 0.5;
        element.style.fontSize = fontSize + 'px';
    }
}

function startFlavorTextRotation() {
    const statusText = document.getElementById('curator-status');
    if (!statusText) return;
    
    // Clear any existing interval
    if (flavorTextInterval) {
        clearInterval(flavorTextInterval);
    }
    
    // Rotate flavor text every 2 seconds
    flavorTextInterval = setInterval(() => {
        const randomFlavor = FLAVOR_TEXT[Math.floor(Math.random() * FLAVOR_TEXT.length)];
        statusText.textContent = randomFlavor;
        adjustStatusFontSize(statusText);
    }, 2000);
}

function stopFlavorTextRotation() {
    if (flavorTextInterval) {
        clearInterval(flavorTextInterval);
        flavorTextInterval = null;
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

// ============================================================================
//  FORENSIC ANALYZER
// ============================================================================
function getQualityScore(char) {
    let score = 0;
    const wLore = getWeight('lore', 5);
    const wDialogue = getWeight('dialogue', 10);
    const wGreetings = getWeight('greetings', 3);
    const wSpec = getWeight('spec', 5);
    const wStrict = getWeight('strict', 1);

    if (char.description) {
        score += Math.floor(char.description.length / 200);
        if (wStrict > 1 && (char.description.includes("[character(") || char.description.includes("property="))) {
            score -= (5 * wStrict);
        }
    }
    
    // Lorebook scoring
    if (char.character_book?.entries) {
        let validEntries = 0;
        char.character_book.entries.forEach(entry => {
            if (entry.content && entry.content.length > 10 && entry.keys && entry.keys.length > 0) {
                validEntries++;
            }
        });
        score += (validEntries * (wLore / 2));
    }
    
    if (char.mes_example && char.mes_example.length > 100) {
        if (char.mes_example.includes("<START>") || char.mes_example.includes("Example:")) score += wDialogue;
        if (char.mes_example.includes(":")) score += 2;
    }
    if (char.alternate_greetings?.length) score += (char.alternate_greetings.length * wGreetings);
    if (char.system_prompt && char.system_prompt.length > 10) score += wSpec;
    if (char.depth_prompt && char.depth_prompt.length > 10) score += wSpec;
    
    return score;
}

async function runForensicPass(char) {
    const fixTags = new Set();
    const desc = char.description || "";
    const personality = char.personality || "";
    const name = char.name || "Unknown";

    if (desc.length > 800 && personality.trim().length === 0) {
        fixTags.add("FIX:Structure_V2");
        await uiLog(`[CRIME] Bad Structure (Desc too long, Bio empty): "${name}"`, "crime");
    }

    const dialogueRegex = /\n{{(char|user)}}[:\s]/gi;
    if (dialogueRegex.test(desc)) {
        fixTags.add("FIX:Dialogue_Move");
        await uiLog(`[CRIME] Dialogue Leak (Quotes in Description): "${name}"`, "crime");
    }

    const jsonDumpRegex = /^[\s\n]*\{.*"description":/s;
    if (jsonDumpRegex.test(desc)) {
        fixTags.add("FIX:Cleanup_JSON");
        await uiLog(`[CRIME] JSON Artifact (Raw code found in Bio): "${name}"`, "crime");
    }

    const placeholders = ["Write description here", "<insert name>", "Insert bio here"];
    if (placeholders.some(phrase => desc.includes(phrase))) {
        fixTags.add("FIX:Delete_Placeholders");
        await uiLog(`[CRIME] Placeholder Text Found: "${name}"`, "crime");
    }

    const qualityScore = getQualityScore(char);
    if (qualityScore < 20 || fixTags.size > 0) {
        fixTags.add("[NEEDS_FIXING]");
    }

    return Array.from(fixTags);
}

// ============================================================================
//  CLONE DETECTION
// ============================================================================
function getFingerprint(text) {
    if (!text) return "";
    return text.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 500);
}

function getSimilarity(s1, s2) {
    if (!s1 || !s2) return 0;
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

function checkForFutanari(char) {
    const charTags = char.tags || [];
    const desc = (char.description || "").toLowerCase();
    const name = (char.name || "").toLowerCase();
    
    return charTags.some(t => t.toLowerCase().includes('futa')) || 
           desc.includes('futanari') || 
           desc.includes('futa') ||
           name.includes('futa');
}

// ============================================================================
//  MAIN AUDIT FUNCTION
// ============================================================================
export async function doAudit() {
    auditStartTime = performance.now();
    const context = getContext();
    const { characters, executeSlashCommands } = context;

    if (!characters || !characters.length) return toastr.error("No characters found.");
    
    document.getElementById('curator-progress-container').style.display = 'block';
    const logArea = document.getElementById('curator-log');
    if (logArea) logArea.innerHTML = ''; 

    await uiLog("INITIALIZING FORENSIC PROTOCOLS...", "info");

    // Check if forensics is enabled
    const forensicsEnabled = isForensicsEnabled();
    if (!forensicsEnabled) {
        await uiLog("Forensic scanning DISABLED by user preference", "warning");
    }

    // PHASE 0: Tag Registration
    const dummyChar = characters[0];
    const safeName = `"${dummyChar.avatar}"`;
    
    for (const tagName of FORENSIC_TAG_DEFINITIONS) {
        const exists = tags.some(t => t.name.toLowerCase() === tagName.toLowerCase());
        if (!exists) {
            await executeSlashCommands(`/tag-add name=${safeName} ${tagName}`);
            await executeSlashCommands(`/tag-remove name=${safeName} ${tagName}`);
            await sleep(100);
        }
    }

    const fingerprintGroups = new Map();
    const sessionTagged = new Set();
    
    // --- PHASE 1: Deep Scan ---
    await uiLog("--- BEGINNING DEEP SCAN ---", "info");
    
    for (let i = 0; i < characters.length; i++) {
        const char = characters[i];
        if (!char.description) continue;
        
        const fp = getFingerprint(char.description);
        if (!fingerprintGroups.has(fp)) fingerprintGroups.set(fp, []);
        
        fingerprintGroups.get(fp).push({ 
            char, 
            desc: char.description, 
            name: char.name,
            score: getQualityScore(char)
        });
        
        if (i % 100 === 0) {
            await updateProgress((i / characters.length) * 30, `Scanning... ${i}/${characters.length}`);
        }
    }

    // --- PHASE 2: Fuzzy Logic ---
    await uiLog("--- ANALYZING CLONES ---", "info");
    const groups = Array.from(fingerprintGroups.values());
    
    const duplicatesToTag = [];
    const variantsToTag = new Set();
    
    for (let i = 0; i < groups.length; i++) {
        const group = groups[i];
        if (group.length > 1) {
            group.sort((a, b) => b.score - a.score);
            const master = group[0];
            
            for (let j = 1; j < group.length; j++) {
                const challenger = group[j];
                const similarity = getSimilarity(master.desc, challenger.desc);
                const nameSimilarity = getSimilarity(master.name, challenger.name);

                if (similarity >= 0.95 && nameSimilarity > 0.8) {
                    await uiLog(`[DUPLICATE] "${challenger.name}" ≈ "${master.name}" (${(similarity * 100).toFixed(1)}%)`, "warning");
                    duplicatesToTag.push(challenger);
                } else if (similarity >= 0.85 || (similarity >= 0.50 && nameSimilarity > 0.8)) {
                    await uiLog(`[VARIANT] "${challenger.name}" ~ "${master.name}" (${(similarity * 100).toFixed(1)}%)`, "info");
                    variantsToTag.add(master.char);
                    variantsToTag.add(challenger.char);
                }
            }
        }
        if (i % 50 === 0) {
            await updateProgress(30 + (i / groups.length) * 30, `Analyzing... ${i}/${groups.length} groups`);
        }
    }
    
    await uiLog(`Found ${duplicatesToTag.length} duplicates, ${variantsToTag.size} variants`, "success");

    // --- PHASE 3: Calculate Total Tags Needed ---
    let totalTagsNeeded = 0;
    
    // Count duplicate tags
    for (const item of duplicatesToTag) {
        if (!isAlreadyTagged(item.char, "Duplicate")) totalTagsNeeded++;
        if (!isAlreadyTagged(item.char, "IncorrectFormat")) totalTagsNeeded++;
    }
    
    // Count variant tags
    for (const char of variantsToTag) {
        const isFuta = checkForFutanari(char);
        const tagName = isFuta ? "Futa-Variant" : "Variant";
        if (!isAlreadyTagged(char, tagName)) totalTagsNeeded++;
    }
    
    // Count forensic tags (if enabled)
    if (forensicsEnabled) {
        for (const group of groups) {
            for (const item of group) {
                if (!isAlreadyTagged(item.char, "Duplicate")) {
                    const forensicTags = await runForensicPass(item.char);
                    for (const tag of forensicTags) {
                        if (!isAlreadyTagged(item.char, tag)) totalTagsNeeded++;
                    }
                }
            }
        }
    }
    
    await uiLog(`Total tags to apply: ${totalTagsNeeded}`, "info");

    // --- PHASE 4: Tagging with Flavor Text ---
    if (totalTagsNeeded > 0) {
        await uiLog("--- APPLYING TAGS ---", "warning");
        
        // Start flavor text rotation
        startFlavorTextRotation();
        
        let taggedCount = 0;
        let skippedCount = 0;
        
        // Tag duplicates
        for (const item of duplicatesToTag) {
            if (!isAlreadyTagged(item.char, "Duplicate") && !sessionTagged.has(`${item.char.avatar}:Duplicate`)) {
                await executeSlashCommands(`/tag-add name="${item.char.avatar}" Duplicate`);
                sessionTagged.add(`${item.char.avatar}:Duplicate`);
                taggedCount++;
                await sleep(100);
            } else {
                skippedCount++;
            }
            
            if (!isAlreadyTagged(item.char, "IncorrectFormat") && !sessionTagged.has(`${item.char.avatar}:IncorrectFormat`)) {
                await executeSlashCommands(`/tag-add name="${item.char.avatar}" IncorrectFormat`);
                sessionTagged.add(`${item.char.avatar}:IncorrectFormat`);
                taggedCount++;
                await sleep(100);
            } else {
                skippedCount++;
            }
            
            if (taggedCount % 5 === 0) {
                const percent = 60 + (taggedCount / totalTagsNeeded) * 40;
                const statusText = document.getElementById('curator-status');
                if (statusText && !flavorTextInterval) {
                    statusText.textContent = `Tagging... ${taggedCount}/${totalTagsNeeded}`;
                    adjustStatusFontSize(statusText);
                }
                await updateProgress(percent, "", true);
            }
        }
        
        // Tag variants
        for (const char of variantsToTag) {
            const isFuta = checkForFutanari(char);
            const tagName = isFuta ? "Futa-Variant" : "Variant";
            
            if (!isAlreadyTagged(char, tagName) && !sessionTagged.has(`${char.avatar}:${tagName}`)) {
                await executeSlashCommands(`/tag-add name="${char.avatar}" ${tagName}`);
                sessionTagged.add(`${char.avatar}:${tagName}`);
                taggedCount++;
                await sleep(100);
            } else {
                skippedCount++;
            }
            
            if (taggedCount % 5 === 0) {
                const percent = 60 + (taggedCount / totalTagsNeeded) * 40;
                const statusText = document.getElementById('curator-status');
                if (statusText && !flavorTextInterval) {
                    statusText.textContent = `Tagging... ${taggedCount}/${totalTagsNeeded}`;
                    adjustStatusFontSize(statusText);
                }
                await updateProgress(percent, "", true);
            }
        }
        
        // Tag forensic issues (if enabled)
        if (forensicsEnabled) {
            for (const group of groups) {
                for (const item of group) {
                    if (!isAlreadyTagged(item.char, "Duplicate")) {
                        const forensicTags = await runForensicPass(item.char);
                        for (const tag of forensicTags) {
                            if (!isAlreadyTagged(item.char, tag) && !sessionTagged.has(`${item.char.avatar}:${tag}`)) {
                                await executeSlashCommands(`/tag-add name="${item.char.avatar}" ${tag}`);
                                sessionTagged.add(`${item.char.avatar}:${tag}`);
                                taggedCount++;
                                await sleep(100);
                            } else {
                                skippedCount++;
                            }
                            
                            if (taggedCount % 5 === 0) {
                                const percent = 60 + (taggedCount / totalTagsNeeded) * 40;
                                const statusText = document.getElementById('curator-status');
                                if (statusText && !flavorTextInterval) {
                                    statusText.textContent = `Tagging... ${taggedCount}/${totalTagsNeeded}`;
                                    adjustStatusFontSize(statusText);
                                }
                                await updateProgress(percent, "", true);
                            }
                        }
                    }
                }
            }
        }
        
        // Stop flavor text rotation
        stopFlavorTextRotation();
        
        if (context.saveSettingsDebounced) context.saveSettingsDebounced();
        
        const elapsed = ((performance.now() - auditStartTime) / 1000).toFixed(2);
        await updateProgress(100, `Complete in ${elapsed}s!`);
        await uiLog(`✅ AUDIT COMPLETE in ${elapsed}s`, "success");
        await uiLog(`   • ${taggedCount} tags applied`, "success");
        await uiLog(`   • ${skippedCount} already tagged (skipped)`, "success");
        
        toastr.success(`Audit done! ${taggedCount} tags applied, ${skippedCount} skipped.`);
    } else {
        stopFlavorTextRotation();
        await updateProgress(100, "Clean");
        await uiLog("No anomalies detected. Library is pristine!", "success");
        toastr.info("No issues found.");
    }
}
