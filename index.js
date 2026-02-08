import { eventSource, event_types } from "../../../../script.js";
import { doAudit } from "./script.js";

// Default weights - now fully customizable
export const defaultWeights = { 
    lore: 5, 
    dialogue: 10, 
    greetings: 3, 
    spec: 5, 
    strict: 1,
    descLength: 200,  // Characters per score point
    qualityThreshold: 20  // Minimum score before flagging
};

const helpText = {
    header: "Audits your library for duplicates using fuzzy logic and semantic analysis.",
    lore: "Lorebook Weight: Points awarded per valid lorebook entry (content >10 chars + keywords).",
    dialogue: "Dialogue Weight: Points for properly formatted example messages (<START>, colons, etc.).",
    greetings: "Greetings Weight: Points per unique alternate greeting.",
    spec: "V3 Spec Weight: Points for advanced prompts (system_prompt, depth_prompt).",
    strict: "Strictness: Multiplier for penalties on obsolete formats (AliChat, Plist) and placeholders.",
    descLength: "Description Length Divisor: Character count divided by this = score points. Lower = more points.",
    qualityThreshold: "Quality Threshold: Cards below this score get flagged with [NEEDS_FIXING].",
    forensics: "Enable Forensics: Scan for formatting issues (JSON artifacts, dialogue leaks, placeholders).",
    run: "Starts a deep scan using names and bios to find duplicates, variants, and format issues.",
    reset: "Reverts all weights to default values."
};

function initUI() {
    if ($('#st-curator-wrapper').length) return;

    const html = `
        <div id="st-curator-wrapper" class="st-library-curator-settings">
            <div class="inline-drawer">
                <div class="inline-drawer-toggle inline-drawer-header" title="${helpText.header}">
                    <b>Library Curator</b>
                    <div class="inline-drawer-icon fa-solid fa-circle-chevron-down interactable" tabindex="0" role="button"></div>
                </div>
                <div class="inline-drawer-content" style="display: none;">
                    <div class="setup_section">
                        <p style="margin-bottom: 12px; font-size: 0.85em; color: var(--SmartThemeQuoteColor);">
                            Adjust weights to customize quality scoring. Hover over labels for details.
                        </p>
                        
                        <!-- Forensics Toggle -->
                        <div class="curator-setting" style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <label title="${helpText.forensics}" style="flex: 2;">
                                <input type="checkbox" id="curator-toggle-forensics" checked style="margin-right: 8px;">
                                Enable Forensic Scanning
                            </label>
                        </div>
                        
                        <!-- Weight Sliders -->
                        <h4 style="margin: 15px 0 10px 0; font-size: 0.9em; color: var(--mainColor);">Quality Weights</h4>
                        
                        ${['lore', 'dialogue', 'greetings', 'spec'].map(key => `
                            <div class="curator-setting">
                                <label title="${helpText[key]}">${key.charAt(0).toUpperCase() + key.slice(1)}:</label>
                                <input type="range" id="curator-weight-${key}" min="0" max="${key === 'dialogue' ? 50 : 20}" value="${defaultWeights[key]}" step="1">
                                <span id="val-${key}">${defaultWeights[key]}</span>
                            </div>
                        `).join('')}
                        
                        <div class="curator-setting">
                            <label title="${helpText.strict}">Strictness:</label>
                            <input type="range" id="curator-weight-strict" min="0" max="5" value="${defaultWeights.strict}" step="0.5">
                            <span id="val-strict">${defaultWeights.strict}</span>
                        </div>
                        
                        <h4 style="margin: 15px 0 10px 0; font-size: 0.9em; color: var(--mainColor);">Advanced Settings</h4>
                        
                        <div class="curator-setting">
                            <label title="${helpText.descLength}">Desc Length Divisor:</label>
                            <input type="range" id="curator-weight-descLength" min="50" max="500" value="${defaultWeights.descLength}" step="50">
                            <span id="val-descLength">${defaultWeights.descLength}}</span>
                        </div>
                        
                        <div class="curator-setting">
                            <label title="${helpText.qualityThreshold}">Quality Threshold:</label>
                            <input type="range" id="curator-weight-qualityThreshold" min="0" max="50" value="${defaultWeights.qualityThreshold}" step="5">
                            <span id="val-qualityThreshold">${defaultWeights.qualityThreshold}</span>
                        </div>
                        
                        <!-- Progress Container -->
                        <div id="curator-progress-container" style="display:none; margin-top: 15px;">
                            <div id="curator-status" style="
                                font-size: 14px;
                                margin-bottom: 8px;
                                color: var(--mainColor);
                                font-weight: bold;
                                text-shadow: 1px 1px 1px black;
                                min-height: 20px;
                                overflow: hidden;
                                text-overflow: ellipsis;
                                white-space: nowrap;
                            ">Initializing...</div>
                            <div class="curator-progress-bg" style="background: rgba(0,0,0,0.2); border-radius: 4px; height: 8px; margin: 5px 0; overflow: hidden;">
                                <div id="curator-progress-bar" style="width: 0%; height: 100%; background: #4a9eff; border-radius: 4px; transition: width 0.2s;"></div>
                            </div>
                            
                            <div id="curator-log" style="
                                background: rgba(0,0,0,0.2); 
                                border: 1px solid rgba(255,255,255,0.1); 
                                height: 150px; 
                                overflow-y: auto; 
                                margin-top: 10px; 
                                padding: 5px; 
                                font-family: monospace; 
                                font-size: 11px;
                                color: #ccc;
                                display: block;
                            "></div>
                        </div>

                        <!-- Action Buttons -->
                        <div class="curator-actions" style="margin-top: 15px; display: flex; gap: 8px;">
                            <button id="st-curator-run" class="menu_button interactable" title="${helpText.run}">
                                <i class="fa-solid fa-broom-magic"></i> Run Audit
                            </button>
                            <button id="st-curator-reset" class="menu_button interactable danger_button" title="${helpText.reset}">
                                <i class="fa-solid fa-rotate-left"></i> Reset
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;

    $('#extensions_settings').append(html);

    // Update value displays when sliders change
    $(document).on('input', '#st-curator-wrapper input[type="range"]', function() {
        const key = this.id.replace('curator-weight-', '');
        $(`#val-${key}`).text(this.value);
    });

    // Reset button
    $(document).on('click', '#st-curator-reset', () => {
        Object.keys(defaultWeights).forEach(key => {
            const slider = $(`#curator-weight-${key}`);
            if (slider.length) {
                slider.val(defaultWeights[key]).trigger('input');
            }
        });
        $('#curator-toggle-forensics').prop('checked', true);
        toastr.info('Settings reset to defaults');
    });

    // Run audit button
    $(document).on('click', '#st-curator-run', doAudit);
}

eventSource.on(event_types.APP_READY, initUI);
if (document.readyState === 'complete') initUI();
