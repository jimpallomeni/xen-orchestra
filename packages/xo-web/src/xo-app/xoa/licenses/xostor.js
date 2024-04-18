import _ from 'intl'
import ActionButton from 'action-button'
import BulkIcons from 'bulk-icons'
import Component from 'base-component'
import decorate from 'apply-decorators'
import Icon from 'icon'
import React from 'react'
import SortedTable from 'sorted-table'
import { confirm } from 'modal'
import { connectStore } from 'utils'
import { createGetObjectsOfType, createSelector } from 'selectors'
import { filter, groupBy, keyBy } from 'lodash'
import { injectState, provideState } from 'reaclette'
import { Pool, Sr, Host } from 'render-xo-item'

import BindXostorLicensesModal from './bind-xostor-licenses-modal'
import Tooltip from 'tooltip'

class XostorLicensesForm extends Component {
  getAlerts = createSelector(
    () => this.props.item,
    () => this.props.userData,
    (sr, userData) => {
      const { hosts, licensesByHostUuid, xcpngLicensebyHostUuid } = userData
      const alerts = []
      const now = Date.now()

      const _hosts = filter(hosts, host => host.$pool === sr.$pool)
      _hosts.forEach(host => {
        const xostorLicenses = licensesByHostUuid[host.id]
        const xcpngLicense = xcpngLicensebyHostUuid[host.id]

        if (xcpngLicense === undefined) {
          alerts.push({
            level: 'danger',
            render: (
              <p>
                No XCP-ng Pro support on <Host id={host.id} />
              </p>
            ),
          })
        }

        if (xcpngLicense?.expires < now) {
          alerts.push({
            level: 'danger',
            render: (
              <p>
                The XCP-ng Pro support license {xcpngLicense.id.slice(-4)} is expired on <Host id={host.id} />
              </p>
            ),
          })
        }

        if (xostorLicenses === undefined) {
          alerts.push({
            level: 'danger',
            render: (
              <p>
                No XOSTOR license on <Host id={host.id} />
              </p>
            ),
          })
        }

        if (xostorLicenses?.length > 1) {
          alerts.push({
            level: 'danger',
            render: (
              <p>
                Multiple XOSTOR licenses are bound to <Host id={host.id} />
                <br />
                {licenses.map(license => license.id.slice(-4)).join(',')}
              </p>
            ),
          })
        }
        const xostorLicense = xostorLicenses?.[0]
        if (xostorLicense?.expires < now) {
          alerts.push({
            level: 'danger',
            render: _('licenseExpiredXostorWarning', { licenseId: license?.id.slice(-4) }), // Display the xostor host?
          })
        }
      })

      return alerts
    }
  )

  async bindXostorLicenses() {
    // const hosts = //
    const params = await confirm({
      icon: 'connect',
      title: 'Bind licenses',
      body: <BindXostorLicensesModal hosts={{}} />,
    })
    console.log({ params })
  }

  render() {
    const alerts = this.getAlerts()

    return (
      <div>
        {alerts.length === 0 ? (
          <Tooltip content='SR under support'>
            <Icon icon='menu-support' className='text-success' />
          </Tooltip>
        ) : (
          <BulkIcons alerts={alerts} />
        )}
        <ActionButton btnStyle='primary' className='ml-1' handler={this.bindXostorLicenses} icon='connect'>
          Bind licenses
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
      licensesByHostUuid: (state, { xostorLicenses }) => {
        console.log(xostorLicenses)
        return groupBy(xostorLicenses, 'boundObjectId')
      },
      xcpngLicenseByHostUuid: (state, { xcpngLicenses }) => keyBy(xcpngLicenses, 'boundObjectId'),
    },
  }),
  injectState,
  ({ state, xostorSrs, updateLicenses, hosts }) => (
    <SortedTable
      collection={xostorSrs}
      columns={COLUMNS}
      data-updateLicenses={updateLicenses}
      data-licensesByHostUuid={state.licensesByHostUuid}
      data-hosts={hosts}
      data-xcpngLicensebyHostUuid={state.xcpngLicenseByHostUuid}
      individualActions={INDIVIDUAL_ACTIONS}
    />
  ),
])

export default Xostor
