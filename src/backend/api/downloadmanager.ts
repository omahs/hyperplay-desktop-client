import { DownloadManagerState } from './../../common/types'
import { ipcRenderer } from 'electron'
import { DMQueueElement, InstallParams, UpdateParams } from 'common/types'

export const install = async (args: InstallParams) => {
  const dmQueueElement: DMQueueElement = {
    params: args,
    type: 'install',
    addToQueueTime: Date.now(),
    endTime: 0,
    startTime: 0
  }

  await ipcRenderer.invoke('addToDMQueue', dmQueueElement)

  // Add Dlcs to the queue
  if (Array.isArray(args.installDlcs) && args.installDlcs.length > 0) {
    args.installDlcs.forEach(async (dlc) => {
      const dlcArgs: InstallParams = {
        ...args,
        appName: dlc,
        installDlcs: false
      }
      const dlcQueueElement: DMQueueElement = {
        params: dlcArgs,
        type: 'install',
        addToQueueTime: Date.now(),
        endTime: 0,
        startTime: 0
      }
      await ipcRenderer.invoke('addToDMQueue', dlcQueueElement)
    })
  }
}

export const updateGame = (args: UpdateParams) => {
  const {
    gameInfo: {
      install: { platform, install_path }
    }
  } = args

  const dmQueueElement: DMQueueElement = {
    params: { ...args, path: install_path!, platformToInstall: platform! },
    type: 'update',
    addToQueueTime: Date.now(),
    endTime: 0,
    startTime: 0
  }

  ipcRenderer.invoke('addToDMQueue', dmQueueElement)

  ipcRenderer.invoke('trackEvent', {
    event: 'Game Update Requested',
    properties: { game_name: args.appName, store_name: args.runner }
  })
}

export const getDMQueueInformation = async () =>
  ipcRenderer.invoke('getDMQueueInformation')

export const removeFromDMQueue = (appName: string) =>
  ipcRenderer.send('removeFromDMQueue', appName)

export const handleDMQueueInformation = (
  onChange: (
    e: Electron.IpcRendererEvent,
    elements: DMQueueElement[],
    state: DownloadManagerState
  ) => void
) => {
  ipcRenderer.on('changedDMQueueInformation', onChange)
  return () => {
    ipcRenderer.removeListener('changedDMQueueInformation', onChange)
  }
}

export const cancelDownload = (removeDownloaded: boolean) =>
  ipcRenderer.send('cancelDownload', removeDownloaded)

export const resumeCurrentDownload = () =>
  ipcRenderer.send('resumeCurrentDownload')

export const pauseCurrentDownload = () =>
  ipcRenderer.send('pauseCurrentDownload')
