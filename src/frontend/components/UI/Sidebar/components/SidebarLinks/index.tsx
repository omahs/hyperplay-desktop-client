import { NavLink, useLocation } from 'react-router-dom'
import classNames from 'classnames'
import React, { useContext, useEffect, useState } from 'react'
import { openDiscordLink } from 'frontend/helpers'
import ContextProvider from 'frontend/state/ContextProvider'
import './index.css'
import QuitButton from '../QuitButton'
import { SHOW_EXTERNAL_LINK_DIALOG_STORAGE_KEY } from 'frontend/components/UI/ExternalLinkDialog'
import { Images } from '@hyperplay/ui'

export default function SidebarLinks() {
  const location = useLocation() as { pathname: string }

  const {
    epic,
    gog,
    amazon,
    activeController,
    refreshLibrary,
    handleExternalLinkDialog
  } = useContext(ContextProvider)

  const settingsPath = '/settings/app/default/general'

  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    window.api.isFullscreen().then((res) => setIsFullscreen(res))
  }, [])

  async function handleRefresh() {
    localStorage.setItem('scrollPosition', '0')

    const shouldRefresh =
      (epic.username && !epic.library.length) ||
      (gog.username && !gog.library.length) ||
      (amazon.user_id && !amazon.library.length)
    if (shouldRefresh) {
      return refreshLibrary({ runInBackground: true })
    }
    return
  }

  function handleExternalLink(linkCallback: () => void) {
    const showExternalLinkDialog: boolean = JSON.parse(
      localStorage.getItem(SHOW_EXTERNAL_LINK_DIALOG_STORAGE_KEY) ?? 'true'
    )
    if (showExternalLinkDialog) {
      handleExternalLinkDialog({ showDialog: true, linkCallback })
    } else {
      linkCallback()
    }
  }

  const sidebarSvgUnselectedFill = 'var(--color-neutral-400)'

  return (
    <>
      <div className=" SidebarLinks Sidebar__section">
        <div className="sidebarLinkGradientWrapper">
          <NavLink
            className={({ isActive }) =>
              classNames('Sidebar__item', {
                active: isActive || location.pathname.includes('store')
              })
            }
            to="/hyperplaystore"
          >
            <Images.Home fill={sidebarSvgUnselectedFill} />
          </NavLink>
        </div>
        <div className="sidebarLinkGradientWrapper">
          <NavLink
            className={({ isActive }) =>
              classNames('Sidebar__item', {
                active:
                  isActive ||
                  location.pathname.includes('gamepage') ||
                  location.pathname.includes('library')
              })
            }
            end
            to={'/library'}
            onClick={async () => handleRefresh()}
          >
            <Images.Controller fill={sidebarSvgUnselectedFill} />
          </NavLink>
        </div>
        <div className="sidebarLinkGradientWrapper">
          <NavLink
            className={({ isActive }) =>
              classNames('Sidebar__item', { active: isActive })
            }
            to={{ pathname: '/download-manager' }}
          >
            <Images.DownloadIcon fill={sidebarSvgUnselectedFill} />
          </NavLink>
        </div>
        <div className="sidebarLinkGradientWrapper">
          <NavLink
            data-testid="settings"
            className={({ isActive }) =>
              classNames('Sidebar__item', {
                active: isActive || location.pathname.includes('settings')
              })
            }
            to={{ pathname: settingsPath }}
            state={{
              fromGameCard: false
            }}
          >
            <Images.Settings fill={sidebarSvgUnselectedFill} />
          </NavLink>
        </div>
      </div>

      <div className=" SidebarLinks Sidebar__section">
        <div
          className="sidebarLinkGradientWrapper"
          onClick={() => handleExternalLink(openDiscordLink)}
        >
          <div className="Sidebar__item">
            <button>
              <Images.Discord stroke={sidebarSvgUnselectedFill} />
            </button>
          </div>
        </div>
        <div
          className="sidebarLinkGradientWrapper "
          onClick={() => handleExternalLink(window.api.openTwitterLink)}
        >
          <div className="Sidebar__item">
            <button>
              <Images.Twitter fill={sidebarSvgUnselectedFill} />
            </button>
          </div>
        </div>
        <div className="sidebarLinkGradientWrapper">
          <NavLink
            data-testid="wiki"
            className={({ isActive }) =>
              classNames('Sidebar__item', { active: isActive })
            }
            to={{ pathname: '/wiki' }}
          >
            <Images.Page fill={sidebarSvgUnselectedFill} />
          </NavLink>
        </div>
        <div className="sidebarLinkGradientWrapper">
          {(isFullscreen || activeController) && <QuitButton />}
        </div>
      </div>
    </>
  )
}
