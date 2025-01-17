import React, { useContext, useEffect, useState } from 'react'
import transactionStore from 'frontend/store/TransactionStore'
import { TransactionState } from 'frontend/store/types'
import { TransactionToast } from '@hyperplay/ui'
import {
  TITLE,
  DESCRIPTION,
  statusType,
  TxnStateToStatusMap
} from 'frontend/screens/TransactionNotification/constants'
import { observer } from 'mobx-react-lite'
import { t } from 'i18next'
import ContextProvider from 'frontend/state/ContextProvider'

interface BrowserToastManagerProps {
  showCloseButton?: boolean
}

const BrowserToastManager = function (props: BrowserToastManagerProps) {
  const [showInitialToast, setShowInitialToast] = useState(true)
  const { platform } = useContext(ContextProvider)
  const isMac = platform === 'darwin'

  useEffect(() => {
    setTimeout(() => {
      setShowInitialToast(false)
    }, 11000)
  }, [])

  if (showInitialToast) {
    return (
      <div>
        <TransactionToast
          status={'success'}
          title={t('hyperplayOverlay.greeting.title', 'HyperPlay Overlay')}
          subtext={t('hyperplayOverlay.greeting.description', {
            defaultValue:
              'HyperPlay Overlay is ready! Press {{overlayKeyMod}} + X to show or hide it.',
            overlayKeyMod: isMac ? 'Option' : 'Alt'
          })}
          onClick={() => setShowInitialToast(false)}
          showCloseButton={props.showCloseButton}
        />
      </div>
    )
  }

  const item = transactionStore.latestTxn
  if (item === null || !item.isOpen) return <></>

  let title = ''
  let description = ''
  let status: statusType = 'error'

  title = TITLE[item.method]
    ? TITLE[item.method][item.state]()
    : TITLE.default[item.state]()
  description = DESCRIPTION[item.state]()
  status = TxnStateToStatusMap[item.state]

  if (
    item.state === TransactionState.CONFIRMED ||
    item.state === TransactionState.FAILED
  ) {
    setTimeout(() => transactionStore.closeTransaction(item.id), 5000)
  }

  /* eslint-disable react/no-unknown-property */
  return (
    <div>
      <TransactionToast
        status={status}
        title={title}
        subtext={description}
        onClick={() => transactionStore.closeTransaction(item.id)}
        showCloseButton={props.showCloseButton}
      />
    </div>
  )
}

export default observer(BrowserToastManager)
