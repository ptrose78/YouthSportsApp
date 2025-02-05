import Link from "next/link";

export default function NavBar() {
  return (
    <nav className="bg-gray-800 p-4"> 
      <div className="container mx-auto flex justify-between items-center"> 
        <div>
          <Link href="/scoreboard" className="text-white font-bold text-xl"> 
            GameTime
          </Link>
        </div>

        <div className="flex space-x-4"> 
          <Link
            href="/scoreboard"
            className="text-gray-300 hover:text-white px-3 py-2 rounded-md transition duration-300"
          >
            Scoreboard
          </Link>
          <Link
            href="/stats"
            className="text-gray-300 hover:text-white px-3 py-2 rounded-md transition duration-300"
          >
            Stats
          </Link>
          <Link
            href="/communication"
            className="text-gray-300 hover:text-white px-3 py-2 rounded-md transition duration-300"
          >
            Communication
          </Link>
        </div>
      </div>
    </nav>
  );
}