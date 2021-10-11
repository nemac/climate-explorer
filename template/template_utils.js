
export function version_suffix(){
  return '?v=' + new Date().toISOString().slice(0,10).replace(/-/g,'')
}
