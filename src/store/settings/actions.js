import systemSettingsServices from '../../services/settings'

export async function getSetting () {
  return systemSettingsServices.getSetting()
}

export async function manage (ctx, payload) {
  return systemSettingsServices.manage(payload)
}
