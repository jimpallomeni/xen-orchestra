import _ from 'intl'
import ActionButton from 'action-button'
import BulkIcons from 'bulk-icons'
import Component from 'base-component'
import decorate from 'apply-decorators'
import Icon from 'icon'
import React from 'react'
import SortedTable from 'sorted-table'
import Tooltip from 'tooltip'
import { bindLicense, rebindObjectLicense } from 'xo'
import { confirm } from 'modal'
import { connectStore } from 'utils'
import { createGetObjectsOfType, createSelector } from 'selectors'
import { filter, groupBy, keyBy, map } from 'lodash'
import { injectState, provideState } from 'reaclette'
import { Host, Pool, Sr } from 'render-xo-item'

import BindXostorLicensesModal from './bind-xostor-licenses-modal'

class XostorLicensesForm extends Component {
  getAlerts = createSelector(
    () => this.props.item,
    () => this.props.userData,
    (sr, userData) => {
      const { hosts, licensesByHost, xcpngLicenseByHost } = userData
      const alerts = []
      const now = Date.now()

      const _hosts = filter(hosts, host => host.$pool === sr.$pool)
      _hosts.forEach(host => {
        const xostorLicenses = licensesByHost[host.id]
        const xcpngLicense = xcpngLicenseByHost[host.id]

        if (xcpngLicense === undefined || xcpngLicense.expires < now) {
          alerts.push({
            level: 'danger',
            render: (
              <p>
                {_('hostNoSupport')} <Host id={host.id} />
              </p>
            ),
          })
        }

        if (xostorLicenses === undefined) {
          alerts.push({
            level: 'danger',
            render: _('hostHasNoXostorLicense', { host: <Host id={host.id} /> }),
          })
        }

        if (xostorLicenses?.length > 1) {
          alerts.push({
            level: 'danger',
            render: (
              <p>
                {_('hostBoundToMultipleXostorLicenses', { host: <Host id={host.id} /> })}
                <br />
                {xostorLicenses.map(license => license.id.slice(-4)).join(',')}
              </p>
            ),
          })
        }
        const expiredXostorLicenses = xostorLicenses?.filter(license => license.expires < now)
        if (expiredXostorLicenses?.length > 0) {
          alerts.push({
            level: 'danger',
            render: _('licenseExpiredXostorWarning', {
              licenseIds: expiredXostorLicenses.map(license => license.id.slice(-4)).join(','),
              nLicenseIds: expiredXostorLicenses.length,
              host: <Host id={host.id} />,
            }),
          })
        }
      })

      return alerts
    }
  )

  bindXostorLicenses = async () => {
    const sr = this.props.item
    const hosts = groupBy(this.props.userData.hosts, '$pool')[sr.$pool]
    const xostorLicensesByHost = this.props.userData.licensesByHost

    const licenseByHost = await confirm({
      icon: 'connect',
      title: _('bindLicenses'),
      body: <BindXostorLicensesModal hosts={hosts} />,
    })

    await Promise.all(
      map(licenseByHost, (licenseId, hostId) => {
        if (licenseId === 'none') {
          return
        }

        const prevLicenses = xostorLicensesByHost[hostId]
        if (prevLicenses !== undefined) {
          if (prevLicenses.some(license => license.id === licenseId)) {
            // License already bound to the host
            return
          }
          return rebindObjectLicense(hostId, licenseId, 'xostor')
        }
        return bindLicense(licenseId, hostId)
      })
    )
    await this.props.userData.updateLicenses()
  }

  render() {
    const alerts = this.getAlerts()

    return (
      <div>
        {alerts.length === 0 ? (
          <Tooltip content={_('xostorHasSupport')}>
            <Icon icon='menu-support' className='text-success' />
          </Tooltip>
        ) : (
          <BulkIcons alerts={alerts} />
        )}
        <ActionButton btnStyle='primary' className='ml-1' handler={this.bindXostorLicenses} icon='connect'>
          {_('bindLicenses')}
        </ActionButton>
      </div>
    )
  }
}

const INDIVIDUAL_ACTIONS = [
  {
    label: _('productSupport'),
    icon: 'support',
    handler: () => window.open('https://xen-orchestra.com'),
  },
]

const COLUMNS = [
  {
    default: true,
    name: _('name'),
    itemRenderer: sr => <Sr id={sr.id} link container={false} />,
    sortCriteria: 'name_label',
  },
  { name: _('pool'), itemRenderer: sr => <Pool id={sr.$pool} link /> },
  { name: _('license'), component: XostorLicensesForm },
]
const Xostor = decorate([
  connectStore(() => ({
    xostorSrs: createGetObjectsOfType('SR').filter([({ SR_type }) => SR_type === 'linstor']),
    hosts: createGetObjectsOfType('host'),
  })),
  provideState({
    computed: {
      licensesByHost: (state, { xostorLicenses }) => groupBy(xostorLicenses, 'boundObjectId'),
      xcpngLicenseByHost: (state, { xcpngLicenses }) => keyBy(xcpngLicenses, 'boundObjectId'),
    },
  }),
  injectState,
  ({ state, xostorSrs, updateLicenses, hosts }) => (
    <SortedTable
      collection={xostorSrs}
      columns={COLUMNS}
      data-hosts={hosts}
      data-updateLicenses={updateLicenses}
      data-licensesByHost={state.licensesByHost}
      data-xcpngLicenseByHost={state.xcpngLicenseByHost}
      individualActions={INDIVIDUAL_ACTIONS}
    />
  ),
])

export default Xostor
