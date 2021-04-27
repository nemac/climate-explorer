const get_option = variable => `
  <li role="option" tabindex="0" data-value="${variable.id}" class="default-select-option with-tip variable-option-item float-left  ${variable.area === 'ak-only' ? "opt-only-ak" : (variable.area==='island-only'?"opt-only-island":"") }">
    <span class="variable-option-text float-left">${variable.short_label || variable.label}</span>
    <span tabindex="0" data-value="${variable.id}" id="${variable.id}-tooltip" class="fas fa-question-circle padding-horizontal-half variable-option-tooltip float-left" data-tippy-content="
        <strong>${variable.label}</strong><hr/>
        ${variable.description}">
      </span>
  </li>
`;


export default (config) =>`
<div class="select variable-select">
  <div tabindex="8" id="variable-select-vis" class="select-styled" data-rel="tmax">Avg Daily Max Temp (°F)</div>
  <ul class="select-options">
    <div icon="fas fa-temperature-high select-icon" class="default-select-option-group">
      <i class="fas fa-temperature-high select-icon"></i>Temperature
    </div>
    ${config.variables.filter(a=>a.group==="temperature").map(get_option).join('')}

    <div icon="fas fa-cloud-rain select-icon" class="default-select-option-group">
      <i class="fas fa-cloud-rain select-icon"></i>Precipitation
    </div>
        
    ${config.variables.filter(a=>a.group==="precipitation").map(get_option).join('')}

    <div icon="fas fa-bacon select-icon" class="default-select-option-group">
      <i class="fas fa-bacon select-icon"></i>Other
    </div>

    ${config.variables.filter(a=>a.group==="temperature_degree_days").map(get_option).join('')}

  </ul>
</div>
`
