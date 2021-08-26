const get_option = variable => `
  <li role="option" data-value="${variable.id}" class="dropdown-item d-flex justify-content-between align-items-center ps-0 pe-0 pt-1 pb-1 rounded-3 ${variable.area === 'ak-only' ? "opt-only-ak" : (variable.area==='island-only'?"opt-only-island":"") }">
    <span class="variable-option-text float-left ms-2 me-2">${variable.short_label || variable.label}</span>
    <span data-value="${variable.id}" id="${variable.id}-tooltip" class="fas fa-question-circle me-2" data-tippy-content="
        <strong>${variable.label}</strong><hr/>
        ${variable.description}">
    </span>
  </li>
`;


export default (config) =>`

<div data-icon="fas fa-temperature-high" class="m-2 p-2">
    <div class="filter-dropdown-header mb-2"> 
       <i class="fas fa-temperature-high"></i>
       <span>Temperature</span>
    </div>
    
    <ul class="filter-dropdown-menu"> 
        ${config.variables.filter(a=>a.group==="temperature").map(get_option).join('')}
    </ul>
    
</div>


<div data-icon="fas fa-cloud-rain" class="m-2">
    <div class="filter-dropdown-header mb-2"> 
      <i class="fas fa-cloud-rain select-icon"></i>
      <span>Precipitation</span>
    </div>
    <ul class="filter-dropdown-menu">
        ${config.variables.filter(a=>a.group==="precipitation").map(get_option).join('')}
    </ul>
    
</div>
    


<div data-icon="fas fa-bacon" class="m-2 mb-2">
    <div class="filter-dropdown-header"> 
      <i class="fas fa-bacon"></i>
      <span>Other</span>
    </div>

    <ul class="filter-dropdown-menu">
      ${config.variables.filter(a=>a.group==="temperature_degree_days").map(get_option).join('')}
    </ul>
</div>

`
