import FooterView from '@widgets/Footer'
import HeaderView from '@widgets/Header'
import React from 'react'
import EventContent from './components/EventContent'

export default function EventView() {
  return (
    <main>
        <HeaderView/>
        <EventContent/>
        <FooterView/>
    </main>
  )
}
