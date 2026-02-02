import { eventSource, event_types } from "../../../../script.js";
import { doAudit } from "./script.js";

export const defaultWeights = { lore: 5, dialogue: 10, greetings: 3, spec: 5 };

const helpText = {
    header: "Audits your library for duplicates using fuzzy logic and quality scoring.",
    lore: "Score based on the content in Character Book entries.",
    dialogue: "Score based on the length of Example Dialogue.",
    greetings: "Score based on the number of Alternate Greetings.",
    spec: "Bonus points for modern Chara_Card_V3 specification.",
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
                        
                        <div id="curator-progress-container" style="display:none;">
                            <div id="curator-status">Initializing...</div>
                            <div class="curator-progress-bg">
                                <div id="curator-progress-bar" style="width: 0%;"></div>
                            </div>
                            <div id="curator-log"></div>
                        </div>

                        <div class="curator-actions">
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