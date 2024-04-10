import _ from 'intl'
import ActionButton from 'action-button'
import Component from 'base-component'
import Icon from 'icon'
import React from 'react'
import SortedTable from 'sorted-table'
import PifsColumn from 'sorted-table/pifs-column'
import { addSubscriptions, connectStore } from 'utils'
import { Card, CardBlock, CardHeader } from 'card'
import { Col, Container, Row } from 'grid'
import { createGetObjectsOfType, createSelector } from 'selectors'
import { find } from 'lodash'
import { generateId } from 'reaclette-utils'
import { createXostorInterface, destroyXostorInterface, setXostor, subscribeXostorInterfaces } from 'xo'

const INTERFACES_COLUMNS = [
  {
    name: _('name'),
    itemRenderer: iface => iface.name,
    sortCriteria: iface => iface.name,
  },
  {
    name: _('pifs'),
    itemRenderer: (iface, { pifIdsByIfaceName }) => <PifsColumn pifs={pifIdsByIfaceName[iface.name]} />,
  },
]

@connectStore({
  pifs: createGetObjectsOfType('PIF').filter((_, props) => pif => pif.$pool === props.sr.$pool),
})
@addSubscriptions(({ sr }) => ({
  interfaces: subscribeXostorInterfaces(sr),
}))
export default class TabXostor extends Component {
  _actions = [
    {
      handler: ifaces => Promise.all(ifaces.map(iface => destroyXostorInterface(this.props.sr, iface.name))),
      icon: 'delete',
      label: _('delete'),
      level: 'danger',
      individualDisabled: ifaces => ifaces[0].name === 'default',
    },
  ]

  _individualActions = [
    {
      handler: iface => setXostor(this.props.sr, { preferredInterface: iface.name }),
      icon: 'favorite',
      label: _('setAsPreferred'),
      level: 'primary',
    },
  ]

  getComputedIfaces = createSelector(
    () => this.props.interfaces,
    ifaces => {
      if (ifaces === undefined) {
        return {}
      }
      const computedIfaces = {}
      for (const ifaceName in ifaces) {
        computedIfaces[ifaceName] = {
          id: generateId(),
          name: ifaceName,
          nodeIfaces: ifaces[ifaceName],
        }
      }
      return computedIfaces
    }
  )

  getPifsByIfaceName = createSelector(
    () => this.props.interfaces,
    () => this.props.pifs,
    (ifaces, pifs) => {
      if (ifaces === undefined) {
        return {}
      }
      const pifsByIfaceName = {}
      for (const ifaceName in ifaces) {
        pifsByIfaceName[ifaceName] = ifaces[ifaceName].map(
          iface => find(pifs, pif => pif.ip === iface.address || pif.ipv6 === iface.address)?.id
        )
      }
      return pifsByIfaceName
    }
  )

  render() {
    return (
      <Container>
        <Row>
          <Col>
            <Card>
              <CardHeader>
                <Icon icon='network' /> {_('interfaces')}
              </CardHeader>
              <CardBlock>
                <ActionButton
                  btnStyle='primary'
                  handler={createXostorInterface}
                  handlerParam={this.props.sr}
                  icon='add'
                >
                  {_('createInterface')}
                </ActionButton>
                <SortedTable
                  actions={this._actions}
                  collection={this.getComputedIfaces()}
                  columns={INTERFACES_COLUMNS}
                  data-pifIdsByIfaceName={this.getPifsByIfaceName()}
                  individualActions={this._individualActions}
                  stateUrlParam='s'
                />
              </CardBlock>
            </Card>
          </Col>
        </Row>
      </Container>
    )
  }
}
