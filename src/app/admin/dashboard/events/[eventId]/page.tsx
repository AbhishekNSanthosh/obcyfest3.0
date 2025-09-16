import React from 'react'
import EventDashboard from '@widgets/admin/EventDashboard'

const page = ({ params }: { params: { eventId: string } }) => {
  return (
    <div>
      <EventDashboard eventId={params.eventId} />
    </div>
  )
}

export default page