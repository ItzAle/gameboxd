import ReleaseCalendar from "@/Components/ReleaseCalendar/ReleaseCalendar";
import TransparentNavbar from "@/Components/Navbar/TransparentNavbar";

export const metadata = {
  title: "Release Calendar",
  description: "View the release calendar for upcoming games.",
};

export default function ReleaseCalendarPage() {
  return (
    <div>
      <TransparentNavbar />
      <ReleaseCalendar />
    </div>
  );
}
