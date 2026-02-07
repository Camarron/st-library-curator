import { eventSource, event_types } from "../../../../script.js";
import { doAudit } from "./script.js";

// Weights now include 'strict' for LLM-validity checking
export const defaultWeights = { lore: 5, dialogue: 10, greetings: 3, spec: 5, strict: 1 };

const helpText = {
    header: "Audits your library for duplicates using fuzzy logic and semantic analysis.",
    lore: "Score based on Valid (non-empty) Lorebook entries.",
    dialogue: "Score based on proper Dialogue formatting (<START>, {{char}}:).",
    greetings: "Score based on Unique Alternate Greetings.",
    spec: "Score for V3 features (System/Depth Prompts).",
    strict: "Strictness: Penalize obsolete formats (AliChat, Plist) and placeholder text.",
    run: "Starts a deep scan using names and bios to find evolved duplicates.",
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
                        <p>Adjust weights to prioritize card quality.</p>
                        ${['lore', 'dialogue', 'greetings', 'spec'].map(key => `
                            <div class="curator-setting">
                                <label title="${helpText[key]}">${key.charAt(0).toUpperCase() + key.slice(1)}:</label>
                                <input type="range" id="curator-weight-${key}" min="0" max="${key === 'dialogue' ? 50 : 20}" value="${defaultWeights[key]}">
                                <span id="val-${key}">${defaultWeights[key]}</span>
                            </div>
                        `).join('')}
                        
                        <div class="curator-setting">
                            <label title="${helpText.strict}">Strictness:</label>
                            <input type="range" id="curator-weight-strict" min="1" max="5" value="${defaultWeights.strict}">
                            <span id="val-strict">${defaultWeights.strict}</span>
                        </div>
                        
                        <div id="curator-progress-container" style="display:none; margin-top: 10px;">
                            <div id="curator-status">Initializing...</div>
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

                        <div class="curator-actions" style="margin-top: 10px; display: flex; gap: 5px;">
                            <button id="st-curator-run" class="menu_button interactable" title="${helpText.run}">
                                <i class="fa-solid fa-broom-magic"></i> Run Audit
                            </button>
                            <button id="st-curator-reset" class="menu_button interactable danger_button" title="${helpText.reset}">Reset</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;

    $('#extensions_settings').append(html);

    $(document).on('input', '#st-curator-wrapper input[type="range"]', function() {
        $(`#val-${this.id.split('-').pop()}`).text(this.value);
    });

    $(document).on('click', '#st-curator-reset', () => {
        Object.keys(defaultWeights).forEach(key => {
            $(`#curator-weight-${key}`).val(defaultWeights[key]).trigger('input');
        });
    });

    $(document).on('click', '#st-curator-run', doAudit);
}

eventSource.on(event_types.APP_READY, initUI);
if (document.readyState === 'complete') initUI();