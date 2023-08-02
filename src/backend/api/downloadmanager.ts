import { DownloadManagerState } from './../../common/types'
import { ipcRenderer } from 'electron'
import { DMQueueElement, InstallParams, UpdateParams } from 'common/types'

export const install = async (args: InstallParams) => {
  return ipcRenderer.invoke('addToDMQueue', args, 'install')
}

export const updateGame = (args: UpdateParams) => {
  const {
    gameInfo: {
      install: { platform, install_path }
    }
  } = args

  const argsInstallParams = {
    ...args,
    path: install_path!,
    platformToInstall: platform!
  }

  ipcRenderer.invoke('addToDMQueue', argsInstallParams, 'update')
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
