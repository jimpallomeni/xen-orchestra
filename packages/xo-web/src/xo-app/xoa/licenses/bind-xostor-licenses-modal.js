import _ from 'intl'
import BaseComponent from 'base-component'
import React from 'react'

class BindXostorLicensesModal extends BaseComponent {
  get value() {
    return {
      passphrase: this.state.passphrase,
    }
  }

  render() {
    console.log(this.props.hosts)
    return <div>foo</div>
  }
}

export default BindXostorLicensesModal
