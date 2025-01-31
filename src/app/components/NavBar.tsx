import Link from "next/link";
export default function NavBar() {
  return (
    <div>
      <Link href="/">Home</Link>
      <Link href="/stats">Stats</Link>
      <Link href="/players">Communication</Link>
    </div>
  );

}
