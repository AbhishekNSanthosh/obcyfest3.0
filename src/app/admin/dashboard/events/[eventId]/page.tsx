import React from 'react'
import EventDashboard from '@widgets/admin/EventDashboard'

const page = async ({ params }: { params: { eventId: string } }) => {
  const { eventId } = await params;
  return (
    <div>
      <EventDashboard isAdmin = {true} eventId={eventId} />
    </div>
  )
}

export default page