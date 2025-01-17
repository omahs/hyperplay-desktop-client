import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { faFolderOpen } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { UpdateComponent } from 'frontend/components/UI'
import SettingsContext from '../../SettingsContext'
import './index.css'

interface LogBoxProps {
  logFileContent: string
}

const LogBox: React.FC<LogBoxProps> = ({ logFileContent }) => {
  const { t } = useTranslation()
  const maxLines = 1000
  let sliced = false
  let lines = logFileContent.split('\n')
  if (lines.length > maxLines) {
    lines = ['...', ...lines.slice(-maxLines)]
    sliced = true
  }

  return (
    <>
      {sliced && (
        <span className="setting long-log-hint">
          {t(
            'settings.log.long-log-hint',
            'Log truncated, last 1000 lines are shown!'
          )}
        </span>
      )}
      <div className="setting log-box">
        {lines.map((line, key) => {
          if (line.toLowerCase().includes(' err')) {
            return (
              <p key={key} className="log-error">
                {line}
              </p>
            )
          } else if (line.toLowerCase().includes(' warn')) {
            return (
              <p key={key} className="log-warning">
                {line}
              </p>
            )
          } else {
            return (
              <p key={key} className="log-info">
                {line}
              </p>
            )
          }
        })}
      </div>
    </>
  )
}

export default function LogSettings() {
  const { t } = useTranslation()
  const [logFileContent, setLogFileContent] = useState<string>('')
  const [logFileExist, setLogFileExist] = useState<boolean>(false)
  const [defaultLast, setDefaultLast] = useState<boolean>(false)
  const [refreshing, setRefreshing] = useState<boolean>(true)
  const { appName, isDefault } = useContext(SettingsContext)

  const getLogContent = () => {
    window.api
      .getLogContent({
        appName: isDefault ? '' : appName,
        defaultLast
      })
      .then((content: string) => {
        if (!content) {
          setLogFileContent(t('setting.log.no-file', 'No log file found.'))
          setLogFileExist(false)
          return setRefreshing(false)
        }
        setLogFileContent(content)
        setLogFileExist(true)
        setRefreshing(false)
      })
  }

  useEffect(() => {
    if (defaultLast || !isDefault) {
      getLogContent()
      return
    } else {
      getLogContent()
      const interval = setInterval(() => {
        getLogContent()
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [isDefault, defaultLast])

  function showLogFileInFolder() {
    window.api.showLogFileInFolder({
      appName: isDefault ? '' : appName,
      defaultLast
    })
  }

  return (
    <>
      <div className="title">
        {t('setting.log.instructions_title', 'How to report a problem?')}
      </div>
      <p className="report-problem-instructions">
        {t(
          'setting.log.instructions-part-01',
          "If you encounter any issues while using HyperPlay, we have two designated areas to report your issues in our Discord Server. If you're a player, please report any problems by visiting the player-support-forum. If you are a game dev, please report any problems by visiting the dev-support-forum."
        )}{' '}
        <br />
        <br />
        {t(
          'setting.log.instructions-part-02',
          'To help us diagnose and fix the problem as quickly as possible, please provide as much information as possible, including a copy of your logs. Our support team will monitor both channels and do their best to respond to your issue as quickly as possible. Thank you for your patience and understanding while we work to resolve any problems you may encounter.'
        )}
      </p>
      {isDefault && (
        <span className="log-buttongroup">
          <a
            className={`log-buttons ${!defaultLast ? 'log-choosen' : ''}`}
            onClick={() => {
              setRefreshing(true)
              setDefaultLast(false)
            }}
            title={t('setting.log.current-log')}
          >
            {t('setting.log.current-log', 'Current log')}
          </a>
          <a
            className={`log-buttons ${defaultLast ? 'log-choosen' : ''}`}
            onClick={() => {
              setRefreshing(true)
              setDefaultLast(true)
            }}
            title={t('setting.log.last-log')}
          >
            {t('setting.log.last-log', 'Last Log')}
          </a>
        </span>
      )}
      {refreshing ? (
        <span className="log-box">
          <UpdateComponent inline />
        </span>
      ) : (
        <LogBox logFileContent={logFileContent} />
      )}
      {logFileExist && (
        <span className="footerFlex">
          <a
            onClick={showLogFileInFolder}
            title={t('setting.log.show-in-folder', 'Show log file in folder')}
            className="button is-footer"
          >
            <div className="button-icontext-flex">
              <div className="button-icon-flex">
                <FontAwesomeIcon icon={faFolderOpen} />
              </div>
              <span className="button-icon-text">
                {t('setting.log.show-in-folder', 'Show log file in folder')}
              </span>
            </div>
          </a>
          <a
            onClick={() => {
              navigator.clipboard.writeText(logFileContent)
            }}
            title={t(
              'setting.log.copy-to-clipboard',
              'Copy log content to clipboard.'
            )}
            className="button is-footer"
          >
            <div className="button-icontext-flex">
              <div className="button-icon-flex">
                <ContentCopyIcon />
              </div>
              <span className="button-icon-text">
                {t(
                  'setting.log.copy-to-clipboard',
                  'Copy log content to clipboard.'
                )}
              </span>
            </div>
          </a>
        </span>
      )}
    </>
  )
}
