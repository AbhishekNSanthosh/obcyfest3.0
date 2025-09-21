import React from 'react'
import EventDashboard from '@widgets/admin/EventDashboard'

const page = async ({ params }: { params: { eventId: string } }) => {
  const { eventId } = await params;
  console.log(eventId)
  return (
    <div>
      <EventDashboard eventId={eventId} />
    </div>
  )
}

export default page