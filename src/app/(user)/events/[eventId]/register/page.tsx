import { events } from "@utils/constants"
import RegisterPageClient from "@widgets/EventRegister/components/RegisterPageClient"


type RegisterPageProps = {
  params: Promise<{ eventId: string }>
}

export default async function RegisterPage({ params }: RegisterPageProps) {
  const { eventId } = await params
  const event = events.find((e) => e.id === eventId)

  if (!event) {
    return <div>Event not found</div>
  }

  // ✅ Pass data into Client Component
  return <RegisterPageClient eventId={eventId} event={event} />
}
