import AddEvent from "@widgets/admin/AdminAddNewEvent";
import React from "react";

const page = async ({ params }: { params: { eventId: string } }) => {
  const { eventId } = await params;
  return (
    <div>
      <AddEvent eventId={eventId} />
    </div>
  );
};

export default page;
